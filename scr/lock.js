import { unlockAlbum, PROTECTED_ALBUMS, isAlbumPasswordValid } from './data.js';

const albumLock = document.getElementById('album-lock');
const albumLockTitle = document.getElementById('albumLockTitle');
const codeDots = document.getElementById('codeDots');
const numPad = document.getElementById('numPad');
const albumLockCancel = document.getElementById('albumLockCancel');

let pendingAlbum = null;
let pendingCallback = null;
let enteredCode = [];

/* Longitud del código = nº de dígitos de la contraseña del álbum (sin guiones). */
function codeLength() {
  const pwd = PROTECTED_ALBUMS[pendingAlbum] || '';
  const digits = pwd.replace(/\D/g, '');
  return digits.length || 6;
}

function buildNumberPad() {
  numPad.innerHTML = '';
  const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];
  nums.forEach((n) => {
    const btn = document.createElement('button');
    const isDigit = /^\d$/.test(n);
    btn.className = 'num-btn' + (isDigit ? '' : ' num-btn--action');
    if (n === 'back') {
      btn.textContent = '⌫'; // ⌫
      btn.setAttribute('aria-label', 'Borrar');
      btn.addEventListener('click', onBackspace);
    } else if (n === 'clear') {
      btn.textContent = 'C';
      btn.setAttribute('aria-label', 'Limpiar');
      btn.addEventListener('click', onClear);
    } else {
      btn.textContent = n;
      btn.addEventListener('click', () => onDigit(n));
    }
    numPad.appendChild(btn);
  });
}

function buildDots() {
  codeDots.innerHTML = '';
  const len = codeLength();
  for (let i = 0; i < len; i++) {
    const dot = document.createElement('span');
    dot.className = 'code-dot';
    codeDots.appendChild(dot);
  }
}

function updateDots() {
  const dots = codeDots.querySelectorAll('.code-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i < enteredCode.length);
    dot.classList.remove('error');
  });
}

function onDigit(d) {
  if (enteredCode.length >= codeLength()) return;
  enteredCode.push(d);
  updateDots();

  // Validar SOLO cuando el código está completo.
  if (enteredCode.length === codeLength()) {
    if (isAlbumPasswordValid(pendingAlbum, enteredCode.join(''))) {
      success();
    } else {
      fail();
    }
  }
}

function onBackspace() {
  if (!enteredCode.length) return;
  enteredCode.pop();
  updateDots();
}

function onClear() {
  enteredCode = [];
  updateDots();
}

function fail() {
  const box = document.querySelector('.album-lock-box');
  const dots = codeDots.querySelectorAll('.code-dot');
  dots.forEach((d) => d.classList.add('error'));
  if (box) {
    box.classList.remove('shake');
    void box.offsetWidth;
    box.classList.add('shake');
  }
  setTimeout(() => {
    enteredCode = [];
    updateDots();
  }, 500);
}

function success() {
  if (!pendingAlbum) return;
  unlockAlbum(pendingAlbum);
  const cb = pendingCallback;
  enteredCode = [];
  closeAlbumLock();
  if (cb) cb();
}

export function openAlbumLock(albumName, onSuccess) {
  pendingAlbum = albumName;
  pendingCallback = onSuccess || null;
  enteredCode = [];
  albumLockTitle.textContent = albumName;
  albumLock.hidden = false;
  albumLock.classList.add('open');
  buildDots();
  buildNumberPad();
}

function closeAlbumLock() {
  albumLock.classList.remove('open');
  albumLock.hidden = true;
  pendingAlbum = null;
  pendingCallback = null;
  enteredCode = [];
}

albumLockCancel.addEventListener('click', closeAlbumLock);
albumLock.addEventListener('click', (e) => {
  if (e.target === albumLock) closeAlbumLock();
});

document.addEventListener('keydown', (e) => {
  if (albumLock.hidden) return;
  if (e.key === 'Escape') {
    closeAlbumLock();
  } else if (/^\d$/.test(e.key)) {
    onDigit(e.key);
  } else if (e.key === 'Backspace') {
    onBackspace();
  }
});
