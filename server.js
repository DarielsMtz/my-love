#!/usr/bin/env node
/**
 * Servidor local para la galería Evy.
 *
 *  - Sirve los archivos estáticos (index.html, src/, assets/, etc.).
 *  - Expone una pequeña API de administración para:
 *      GET  /api/photos          → devuelve el listado editable de fotos + orden de álbumes
 *      POST /api/photos          → reescribe src/data.js con el nuevo orden / metadatos
 *      POST /api/upload          → guarda una foto/vídeo nuevo en assets/fotos/
 *
 * No usa dependencias externas: solo módulos nativos de Node.
 * Uso:  node server.js   →   http://localhost:8000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const FOTOS_DIR = path.join(ROOT, 'assets', 'fotos');
const DATA_FILE = path.join(ROOT, 'src', 'data.js');
const PORT = process.env.PORT || 8000;

/* ── Tipos MIME ─────────────────────────────────────────── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
};

/* ── Utilidades ─────────────────────────────────────────── */
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req, limit = 200 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('Cuerpo demasiado grande'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/* ── Extraer el array RAW_PHOTOS de data.js (evaluación segura) ── */
function loadPhotosFromData() {
  const source = fs.readFileSync(DATA_FILE, 'utf8');
  const start = source.indexOf('const RAW_PHOTOS = [');
  if (start === -1) throw new Error('No se encontró RAW_PHOTOS en data.js');
  const arrStart = source.indexOf('[', start);
  // Buscar el ']' que cierra el array (balance de corchetes, ignorando strings).
  let depth = 0;
  let i = arrStart;
  let inStr = null;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) break; }
  }
  const arrText = source.slice(arrStart, i + 1);
  // eslint-disable-next-line no-new-func
  const photos = Function(`"use strict"; return (${arrText});`)();

  // Orden de álbumes
  const orderMatch = source.match(/const ALBUM_ORDER = (\[[^\]]*\])/);
  const albumOrder = orderMatch
    ? Function(`"use strict"; return (${orderMatch[1]});`)()
    : [];

  return { photos, albumOrder };
}

/* ── Serializar una entrada de foto de forma legible ────── */
function serializePhoto(p) {
  const parts = [`id: ${JSON.stringify(p.id)}`];
  if (p.type) parts.push(`type: ${JSON.stringify(p.type)}`);
  parts.push(`aspect: ${JSON.stringify(p.aspect || 'portrait')}`);
  parts.push(`album: ${JSON.stringify(p.album)}`);
  parts.push(`country: ${JSON.stringify(p.country || '')}`);
  parts.push(`place: ${JSON.stringify(p.place || '')}`);
  parts.push(`title: ${JSON.stringify(p.title || '')}`);
  parts.push(`desc: ${JSON.stringify(p.desc || '')}`);
  return `  { ${parts.join(', ')} },`;
}

/* ── Reescribir data.js conservando todo salvo los dos bloques ── */
function writeDataFile(photos, albumOrder) {
  const source = fs.readFileSync(DATA_FILE, 'utf8');

  // 1) Reemplazar el array RAW_PHOTOS
  const rawStart = source.indexOf('const RAW_PHOTOS = [');
  const arrStart = source.indexOf('[', rawStart);
  let depth = 0, i = arrStart, inStr = null;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (inStr) { if (ch === '\\') { i++; continue; } if (ch === inStr) inStr = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) break; }
  }
  const newArray = '[\n' + photos.map(serializePhoto).join('\n') + '\n]';
  let out = source.slice(0, arrStart) + newArray + source.slice(i + 1);

  // 2) Reemplazar ALBUM_ORDER
  const newOrder = 'const ALBUM_ORDER = ' + JSON.stringify(albumOrder).replace(/,/g, ', ') + ';';
  out = out.replace(/const ALBUM_ORDER = \[[^\]]*\];/, newOrder);

  fs.writeFileSync(DATA_FILE, out, 'utf8');
}

/* ── Nombre de archivo seguro y único ───────────────────── */
function safeUniqueName(originalName) {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const base = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'foto';
  let name = `${base}${ext}`;
  let n = 1;
  while (fs.existsSync(path.join(FOTOS_DIR, name))) {
    name = `${base} (${n})${ext}`;
    n++;
  }
  return name;
}

/* ── Servir archivos estáticos ──────────────────────────── */
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Prohibido'); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    // Soporte de Range para vídeo/audio
    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.webm' || ext === '.mov' || ext === '.mp3')) {
      const [s, e] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(s, 10);
      const end = e ? parseInt(e, 10) : stat.size - 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': mime,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { 'Content-Type': mime, 'Content-Length': stat.size });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ── Servidor ───────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  try {
    // API: sonda de disponibilidad (usada por el panel de admin)
    if (req.method === 'HEAD' && req.url === '/api/photos') {
      res.writeHead(200); res.end(); return;
    }

    // API: obtener fotos
    if (req.method === 'GET' && req.url === '/api/photos') {
      const { photos, albumOrder } = loadPhotosFromData();
      sendJson(res, 200, { photos, albumOrder });
      return;
    }

    // API: guardar fotos (reordenar / editar metadatos)
    if (req.method === 'POST' && req.url === '/api/photos') {
      const body = await readBody(req);
      const { photos, albumOrder } = JSON.parse(body.toString('utf8'));
      if (!Array.isArray(photos)) {
        sendJson(res, 400, { error: 'Formato inválido: se esperaba un array de fotos' });
        return;
      }
      writeDataFile(photos, Array.isArray(albumOrder) ? albumOrder : []);
      sendJson(res, 200, { ok: true, count: photos.length });
      return;
    }

    // API: subir foto/vídeo nuevo
    if (req.method === 'POST' && req.url === '/api/upload') {
      const fileName = decodeURIComponent(req.headers['x-file-name'] || 'foto.jpg');
      const body = await readBody(req);
      if (!body.length) {
        sendJson(res, 400, { error: 'Archivo vacío' });
        return;
      }
      if (!fs.existsSync(FOTOS_DIR)) fs.mkdirSync(FOTOS_DIR, { recursive: true });
      const finalName = safeUniqueName(fileName);
      fs.writeFileSync(path.join(FOTOS_DIR, finalName), body);
      sendJson(res, 200, { ok: true, id: `assets/fotos/${finalName}` });
      return;
    }

    // Resto: archivos estáticos
    serveStatic(req, res);
  } catch (err) {
    console.error('[Evy] Error:', err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n  🖼  Galería Evy corriendo en  http://localhost:${PORT}`);
  console.log(`     Panel de administración: pulsa la ✎ (abajo a la derecha) o añade #admin a la URL\n`);
});
