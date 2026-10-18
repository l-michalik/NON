import test from 'node:test';
import assert from 'node:assert/strict';
import api from '../api/workspace.ts';
import { initialStore } from '../src/model.ts';
import { validStore } from '../src/validation.ts';

test('workspace starts empty and rejects malformed or demo data', () => {
  assert.deepEqual(initialStore(), { version: 1, demo: false, habits: [], rules: [] });
  assert.equal(validStore(initialStore()), true);
  assert.equal(validStore({ ...initialStore(), demo: true }), false);
  assert.equal(validStore({ ...initialStore(), habits: [null] }), false);
});

test('authenticated API persists data, rejects stale writes and protects access', async () => {
  const oldEnv = { ...process.env };
  const oldFetch = globalThis.fetch;
  Object.assign(process.env, { WORKSPACE_PASSWORD: 'test-password', SESSION_SECRET: 'test-secret', UPSTASH_REDIS_REST_URL: 'https://redis.test', UPSTASH_REDIS_REST_TOKEN: 'test-token' });
  let record = null;
  globalThis.fetch = async (_url, options) => {
    const command = JSON.parse(options.body);
    let result;
    if (command[0] === 'GET') result = record;
    else if (command[3] === 'non:login-attempts') result = 1;
    else {
      const revision = record ? JSON.parse(record).revision : 0;
      result = revision === command[4] ? 1 : 0;
      if (result) record = command[5];
    }
    return Response.json({ result });
  };
  let cookie = '';
  const request = (method = 'GET', body, origin = 'https://non.test') => api.fetch(new Request('https://non.test/api/workspace', {
    method, headers: { origin, cookie, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}),
  }));
  try {
    assert.equal((await request()).status, 401);
    assert.equal((await request('POST', { password: 'wrong' })).status, 401);
    const login = await request('POST', { password: 'test-password' });
    assert.equal(login.status, 200);
    assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
    cookie = login.headers.get('set-cookie').split(';')[0];
    assert.deepEqual(await (await request()).json(), { revision: 0, data: initialStore() });
    const data = { ...initialStore(), rules: [{ id: 'my-rule', name: 'My rule', note: '', from: '', to: '' }] };
    assert.equal((await request('PUT', { revision: 0, data }, 'https://evil.test')).status, 403);
    assert.equal((await request('PUT', { revision: 0, data: { ...data, habits: [null] } })).status, 400);
    assert.equal((await request('PUT', { revision: 0, data })).status, 200);
    assert.deepEqual(await (await request()).json(), { revision: 1, data });
    assert.equal((await request('PUT', { revision: 0, data: initialStore() })).status, 409);
    assert.deepEqual((await (await request()).json()).data, data);
    cookie += 'tampered';
    assert.equal((await request()).status, 401);
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.equal((await request()).status, 503);
  } finally {
    globalThis.fetch = oldFetch;
    for (const key of ['WORKSPACE_PASSWORD', 'SESSION_SECRET', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']) {
      if (oldEnv[key] === undefined) delete process.env[key]; else process.env[key] = oldEnv[key];
    }
  }
});
