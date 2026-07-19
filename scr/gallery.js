import { PHOTOS, isProtectedAlbum, isAlbumUnlocked, getAlbumsList } from './data.js';
import { addKeyboardActivation, withHover, applyMediaAspect, isVideo, fillMediaThumb, albumMediaLabel } from './helpers.js';
import { openAlbumLock } from './lock.js';
import { openLb } from './lightbox.js';

const gm = document.getElementById('grid-modal');
const gmGrid = document.getElementById('gmGrid');
const gmClose = document.getElementById('gmClose');
const gmBack = document.getElementById('gmBack');
const gmEyebrow = document.getElementById('gmEyebrow');
const gmTitle = document.getElementById('gmTitle');
const gmCount = document.getElementById('gmCount');

let currentViewContext = null;

export function openAlbum(albumName) {
  if (isProtectedAlbum(albumName) && !isAlbumUnlocked(albumName)) {
    openAlbumLock(albumName, () => buildPhotos(albumName));
    return;
  }
  buildPhotos(albumName);
}

function buildAlbums() {
  currentViewContext = 'albums';
  gmBack.style.display = 'none';
  gmEyebrow.textContent = 'Explora por categor\u00eda';
  gmTitle.textContent = 'Colecciones';
  gmCount.textContent = `${getAlbumsList().length} \u00e1lbumes`;
  gmGrid.className = 'folder-grid';
  gmGrid.innerHTML = '';

  const fragment = document.createDocumentFragment();

  getAlbumsList().forEach((albumName, i) => {
    const albumPhotos = PHOTOS.filter((p) => p.album === albumName);
    const coverPhoto = albumPhotos.find((p) => !isVideo(p)) || albumPhotos[0];
    const locked = isProtectedAlbum(albumName) && !isAlbumUnlocked(albumName);

    const folder = document.createElement('div');
    folder.className = 'folder-card' + (locked ? ' folder-card--locked' : '');

    const back = document.createElement('div');
    back.className = 'folder-back';
    folder.appendChild(back);

    const paper = document.createElement('div');
    paper.className = 'folder-paper';
    if (locked) {
      paper.classList.add('folder-paper--locked');
      const lockSpan = document.createElement('span');
      lockSpan.className = 'folder-lock-large';
      lockSpan.setAttribute('aria-hidden', 'true');
      lockSpan.textContent = '\uD83D\uDD12';
      paper.appendChild(lockSpan);
    } else {
      fillMediaThumb(paper, coverPhoto, 400, 300);
    }
    folder.appendChild(paper);

    const front = document.createElement('div');
    front.className = 'folder-front';

    const title = document.createElement('h3');
    title.className = 'folder-title';
    title.textContent = albumName;
    if (locked) {
      const lockIcon = document.createElement('span');
      lockIcon.className = 'folder-lock';
      lockIcon.setAttribute('aria-hidden', 'true');
      lockIcon.textContent = ' \uD83D\uDD12';
      title.appendChild(lockIcon);
    }
    front.appendChild(title);

    const count = document.createElement('span');
    count.className = 'folder-count';
    count.textContent = locked ? '\u00c1lbum privado' : albumMediaLabel(albumPhotos);
    front.appendChild(count);

    folder.appendChild(front);

    addKeyboardActivation(folder, () => openAlbum(albumName));
    withHover(folder);
    fragment.appendChild(folder);

    setTimeout(() => folder.classList.add('visible'), i * 60);
  });

  gmGrid.appendChild(fragment);
}

function buildPhotos(albumName) {
  if (isProtectedAlbum(albumName) && !isAlbumUnlocked(albumName)) {
    openAlbumLock(albumName, () => buildPhotos(albumName));
    return;
  }
  currentViewContext = albumName;
  gmBack.style.display = 'inline-flex';
  gmEyebrow.textContent = '\u00c1lbum';
  gmTitle.textContent = albumName;

  const albumPhotos = PHOTOS.filter((p) => p.album === albumName);
  gmCount.textContent = albumMediaLabel(albumPhotos);

  gmGrid.className = 'photo-grid';
  gmGrid.innerHTML = '';

  const fragment = document.createDocumentFragment();

  albumPhotos.forEach((data, i) => {
    const item = document.createElement('div');
    item.className = 'gm-item' + (isVideo(data) ? ' gm-item--video' : '');
    applyMediaAspect(item, data);

    const thumb = document.createElement('div');
    thumb.className = 'gm-item-thumb';
    fillMediaThumb(thumb, data, 400, 560, { autoplay: false });

    const overlay = document.createElement('div');
    overlay.className = 'gm-item-overlay';

    const titleP = document.createElement('p');
    titleP.className = 'gm-item-title';
    titleP.textContent = data.title;
    overlay.appendChild(titleP);

    const locP = document.createElement('p');
    locP.className = 'gm-item-location';
    locP.textContent = `${data.place}, ${data.country}`;
    overlay.appendChild(locP);

    const cue = document.createElement('span');
    cue.className = 'gm-item-cue';
    cue.textContent = isVideo(data) ? 'Reproducir' : 'Ver detalle';
    overlay.appendChild(cue);

    item.append(thumb, overlay);

    addKeyboardActivation(item, () => openLb(data, albumPhotos));
    withHover(item);
    fragment.appendChild(item);

    setTimeout(() => item.classList.add('visible'), i * 55);
  });

  gmGrid.appendChild(fragment);
}

export function openGm() {
  buildAlbums();
  gm.classList.add('open');
  setTimeout(() => gmClose.focus(), 100);
}

function closeGm() {
  gm.classList.remove('open');
}

gmBack.addEventListener('click', buildAlbums);
gmClose.addEventListener('click', closeGm);
withHover(gmClose);
withHover(gmBack);

export function isInSubView() {
  return currentViewContext !== null && currentViewContext !== 'albums';
}

export function handleEscape() {
  if (gm.classList.contains('open')) {
    if (isInSubView()) {
      buildAlbums();
    } else {
      closeGm();
    }
  }
}

export { buildPhotos };
