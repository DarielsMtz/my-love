import { getPublicPhotos } from './data.js';
import { mobile, cx, cy, maxR, photoSize, fillMediaThumb, addKeyboardActivation, withHover, isVideo } from './helpers.js';
import { openLb } from './lightbox.js';

const stage = document.getElementById('stage');
const spawnPool = getPublicPhotos();
let idx = 0;
const INTERVAL = mobile() ? 1100 : 850;
const TRAVEL = mobile() ? 4000 : 4800;

function spawn() {
  if (!spawnPool.length || !stage) return;
  const data = spawnPool[idx++ % spawnPool.length];
  const { w, h } = photoSize(data);
  const angle = Math.random() * Math.PI * 2;
  const r0 = (Math.random() - 0.5) * 9;
  const r1 = r0 + (Math.random() - 0.5) * 14;

  const card = document.createElement('div');
  card.className = 'photo-card';
  Object.assign(card.style, {
    width: w + 'px',
    height: h + 'px',
    left: cx() - w / 2 + 'px',
    top: cy() - h / 2 + 'px',
    transform: `rotate(${r0}deg)`,
  });

  const thumb = document.createElement('div');
  thumb.className = 'card-thumb';
  fillMediaThumb(thumb, data, w * 2, h * 2, { autoplay: isVideo(data) });

  const hint = document.createElement('div');
  hint.className = 'tap-hint';
  const hintSpan = document.createElement('span');
  hintSpan.textContent = isVideo(data) ? 'Ver v\u00eddeo' : 'Ver detalle';
  hint.appendChild(hintSpan);

  card.append(thumb, hint);
  stage.appendChild(card);

  addKeyboardActivation(card, () => openLb(data));
  withHover(card);

  const dist = maxR() * (0.45 + Math.random() * 0.55);
  const sx = cx() - w / 2;
  const sy = cy() - h / 2;
  const dx = cx() + Math.cos(angle) * dist - w / 2;
  const dy = cy() + Math.sin(angle) * dist - h / 2;
  const t0 = performance.now();

  (function tick(now) {
    const p = Math.min((now - t0) / TRAVEL, 1);
    const e = 1 - Math.pow(1 - p, 3);

    card.style.left = sx + (dx - sx) * e + 'px';
    card.style.top = sy + (dy - sy) * e + 'px';
    const s = 1 - 0.04 * Math.max(0, 1 - p / 0.15);
    card.style.transform = `rotate(${r0 + (r1 - r0) * e}deg) scale(${s})`;

    const fi = 0.2;
    const ho = 0.65;
    card.style.opacity =
      p < fi ? p / fi : p < ho ? 1 : Math.max(0, 1 - (p - ho) / (1 - ho));

    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      card.remove();
    }
  })(t0);
}

export function initSpawn() {
  const burst = mobile() ? 3 : 5;
  for (let i = 0; i < burst; i++) setTimeout(spawn, i * 200);
  setInterval(spawn, INTERVAL);
}
