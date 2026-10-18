import { createHmac, timingSafeEqual } from 'node:crypto';
import { initialStore } from '../src/model.ts';
import { validStore } from '../src/validation.ts';

const cookieName = 'non_session';
const lifetime = 60 * 60 * 24 * 30;
const compare = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const cas = `local old = redis.call('GET', KEYS[1])
local revision = 0
if old then revision = cjson.decode(old).revision end
if revision ~= tonumber(ARGV[1]) then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
return 1`;

export default { async fetch(request: Request): Promise<Response> {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  const reply = (data: unknown, status = 200) => Response.json(data, { status, headers });
  const password = process.env.WORKSPACE_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!password || !secret || !url || !token)
    return reply({ error: 'Online storage is not configured yet.' }, 503);
  const sign = (value: string) => createHmac('sha256', secret).update(value).digest('hex');
  const redis = async (command: (string | number)[]) => {
    const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Database unavailable');
    const body = await response.json() as { error?: string; result: unknown };
    if (body.error) throw new Error('Database error');
    return body.result;
  };
  if (!['GET', 'POST', 'PUT'].includes(request.method)) return reply({ error: 'Method not allowed' }, 405);
  if (request.method !== 'GET' && request.headers.get('origin') !== new URL(request.url).origin)
    return reply({ error: 'Invalid origin' }, 403);
  try {
    if (request.method === 'POST') {
      // Global limit also works across stateless function instances.
      const attempts = await redis(['EVAL', "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 60) end; return n", 1, 'non:login-attempts']);
      if (Number(attempts) > 20) return reply({ error: 'Too many attempts. Try again in a minute.' }, 429);
      const body = await request.json() as { password?: unknown };
      if (typeof body.password !== 'string' || !compare(body.password, password)) return reply({ error: 'Incorrect password.' }, 401);
      const expires = String(Math.floor(Date.now() / 1000) + lifetime);
      headers.set('Set-Cookie', `${cookieName}=${expires}.${sign(expires)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${lifetime}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`);
      return reply({ ok: true });
    }
    const session = request.headers.get('cookie')?.split('; ').find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || '';
    const [expires, signature] = session.split('.');
    if (!expires || !signature || Number(expires) <= Date.now() / 1000 || !compare(signature, sign(expires))) return reply({ error: 'Enter your password to continue.' }, 401);
    if (request.method === 'GET') {
      const raw = await redis(['GET', 'non:workspace:v1']);
      return reply(raw ? JSON.parse(String(raw)) : { revision: 0, data: initialStore() });
    }
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 1_000_000) return reply({ error: 'Workspace is too large.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return reply({ error: 'Invalid data.' }, 400); }
    if (!Number.isSafeInteger(body.revision) || body.revision < 0 || !validStore(body.data)) return reply({ error: 'Invalid data.' }, 400);
    const next = { revision: body.revision + 1, data: body.data };
    const saved = await redis(['EVAL', cas, 1, 'non:workspace:v1', body.revision, JSON.stringify(next)]);
    if (!saved) return reply({ error: 'This workspace changed on another page. Export your changes, then reload before editing.' }, 409);
    return reply(next);
  } catch {
    return reply({ error: 'Cannot reach online storage. Please try again.' }, 503);
  }
} };
