import { initCursor, withHover } from './helpers.js';
import { initSpawn } from './spawn.js';
import { openGm, handleEscape } from './gallery.js';
import { closeLb } from './lightbox.js';
import { initAudio } from './audio.js';
import { initAdmin } from './admin.js';

/* ── Cargar textos del panel ────────────────────────────── */
(function loadPanelTexts() {
  try {
    const savedData = localStorage.getItem('nuestra_historia_datos');
    if (!savedData) return;
    const { texts } = JSON.parse(savedData);
    if (!texts) return;

    const setEl = (sel, html) => {
      const e = document.querySelector(sel);
      if (e) e.innerHTML = html;
    };
    setEl('.hero-eyebrow', texts.eyebrow);
    setEl('.hero-title', texts.title);
    setEl('.hero-sub', texts.sub);
    setEl('.hero-cta', texts.cta);
    setEl('#gmEyebrow', texts.gmEyebrow);
    setEl('#gmTitle', texts.gmTitle);
  } catch (e) {
    console.warn('[Evy] Error al cargar textos del panel:', e);
  }
})();

/* ── CTA Hero ───────────────────────────────────────────── */
const cta = document.getElementById('ctaBtn');
cta.addEventListener('click', openGm);
withHover(cta);

/* ── Keyboard: Escape ───────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const lb = document.getElementById('lightbox');
  const albumLock = document.getElementById('album-lock');

  if (lb.classList.contains('open')) {
    closeLb();
  } else {
    handleEscape();
  }
});

/* ── Initialize modules ─────────────────────────────────── */
initCursor();
initSpawn();
initAudio();
initAdmin();
