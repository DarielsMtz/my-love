import { addKeyboardActivation, withHover } from './helpers.js';

const PLAY_ICON =
  '<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
const PAUSE_ICON =
  '<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';

const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');

export function initAudio() {
  if (!musicBtn || !bgMusic) return;
  let isPlaying = false;

  const toggleMusic = () => {
    if (isPlaying) {
      bgMusic.pause();
      musicBtn.innerHTML = PLAY_ICON;
    } else {
      bgMusic.play().catch((e) => console.warn('[Evy] Reproducción bloqueada por el navegador:', e));
      musicBtn.innerHTML = PAUSE_ICON;
    }
    isPlaying = !isPlaying;
  };

  addKeyboardActivation(musicBtn, toggleMusic);
  withHover(musicBtn);
}
