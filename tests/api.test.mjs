import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const makeStorage = () => {
  const items = new Map();
  return { getItem: key => items.get(key) ?? null, setItem: (key, val) => items.set(key, val), removeItem: key => items.delete(key) };
};

test('API refresh is shared, rotates tokens, handles 204 and expires sessions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'resumehub-client-'));
  const originalFetch = globalThis.fetch;
  try {
    globalThis.localStorage = makeStorage();
    globalThis.sessionStorage = makeStorage();
    globalThis.window = new EventTarget();
    for (const [source, target] of [['src/lib/session.ts', 'session.mjs'], ['src/api/client.ts', 'client.mjs'], ['src/api/auth.ts', 'auth.mjs']]) {
      let code = await readFile(new URL(`../${source}`, import.meta.url), 'utf8');
      code = code.replace("'../lib/session'", "'./session.mjs'").replace("'./client'", "'./client.mjs'").replaceAll('import.meta.env.VITE_API_URL', 'undefined');
      await writeFile(join(directory, target), ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
    }
    const { session } = await import(pathToFileURL(join(directory, 'session.mjs')));
    const { request, ApiError } = await import(pathToFileURL(join(directory, 'client.mjs')));
    const { loginRequest } = await import(pathToFileURL(join(directory, 'auth.mjs')));
    session.save('old', { id: '1', name: 'Test', email: 'test@example.com' }, false, 'refresh-old');
    let refreshes = 0;
    globalThis.fetch = async (url, options) => {
      if (url.endsWith('/refresh')) {
        refreshes++;
        await new Promise(resolve => setTimeout(resolve, 15));
        assert.equal(JSON.parse(options.body).refresh_token, 'refresh-old');
        return Response.json({ access_token: 'new', refresh_token: 'refresh-new' });
      }
      return options.headers.get('Authorization') === 'Bearer new' ? Response.json({ ok: true }) : Response.json({}, { status: 401 });
    };
    assert.deepEqual(await Promise.all([request('/resumes'), request('/projects')]), [{ ok: true }, { ok: true }]);
    assert.equal(refreshes, 1);
    assert.equal(session.getRefreshToken(), 'refresh-new');
    assert.equal(localStorage.getItem('rh_token'), null);
    globalThis.fetch = async () => new Response(null, { status: 204 });
    assert.equal(await request('/resumes/1', { method: 'DELETE' }), undefined);
    globalThis.fetch = async () => Response.json({ detail: 'PDF пока недоступен' }, { status: 501 });
    await assert.rejects(request('/pdf'), e => e instanceof ApiError && e.status === 501 && e.message === 'PDF пока недоступен');
    globalThis.fetch = async (url, options) => {
      if (url.endsWith('/login')) return Response.json({ access_token: 'login-token', refresh_token: 'login-refresh' });
      assert.equal(options.headers.get('Authorization'), 'Bearer login-token');
      return Response.json({ id: 7, name: 'Анна', email: 'a@example.com' });
    };
    const auth = await loginRequest({ email: 'a@example.com', password: 'password', remember: true });
    assert.equal(auth.user.id, '7');
    assert.equal(auth.refreshToken, 'login-refresh');
    let cleared = false;
    window.addEventListener('rh-session-cleared', () => { cleared = true; });
    globalThis.fetch = async () => Response.json({ error: { message: 'Сессия истекла' } }, { status: 401 });
    await assert.rejects(request('/resumes'), /Сессия истекла/);
    assert.equal(session.getToken(), null);
    assert.equal(cleared, true);
  } finally {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  }
});
