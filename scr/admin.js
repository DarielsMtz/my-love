/**
 * Panel de administración de la galería Evy.
 *
 * Solo funciona cuando la web se sirve desde el servidor Node (server.js),
 * porque necesita la API /api/photos y /api/upload para escribir en disco.
 *
 * Activación:  botón flotante ✎  ·  o añadir  #admin  a la URL.
 */

import { isVideo, mediaSrc } from './helpers.js';

/**
 * El panel solo funciona con el servidor Node local (server.js).
 * Comprobamos de verdad que la API responde antes de mostrar nada,
 * así en producción (Vercel, hosting estático) el panel queda oculto.
 */
async function apiIsAvailable() {
  try {
    const r = await fetch('/api/photos', { method: 'HEAD' });
    return r.ok;
  } catch {
    return false;
  }
}

let state = { photos: [], albumOrder: [] };
let dirty = false;

/* ── API ────────────────────────────────────────────────── */
async function apiGetPhotos() {
  const r = await fetch('/api/photos');
  if (!r.ok) throw new Error('No se pudo cargar el listado');
  return r.json();
}

async function apiSavePhotos(payload) {
  const r = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Error al guardar');
  return r.json();
}

async function apiUpload(file) {
  const r = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
    },
    body: file,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Error al subir');
  return r.json();
}

/* ── Helpers de estado ──────────────────────────────────── */
function albumNames() {
  const set = new Set(state.photos.map((p) => p.album));
  const ordered = [...state.albumOrder.filter((a) => set.has(a))];
  for (const a of set) if (!ordered.includes(a)) ordered.push(a);
  return ordered;
}

function setDirty(v) {
  dirty = v;
  const btn = document.getElementById('adminSave');
  if (btn) {
    btn.disabled = !v;
    btn.textContent = v ? 'Guardar cambios' : 'Guardado ✓';
  }
}

/* ── Construir la UI del panel ──────────────────────────── */
function buildPanel() {
  const overlay = document.createElement('div');
  overlay.id = 'admin-panel';
  overlay.className = 'admin-panel';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Administrar galería');
  overlay.innerHTML = `
    <div class="admin-box">
      <header class="admin-header">
        <div>
          <span class="admin-eyebrow">Modo edición</span>
          <h2 class="admin-title">Organizar galería</h2>
        </div>
        <div class="admin-header-actions">
          <button id="adminSave" class="admin-btn admin-btn--primary" disabled>Guardado ✓</button>
          <button id="adminClose" class="admin-btn admin-btn--ghost" aria-label="Cerrar">✕</button>
        </div>
      </header>

      <div class="admin-toolbar">
        <label class="admin-upload">
          <input type="file" id="adminUpload" accept="image/*,video/*" multiple hidden />
          <span class="admin-btn admin-btn--accent">＋ Subir fotos / vídeos</span>
        </label>
        <div class="admin-filter">
          <label for="adminAlbumFilter">Álbum:</label>
          <select id="adminAlbumFilter"></select>
        </div>
        <span class="admin-hint">Arrastra ⠿ para reordenar dentro del álbum</span>
      </div>

      <div class="admin-list-wrap">
        <ul id="adminList" class="admin-list"></ul>
      </div>

      <p id="adminStatus" class="admin-status"></p>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
  document.getElementById('adminClose').addEventListener('click', closePanel);
  document.getElementById('adminSave').addEventListener('click', save);
  document.getElementById('adminUpload').addEventListener('change', onUpload);
  document.getElementById('adminAlbumFilter').addEventListener('change', renderList);
}

function status(msg, isError = false) {
  const el = document.getElementById('adminStatus');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('admin-status--error', isError);
  if (msg && !isError) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 4000);
}

/* ── Filtro de álbumes ──────────────────────────────────── */
function refreshAlbumFilter() {
  const sel = document.getElementById('adminAlbumFilter');
  const prev = sel.value;
  const names = albumNames();
  sel.innerHTML =
    `<option value="__all__">Todos los álbumes</option>` +
    names.map((n) => `<option value="${escAttr(n)}">${escHtml(n)}</option>`).join('');
  if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

/* ── Render de la lista ─────────────────────────────────── */
function renderList() {
  const list = document.getElementById('adminList');
  const filter = document.getElementById('adminAlbumFilter').value;
  list.innerHTML = '';

  const names = filter === '__all__' ? albumNames() : [filter];

  names.forEach((album) => {
    const header = document.createElement('li');
    header.className = 'admin-album-header';
    header.textContent = album;
    list.appendChild(header);

    const photos = state.photos.filter((p) => p.album === album);
    photos.forEach((photo) => list.appendChild(buildRow(photo)));
    if (!photos.length) {
      const empty = document.createElement('li');
      empty.className = 'admin-empty';
      empty.textContent = 'Sin fotos en este álbum';
      list.appendChild(empty);
    }
  });
}

function buildRow(photo) {
  const li = document.createElement('li');
  li.className = 'admin-row';
  li.draggable = true;
  li.dataset.id = photo.id;

  // Miniatura
  const thumb = document.createElement('div');
  thumb.className = 'admin-thumb';
  if (isVideo(photo)) {
    thumb.innerHTML = '<span class="admin-thumb-video">▶</span>';
    thumb.style.background = '#222';
  } else {
    const img = document.createElement('img');
    img.src = mediaSrc(photo.id, 120, 120);
    img.alt = '';
    img.loading = 'lazy';
    thumb.appendChild(img);
  }

  // Handle de arrastre
  const handle = document.createElement('span');
  handle.className = 'admin-drag';
  handle.textContent = '⠿';
  handle.title = 'Arrastrar para reordenar';

  // Campos editables
  const fields = document.createElement('div');
  fields.className = 'admin-fields';
  fields.innerHTML = `
    <input class="admin-input admin-input--title" data-field="title" value="${escAttr(photo.title || '')}" placeholder="Título" />
    <div class="admin-field-row">
      <select class="admin-input admin-input--album" data-field="album"></select>
      <input class="admin-input admin-input--sm" data-field="place" value="${escAttr(photo.place || '')}" placeholder="Lugar" />
      <input class="admin-input admin-input--sm" data-field="country" value="${escAttr(photo.country || '')}" placeholder="País" />
    </div>
    <textarea class="admin-input admin-input--desc" data-field="desc" rows="2" placeholder="Descripción">${escHtml(photo.desc || '')}</textarea>
  `;

  // Selector de álbum (permite crear nuevo)
  const albumSel = fields.querySelector('[data-field="album"]');
  const names = albumNames();
  albumSel.innerHTML =
    names.map((n) => `<option value="${escAttr(n)}"${n === photo.album ? ' selected' : ''}>${escHtml(n)}</option>`).join('') +
    `<option value="__new__">＋ Nuevo álbum…</option>`;

  albumSel.addEventListener('change', () => {
    if (albumSel.value === '__new__') {
      const name = prompt('Nombre del nuevo álbum:');
      if (name && name.trim()) {
        photo.album = name.trim();
        if (!state.albumOrder.includes(photo.album)) state.albumOrder.push(photo.album);
        setDirty(true);
        refreshAlbumFilter();
        renderList();
      } else {
        albumSel.value = photo.album;
      }
      return;
    }
    photo.album = albumSel.value;
    setDirty(true);
    refreshAlbumFilter();
    renderList();
  });

  fields.querySelectorAll('[data-field]').forEach((input) => {
    if (input.dataset.field === 'album') return;
    input.addEventListener('input', () => {
      photo[input.dataset.field] = input.value;
      setDirty(true);
    });
  });

  // Botón eliminar
  const del = document.createElement('button');
  del.className = 'admin-del';
  del.textContent = '🗑';
  del.title = 'Quitar de la galería';
  del.addEventListener('click', () => {
    if (!confirm(`¿Quitar "${photo.title || photo.id}" de la galería?\n(El archivo NO se borra del disco.)`)) return;
    state.photos = state.photos.filter((p) => p !== photo);
    setDirty(true);
    refreshAlbumFilter();
    renderList();
  });

  li.append(handle, thumb, fields, del);
  attachDrag(li);
  return li;
}

/* ── Drag & drop para reordenar ─────────────────────────── */
let dragEl = null;

function attachDrag(li) {
  li.addEventListener('dragstart', (e) => {
    dragEl = li;
    li.classList.add('admin-row--dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  li.addEventListener('dragend', () => {
    li.classList.remove('admin-row--dragging');
    dragEl = null;
    commitOrderFromDom();
  });
  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dragEl || dragEl === li) return;
    const rect = li.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    li.parentNode.insertBefore(dragEl, after ? li.nextSibling : li);
  });
}

/**
 * Tras un arrastre, reconstruye state.photos según el orden visual del DOM,
 * respetando las cabeceras de álbum (una foto adopta el álbum de su cabecera).
 */
function commitOrderFromDom() {
  const list = document.getElementById('adminList');
  const items = [...list.children];
  const filter = document.getElementById('adminAlbumFilter').value;

  // Mapa id → foto
  const byId = new Map(state.photos.map((p) => [p.id, p]));

  // Recorrer el DOM: las cabeceras marcan el álbum activo
  const visualOrder = [];
  let currentAlbum = filter === '__all__' ? null : filter;
  for (const el of items) {
    if (el.classList.contains('admin-album-header')) {
      currentAlbum = el.textContent;
    } else if (el.classList.contains('admin-row')) {
      const photo = byId.get(el.dataset.id);
      if (!photo) continue;
      if (currentAlbum && photo.album !== currentAlbum) {
        photo.album = currentAlbum; // arrastrada a otro álbum
      }
      visualOrder.push(photo);
    }
  }

  // Fotos que no están en la vista actual (otros álbumes filtrados) se conservan al final,
  // manteniendo su posición relativa original.
  const shown = new Set(visualOrder);
  const rest = state.photos.filter((p) => !shown.has(p));

  // Reconstruir agrupando por orden de álbumes para que data.js quede coherente.
  state.photos = mergeByAlbumOrder([...visualOrder, ...rest]);
  setDirty(true);
  refreshAlbumFilter();
  renderList();
}

/** Agrupa las fotos por álbum siguiendo albumNames(), conservando orden interno. */
function mergeByAlbumOrder(photos) {
  const names = [...new Set([...albumNames(), ...photos.map((p) => p.album)])];
  const out = [];
  for (const name of names) {
    for (const p of photos) if (p.album === name) out.push(p);
  }
  return out;
}

/* ── Subida de archivos ─────────────────────────────────── */
async function onUpload(e) {
  const files = [...e.target.files];
  e.target.value = '';
  if (!files.length) return;

  const filter = document.getElementById('adminAlbumFilter').value;
  const defaultAlbum = filter !== '__all__' ? filter : albumNames()[0] || 'Nuevo';

  for (const file of files) {
    status(`Subiendo ${file.name}…`);
    try {
      const { id } = await apiUpload(file);
      const isVid = /\.(mp4|webm|mov)$/i.test(id);
      const photo = {
        id,
        aspect: 'portrait',
        album: defaultAlbum,
        country: '',
        place: '',
        title: file.name.replace(/\.[^.]+$/, ''),
        desc: '',
      };
      if (isVid) photo.type = 'video';
      state.photos.push(photo);
      setDirty(true);
    } catch (err) {
      status(`Error al subir ${file.name}: ${err.message}`, true);
    }
  }
  status(`${files.length} archivo(s) añadido(s). Recuerda pulsar «Guardar cambios».`);
  state.photos = mergeByAlbumOrder(state.photos);
  refreshAlbumFilter();
  renderList();
}

/* ── Guardar ────────────────────────────────────────────── */
async function save() {
  status('Guardando…');
  try {
    // Ordenar albumOrder según el orden de aparición actual
    const order = albumNames();
    await apiSavePhotos({ photos: state.photos, albumOrder: order });
    state.albumOrder = order;
    setDirty(false);
    status('Cambios guardados en data.js. Recarga la galería para verlos.');
  } catch (err) {
    status('Error al guardar: ' + err.message, true);
  }
}

/* ── Abrir / cerrar ─────────────────────────────────────── */
async function openPanel() {
  let panel = document.getElementById('admin-panel');
  if (!panel) buildPanel();
  status('Cargando…');
  try {
    state = await apiGetPhotos();
    if (!Array.isArray(state.albumOrder)) state.albumOrder = [];
    setDirty(false);
    refreshAlbumFilter();
    renderList();
    status('');
  } catch (err) {
    status('No se pudo cargar: ' + err.message, true);
  }
  document.getElementById('admin-panel').classList.add('open');
}

function closePanel() {
  if (dirty && !confirm('Tienes cambios sin guardar. ¿Cerrar de todos modos?')) return;
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.remove('open');
}

/* ── Escapes ────────────────────────────────────────────── */
function escHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
function escAttr(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ── Botón flotante + atajo #admin ──────────────────────── */
export async function initAdmin() {
  // Sin servidor Node (p. ej. en Vercel) no mostramos el panel.
  if (!(await apiIsAvailable())) return;

  const btn = document.createElement('button');
  btn.id = 'adminFab';
  btn.className = 'admin-fab';
  btn.title = 'Organizar galería (modo edición)';
  btn.setAttribute('aria-label', 'Abrir panel de administración');
  btn.innerHTML = '✎';
  btn.addEventListener('click', openPanel);
  document.body.appendChild(btn);

  if (location.hash === '#admin') openPanel();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('admin-panel');
      if (panel && panel.classList.contains('open')) closePanel();
    }
  });
}
