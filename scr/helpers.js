const cursorEl = document.getElementById('cursor');

export const mobile = () => window.innerWidth < 600;
export const tablet = () => window.innerWidth < 900;
export const cx = () => window.innerWidth / 2;
export const cy = () => window.innerHeight / 2;
export const maxR = () =>
  Math.max(window.innerWidth, window.innerHeight) * (mobile() ? 0.52 : 0.65);

export function addKeyboardActivation(el, callback) {
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  });
  el.addEventListener('click', callback);
}

export function getRatio(data) {
  if (data.ratio) return data.ratio;
  return data.aspect === 'landscape' ? 4 / 3 : 3 / 4;
}

export function photoSize(data) {
  const s = mobile() ? 0.52 : tablet() ? 0.7 : 1;
  const v = 0.75 + Math.random() * 0.45;
  const ratio = getRatio(data);
  const base = 200 * s * v;
  if (ratio >= 1) return { w: Math.round(base * ratio), h: Math.round(base) };
  return { w: Math.round(base), h: Math.round(base / ratio) };
}

export function applyMediaAspect(el, data) {
  el.style.aspectRatio = `${getRatio(data)}`;
}

export function isVideo(data) {
  return data.type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(data.id || '');
}

export function mediaSrc(id, w, h) {
  if (id && (id.startsWith('data:') || id.startsWith('assets/'))) return id;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
}

export function albumMediaLabel(items) {
  const photos = items.filter((p) => !isVideo(p)).length;
  const videos = items.filter((p) => isVideo(p)).length;
  const parts = [];
  if (photos) parts.push(`${photos} foto${photos === 1 ? '' : 's'}`);
  if (videos) parts.push(`${videos} vídeo${videos === 1 ? '' : 's'}`);
  return parts.join(' · ') || '0 archivos';
}

export function fillMediaThumb(container, data, w, h, { autoplay = false } = {}) {
  container.innerHTML = '';
  container.classList.add('media-frame');
  applyMediaAspect(container, data);
  if (isVideo(data)) {
    const video = document.createElement('video');
    video.src = mediaSrc(data.id);
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (autoplay) video.autoplay = true;
    video.setAttribute('aria-label', data.title);
    container.appendChild(video);
    const badge = document.createElement('span');
    badge.className = 'media-play-badge';
    badge.textContent = '\u25B6';
    container.appendChild(badge);
  } else {
    const img = document.createElement('img');
    img.src = mediaSrc(data.id, w, h);
    img.alt = data.title;
    img.loading = 'lazy';
    img.draggable = false;
    img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    container.appendChild(img);
  }
}

export function initCursor() {
  if (!cursorEl || !matchMedia('(hover:hover)').matches) return;
  document.addEventListener('mousemove', (e) => {
    cursorEl.style.cssText = `left:${e.clientX}px;top:${e.clientY}px`;
  });
}

export function withHover(el) {
  if (!cursorEl) return;
  el.addEventListener('mouseenter', () => cursorEl.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorEl.classList.remove('hover'));
}
