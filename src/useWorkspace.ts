import { useCallback, useEffect, useRef, useState } from 'react';
import { initialStore } from './model';
import type { Store } from './model';
import { validStore } from './validation';

export function useWorkspace() {
  const [store, setStore] = useState<Store>(initialStore);
  const [ready, setReady] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Opening workspace…');
  const revision = useRef(0);
  const saved = useRef(store);
  const latest = useRef(store);
  const busy = useRef(false);
  const failed = useRef(false);
  useEffect(() => { latest.current = store; }, [store]);
  const load = useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/api/workspace', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (response.status === 401) { setNeedsLogin(true); return; }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      if (!validStore(body.data) || !Number.isSafeInteger(body.revision)) throw new Error('Saved data could not be read.');
      revision.current = body.revision;
      saved.current = body.data;
      setStore(body.data);
      setNeedsLogin(false);
      setReady(true);
      setStatus('Saved online');
    } catch (e) { setError(e instanceof Error ? e.message : 'Cannot open workspace.'); setStatus('Workspace unavailable'); }
  }, []);
  // Load the remote workspace before allowing edits.
  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  const save = useCallback(async () => {
    if (busy.current || failed.current) return;
    busy.current = true;
    try {
      while (latest.current !== saved.current) {
        const data = latest.current;
        setStatus('Saving…');
        const response = await fetch('/api/workspace', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: revision.current, data }), signal: AbortSignal.timeout(15000) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        revision.current = body.revision;
        saved.current = data;
      }
      setError('');
      setStatus('Saved online');
    } catch (e) {
      failed.current = true;
      setStatus('Changes not saved');
      setError(`${e instanceof Error ? e.message : 'Save failed.'} Keep this page open or export a backup in Settings & data.`);
    } finally { busy.current = false; }
  }, []);
  useEffect(() => { if (ready && store !== saved.current) void save(); }, [store, ready, save]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (latest.current !== saved.current) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  const login = async (password: string) => {
    setError('');
    try {
      const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Cannot sign in.'); }
  };
  return { store, setStore, status, error, ready, needsLogin, login, retry: () => { failed.current = false; void (ready ? save() : load()); } };
}
