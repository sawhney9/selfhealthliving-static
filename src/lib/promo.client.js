import { PROMO } from './promo.js';

const DISMISS_KEY = `shl-promo-dismissed-${PROMO.id}`;

function live(now = Date.now()) {
  return now >= Date.parse(PROMO.start) && now < Date.parse(PROMO.end);
}

function dismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Show the promo bar and cards on this page if the promo is running. */
export function showPromo() {
  // ?promo=preview shows it outside the window, for checking the design.
  const preview = new URLSearchParams(location.search).get('promo') === 'preview';
  if (!live() && !preview) return;
  document.querySelectorAll('[data-promo-card]').forEach((el) => el.classList.remove('hidden'));
  const bar = document.querySelector('[data-promo-bar]');
  if (!bar || (dismissed() && !preview)) return;
  bar.classList.remove('hidden');
  bar.querySelector('[data-promo-close]')?.addEventListener('click', () => {
    bar.classList.add('hidden');
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  });
}
