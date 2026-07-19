import { PHOTOS } from './data.js';
import { mobile, applyMediaAspect, isVideo, mediaSrc } from './helpers.js';

const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbVideo = document.getElementById('lbVideo');
const lbTitle = document.getElementById('lbTitle');
const lbDesc = document.getElementById('lbDesc');
const lbNum = document.getElementById('lbNum');
const lbAlbumTag = document.getElementById('lbAlbumTag');
const lbDate = document.getElementById('lbDate');
const lbLocation = document.getElementById('lbLocation');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

let currentPhotos = [];
let currentIndex = 0;

function extractDate(id) {
  const m = id && id.match(/(20\d{2})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const day = parseInt(m[3], 10);
  const month = months[parseInt(m[2], 10) - 1];
  const year = m[1];
  return `${day} de ${month}, ${year}`;
}

function renderPhoto(index) {
  const data = currentPhotos[index];
  if (!data) return;
  currentIndex = index;

  const n = index + 1;
  const lw = mobile() ? 800 : 1400;
  const lh = mobile() ? 600 : 1800;

  lbTitle.textContent = data.title;
  lbDesc.textContent = data.desc;
  lbAlbumTag.textContent = data.album;
  if (lbDate) lbDate.textContent = extractDate(data.id);
  if (lbLocation) lbLocation.textContent = `${data.place}, ${data.country}`;
  const pad = (v) => String(v).padStart(2, '0');
  lbNum.textContent = `${pad(n)} / ${pad(currentPhotos.length)}`;
  lbNum.classList.remove('animate');
  void lbNum.offsetWidth;
  lbNum.classList.add('animate');

  const lbMedia = document.querySelector('.lb-media');
  if (lbMedia) applyMediaAspect(lbMedia, data);

  lbPrev.classList.toggle('disabled', index === 0);
  lbNext.classList.toggle('disabled', index === currentPhotos.length - 1);

  if (isVideo(data)) {
    lbImg.hidden = true;
    lbImg.removeAttribute('src');
    lbVideo.hidden = false;
    lbVideo.src = mediaSrc(data.id);
    lbVideo.load();
    lbVideo.play().catch((e) => {
      if (e.name !== 'AbortError') console.warn('[Evy] Error al reproducir video:', e);
    });
  } else {
    if (!lbVideo.hidden) {
      lbVideo.pause();
      lbVideo.removeAttribute('src');
    }
    lbVideo.hidden = true;
    lbImg.hidden = false;
    lbImg.classList.remove('loaded');
    lbImg.src = mediaSrc(data.id, lw, lh);
    lbImg.alt = data.title;
  }
}

export function openLb(data, contextPhotos = PHOTOS) {
  currentPhotos = contextPhotos;
  const idx = contextPhotos.indexOf(data);
  if (idx === -1) return;
  renderPhoto(idx);
  lb.classList.add('open');
  setTimeout(() => lbClose.focus(), 100);
}

export function closeLb() {
  lb.classList.remove('open');
  if (!lbVideo.hidden) {
    lbVideo.pause();
    lbVideo.removeAttribute('src');
  }
  lbVideo.hidden = true;
  lbImg.hidden = false;
  currentPhotos = [];
}

function showNext() {
  if (currentIndex < currentPhotos.length - 1) {
    renderPhoto(currentIndex + 1);
  }
}

function showPrev() {
  if (currentIndex > 0) {
    renderPhoto(currentIndex - 1);
  }
}

lbClose.addEventListener('click', closeLb);
lbPrev.addEventListener('click', showPrev);
lbNext.addEventListener('click', showNext);

lb.addEventListener('click', (e) => {
  if (e.target === lb) closeLb();
});

lbImg.addEventListener('load', () => lbImg.classList.add('loaded'));
lbImg.addEventListener('error', () => lbImg.classList.add('loaded'));

document.addEventListener('keydown', (e) => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') { showPrev(); e.preventDefault(); }
  if (e.key === 'ArrowRight') { showNext(); e.preventDefault(); }
});