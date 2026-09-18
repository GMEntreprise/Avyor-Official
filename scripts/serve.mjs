import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
const root = resolve(process.env.SERVE_DIR || 'dist');
const port = Number(process.env.PORT || 4173);
/**
 * The redirects Vercel applies in production, applied here too so a changed
 * article address can be checked end to end before it is deployed. Sources
 * are literal paths in this project; nothing is interpreted as a pattern.
 */
const redirectsFor = async () => {
  try {
    const file = await readFile(process.env.REDIRECTS_FILE || 'vercel.json', 'utf8');
    return new Map(
      (JSON.parse(file).redirects ?? [])
        .filter((rule) => !/[:(*]/.test(rule.source))
        .map((rule) => [rule.source, rule]),
    );
  } catch {
    // Aucune redirection déclarée : rien à appliquer.
    return new Map();
  }
};
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    // Re-read each time: a publication in progress may have just changed them.
    const redirect = (await redirectsFor()).get(pathname);
    if (redirect) {
      res.writeHead(redirect.permanent ? 308 : 307, {
        Location: redirect.destination + url.search,
      });
      res.end();
      return;
    }
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + '/')) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      const s = await stat(file);
      if (s.isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(301, { Location: pathname + '/' + url.search });
          res.end();
          return;
        }
        file = resolve(file, 'index.html');
      }
      const data = await readFile(file);
      const compress =
        /gzip/.test(req.headers['accept-encoding'] || '') &&
        /\.(html|css|js|json|xml|txt|svg|webmanifest)$/.test(file);
      const payload = compress ? gzipSync(data) : data;
      res.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
        Vary: 'Accept-Encoding',
        ...(compress ? { 'Content-Encoding': 'gzip' } : {}),
        'Content-Length': payload.length,
      });
      res.end(req.method === 'HEAD' ? undefined : payload);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(await readFile(resolve(root, '404.html')));
    }
  } catch {
    res.writeHead(500);
    res.end('Server error');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
