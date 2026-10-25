// Dev-only static + save API server (Node) — dùng khi máy không có Python/uvicorn
// để chạy kiểm thử trình duyệt. Production vẫn chạy `samurai serve` (FastAPI + SQLite);
// API surface ở đây giống hệt server/main.py (health, saves CRUD) với lưu JSON file.
import http from 'node:http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'web', 'dist');
const dbFile = join(root, '.dev-saves.json');
mkdirSync(dist, { recursive: true });

const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.json': 'application/json' };

function loadDb() { try { return JSON.parse(readFileSync(dbFile, 'utf8')); } catch { return {}; } }
function saveDb(db) { try { writeFileSync(dbFile, JSON.stringify(db)); } catch {} }

function validate(body) {
  if (typeof body !== 'object' || body === null) throw new Error('payload must be a JSON object');
  if (!Number.isInteger(body.version) || body.version < 1) throw new Error('version must be a positive integer');
  const d = body.data;
  if (!d || typeof d !== 'object') throw new Error('data must be a JSON object');
  for (const k of ['meta', 'player', 'progress']) if (typeof d[k] !== 'object' || d[k] === null) throw new Error(`data missing keys: ${k}`);
  return body;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: 'dev-node', database: existsSync(dbFile) ? dbFile : 'not created yet' }));
    return;
  }
  const saveMatch = path.match(/^\/api\/saves\/([\w-]{1,32})$/);
  if (path === '/api/saves' && req.method === 'GET') {
    const db = loadDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ saves: Object.entries(db).map(([slot, v]) => ({ slot, level: v.data?.player?.level || 0, playtime: v.data?.meta?.playtime || 0, updated_at: v.data?.meta?.savedAt ? v.data.meta.savedAt / 1000 : 0 })) }));
    return;
  }
  if (saveMatch) {
    const slot = saveMatch[1];
    const db = loadDb();
    if (req.method === 'POST') {
      let raw = '';
      req.on('data', (c) => { raw += c; if (raw.length > 2 * 1024 * 1024) req.destroy(); });
      req.on('end', () => {
        try {
          const body = validate(JSON.parse(raw));
          db[slot] = { version: body.version, data: body.data, updated_at: Date.now() / 1000 };
          saveDb(db);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, slot }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ detail: String(e.message || e) }));
        }
      });
      return;
    }
    if (req.method === 'GET') {
      const v = db[slot];
      if (!v) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ detail: 'save not found' })); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ slot, version: v.version, data: v.data, updated_at: v.updated_at }));
      return;
    }
    if (req.method === 'DELETE') {
      delete db[slot]; saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
  }
  // static
  let file = path === '/' ? '/index.html' : path;
  const fp = join(dist, file);
  if (!existsSync(fp)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(fp)] || 'application/octet-stream' });
  res.end(readFileSync(fp));
});

const port = Number(process.env.DEV_PORT || 8080);
server.listen(port, () => console.log(`[dev-server] http://127.0.0.1:${port} (serve ${dist})`));
