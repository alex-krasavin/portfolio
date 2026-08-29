'use strict';

/**
 * Куки-баннер: показ один раз, запоминаем согласие.
 */

export function initCookie() {
  const banner = document.getElementById('cookieBanner');
  const accept = document.getElementById('cookieAccept');
  if (!banner || !accept) return;

  try {
    if (!localStorage.getItem('cookieAccepted')) {
      // Показываем с небольшой задержкой, чтобы не мешать первой отрисовке
      setTimeout(() => {
        banner.hidden = false;
        requestAnimationFrame(() => banner.classList.add('is-visible'));
      }, 800);
    }
  } catch (e) {
    // localStorage недоступен — баннер не показываем
  }

  accept.addEventListener('click', () => {
    try { localStorage.setItem('cookieAccepted', '1'); } catch (e) {}
    banner.classList.remove('is-visible');
    // Полностью скрываем после завершения анимации
    setTimeout(() => { banner.hidden = true; }, 300);
  });
}
