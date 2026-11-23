import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Проверяем тот же клиент, который собирает Vite, без браузера и реальной сети.
const compile = (source) =>
  "data:text/javascript;base64," +
  Buffer.from(
    ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    }).outputText,
  ).toString("base64");
const sessionUrl = compile(
  await readFile(new URL("../src/lib/session.ts", import.meta.url), "utf8"),
);
const clientSource = (
  await readFile(new URL("../src/api/client.ts", import.meta.url), "utf8")
)
  .replace(/["']\.\.\/lib\/session["']/, JSON.stringify(sessionUrl))
  .replace("import.meta.env", "({})");
class Storage {
  values = new Map();
  getItem(key) {
    return this.values.get(key) ?? null;
  }
  setItem(key, value) {
    this.values.set(key, value);
  }
  removeItem(key) {
    this.values.delete(key);
  }
}
globalThis.localStorage = new Storage();
globalThis.sessionStorage = new Storage();
globalThis.window = new EventTarget();
const { session } = await import(sessionUrl);
const clientUrl = compile(clientSource);
const { request, ApiError } = await import(clientUrl);
const profileSource = (
  await readFile(new URL("../src/api/profile.ts", import.meta.url), "utf8")
).replace(/["']\.\/client["']/, JSON.stringify(clientUrl));
const { getProfile, updateProfile } = await import(compile(profileSource));
const user = { id: "1", name: "Тест", email: "test@example.com" };
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status });
beforeEach(() => {
  session.clear();
  session.save("old-access", user, false, "old-refresh");
});

test("профиль сохраняется в API с full_name и читается обратно как fullName", async () => {
  const stored = {
    full_name: "Анна Иванова",
    specialization: "Разработчик",
    about: "",
  };
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (options.method === "PUT")
      assert.deepEqual(JSON.parse(options.body), stored);
    return json(stored);
  };
  const profile = {
    fullName: "Анна Иванова",
    specialization: "Разработчик",
    about: "",
  };
  assert.deepEqual(await updateProfile(profile), profile);
  assert.deepEqual(await getProfile(), profile);
  assert.equal(calls[0].url, "/api/v1/users/me/profile");
  assert.equal(calls[0].options.method, "PUT");
  assert.equal(
    calls[0].options.headers.get("Authorization"),
    "Bearer old-access",
  );
});

test("404 профиля означает новую анкету, ошибка сервера не заменяется демо-профилем", async () => {
  globalThis.fetch = async () => json({ detail: "Профиль не найден" }, 404);
  assert.equal(await getProfile(), null);
  globalThis.fetch = async () =>
    json({ error: { message: "Хранилище недоступно" } }, 503);
  await assert.rejects(
    getProfile(),
    (error) => error instanceof ApiError && error.status === 503,
  );
});

test("параллельные 401 используют одну ротацию и повторяют запрос с новым access", async () => {
  let refreshes = 0;
  const seen = [];
  globalThis.fetch = async (url, options) => {
    if (url.endsWith("/refresh")) {
      refreshes++;
      assert.equal(JSON.parse(options.body).refresh_token, "old-refresh");
      await new Promise((resolve) => setTimeout(resolve, 5));
      return json({ access_token: "new-access", refresh_token: "new-refresh" });
    }
    const token = options.headers.get("Authorization");
    seen.push(token);
    return token === "Bearer new-access"
      ? json({ ok: true })
      : json({ detail: "expired" }, 401);
  };
  assert.deepEqual(
    await Promise.all([request("/github/report"), request("/github/library")]),
    [{ ok: true }, { ok: true }],
  );
  assert.equal(refreshes, 1);
  assert.equal(seen.filter((value) => value === "Bearer new-access").length, 2);
  assert.equal(session.getRefreshToken(), "new-refresh");
});

test("204 не требует JSON и ошибка API сохраняет сообщение сервера", async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await request("/logout", { method: "POST" }, false), undefined);
  globalThis.fetch = async () =>
    json({ error: { code: "TEST", message: "GitHub недоступен" } }, 503);
  await assert.rejects(
    request("/github/repositories"),
    (error) =>
      error instanceof ApiError &&
      error.status === 503 &&
      error.message === "GitHub недоступен",
  );
});

test("отклонённый refresh очищает сессию и сообщает провайдеру авторизации", async () => {
  let expired = 0;
  window.addEventListener("resumehub:session-expired", () => expired++, {
    once: true,
  });
  globalThis.fetch = async () => json({ detail: "expired" }, 401);
  await assert.rejects(request("/github/report"), { status: 401 });
  assert.equal(session.getToken(), null);
  assert.equal(expired, 1);
});

test("поздний refresh не восстанавливает сессию после выхода", async () => {
  globalThis.fetch = async (url) => {
    if (!url.endsWith("/refresh")) return json({ detail: "expired" }, 401);
    session.clear();
    return json({ access_token: "late-access", refresh_token: "late-refresh" });
  };
  await assert.rejects(request("/github/report"), { status: 401 });
  assert.equal(session.getToken(), null);
});
