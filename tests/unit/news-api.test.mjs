import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createNewsApi } from '../../src/news/admin-api.server.ts';

const TOKEN = 'a'.repeat(48);

/** A real HTTP server on a random port, with its own content tree. */
async function start({ password, now } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'avyor-api-'));
  const paths = {
    published: join(root, 'news'),
    drafts: join(root, 'drafts'),
    media: join(root, 'media'),
    vercel: join(root, 'vercel.json'),
  };
  for (const dir of [paths.published, paths.drafts, paths.media]) mkdirSync(dir);
  writeFileSync(paths.vercel, JSON.stringify({ redirects: [] }));
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const api = createNewsApi({ paths, token: TOKEN, port, password, now });
  server.on('request', (req, res) =>
    api(req, res, () => {
      res.writeHead(404);
      res.end();
    }),
  );
  const call = (path, { method = 'GET', body, headers = {} } = {}) =>
    fetch(`http://127.0.0.1:${port}/__news/api${path}`, {
      method,
      headers: {
        'x-avyor-admin': TOKEN,
        ...(body && !(body instanceof Uint8Array) ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: body instanceof Uint8Array ? body : body ? JSON.stringify(body) : undefined,
    });
  return { server, port, paths, call };
}

test('sans le jeton de session, rien ne se lit ni ne s’écrit', async () => {
  const { server, call, paths } = await start();
  try {
    // Les brouillons sont privés : même la lecture est refusée.
    assert.equal((await call('/articles', { headers: { 'x-avyor-admin': '' } })).status, 403);
    assert.equal(
      (
        await call('/articles', {
          method: 'POST',
          body: { id: 'aaaa1111', locale: 'fr' },
          headers: { 'x-avyor-admin': 'faux' },
        })
      ).status,
      403,
    );
    assert.equal(readdirSync(paths.drafts).length, 0);
  } finally {
    server.close();
  }
});

test('une page d’un autre site ne peut pas piloter l’admin', async () => {
  const { server, call, paths } = await start();
  try {
    const response = await call('/articles', {
      method: 'POST',
      body: { id: 'aaaa1111', locale: 'fr' },
      headers: { origin: 'https://evil.example' },
    });
    assert.equal(response.status, 403);
    assert.equal(readdirSync(paths.drafts).length, 0);
  } finally {
    server.close();
  }
});

test('un nom d’hôte détourné est refusé (rebinding DNS)', async () => {
  const { server, port } = await start();
  try {
    // fetch fixe l'en-tête Host lui-même : on passe par http brut.
    const { request } = await import('node:http');
    const status = await new Promise((resolve) => {
      const req = request(
        {
          host: '127.0.0.1',
          port,
          path: '/__news/api/articles',
          headers: { host: `evil.example:${port}`, 'x-avyor-admin': TOKEN },
        },
        (res) => resolve(res.statusCode),
      );
      req.end();
    });
    assert.equal(status, 403);
  } finally {
    server.close();
  }
});

test('le parcours complet passe par l’API authentifiée', async () => {
  const { server, call } = await start();
  try {
    const created = await (
      await call('/articles', { method: 'POST', body: { id: 'aaaa1111', locale: 'fr' } })
    ).json();
    assert.equal(created.status, 'draft');
    const list = await (await call('/articles')).json();
    assert.equal(list.articles.length, 1);
    assert.equal(list.articles[0].state, 'draft');
  } finally {
    server.close();
  }
});

test('un lien javascript: dans le corps est refusé avant toute écriture', async () => {
  const { server, call } = await start();
  try {
    const draft = await (
      await call('/articles', { method: 'POST', body: { id: 'aaaa1111', locale: 'fr' } })
    ).json();
    const body = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'clic',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
      ],
    };
    const response = await call('/articles/aaaa1111', {
      method: 'PUT',
      body: { article: { ...draft, body }, expectedRevision: draft.revision },
    });
    assert.equal(response.status, 422);
    const { errors } = await response.json();
    assert.ok(errors.some((e) => /Lien refusé/.test(e.message)));
  } finally {
    server.close();
  }
});

test('une sauvegarde concurrente reçoit un conflit, pas un écrasement', async () => {
  const { server, call } = await start();
  try {
    const draft = await (
      await call('/articles', { method: 'POST', body: { id: 'aaaa1111', locale: 'fr' } })
    ).json();
    const save = (title) =>
      call('/articles/aaaa1111', {
        method: 'PUT',
        body: { article: { ...draft, title }, expectedRevision: draft.revision },
      });
    const statuses = (await Promise.all([save('A'), save('B')])).map((r) => r.status).sort();
    assert.deepEqual(statuses, [200, 409]);
  } finally {
    server.close();
  }
});

test('l’enregistrement fixe les ancres des titres', async () => {
  const { server, call } = await start();
  try {
    const draft = await (
      await call('/articles', { method: 'POST', body: { id: 'aaaa1111', locale: 'fr' } })
    ).json();
    const body = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Préparer le brief' }],
        },
      ],
    };
    const saved = await (
      await call('/articles/aaaa1111', {
        method: 'PUT',
        body: { article: { ...draft, body }, expectedRevision: draft.revision },
      })
    ).json();
    assert.equal(saved.body.content[0].attrs.id, 'preparer-le-brief');
  } finally {
    server.close();
  }
});

test('un corps de requête démesuré est refusé', async () => {
  const { server, call } = await start();
  try {
    const response = await call('/articles', {
      method: 'POST',
      body: { id: 'aaaa1111', locale: 'fr', padding: 'x'.repeat(3 * 1024 * 1024) },
    });
    assert.equal(response.status, 413);
  } finally {
    server.close();
  }
});

test('un envoi qui n’est pas une image est refusé', async () => {
  const { server, call } = await start();
  try {
    const response = await call('/media', {
      method: 'POST',
      body: new TextEncoder().encode('<svg onload="alert(1)"/>'),
      headers: { 'content-type': 'application/octet-stream', 'x-filename': 'x.svg' },
    });
    assert.equal(response.status, 422);
  } finally {
    server.close();
  }
});

/* ------------------------------------------------------------- mot de passe */

test('le jeton s’obtient contre le mot de passe, et seulement contre lui', async () => {
  const { server, call } = await start({ password: 'mot-de-passe-de-test' });
  try {
    const refuse = await call('/session', {
      method: 'POST',
      body: { password: 'presque-le-bon' },
      headers: { 'x-avyor-admin': '' },
    });
    assert.equal(refuse.status, 403);
    assert.equal((await refuse.json()).token, undefined);

    const ouvre = await call('/session', {
      method: 'POST',
      body: { password: 'mot-de-passe-de-test' },
      headers: { 'x-avyor-admin': '' },
    });
    assert.equal(ouvre.status, 200);
    const { token } = await ouvre.json();
    assert.equal(token, TOKEN);
    // Et ce jeton ouvre bien le reste.
    assert.equal((await call('/articles', { headers: { 'x-avyor-admin': token } })).status, 200);
  } finally {
    server.close();
  }
});

test('cinq essais ratés ferment la porte une minute', async () => {
  let instant = 1_000_000;
  const { server, call } = await start({ password: 'mot-de-passe-de-test', now: () => instant });
  const essai = (password) =>
    call('/session', { method: 'POST', body: { password }, headers: { 'x-avyor-admin': '' } });
  try {
    for (let i = 0; i < 5; i++) assert.equal((await essai('faux')).status, 403);
    // Même le bon mot de passe attend : sinon la limite ne limite rien.
    const bloque = await essai('mot-de-passe-de-test');
    assert.equal(bloque.status, 429);
    assert.match((await bloque.json()).message, /Trop de tentatives/);

    instant += 61_000;
    assert.equal((await essai('mot-de-passe-de-test')).status, 200);
  } finally {
    server.close();
  }
});

test('sans mot de passe configuré, l’admin ne s’ouvre pas du tout', async () => {
  // Défaut volontaire : pas de mot de passe, pas d’admin — jamais l’inverse.
  const { server, call, paths } = await start();
  try {
    const response = await call('/session', {
      method: 'POST',
      body: { password: '' },
      headers: { 'x-avyor-admin': '' },
    });
    assert.equal(response.status, 503);
    assert.match((await response.json()).message, /AVYOR_ADMIN_PASSWORD/);
    assert.equal(readdirSync(paths.drafts).length, 0);
  } finally {
    server.close();
  }
});
