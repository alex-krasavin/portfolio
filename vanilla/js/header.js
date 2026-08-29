'use strict';

/**
 * Липкая шапка (появление фона при скролле)
 * + кнопка "наверх" (появляется после первого экрана, порог 400px).
 */

export function initHeader() {
  const header = document.getElementById('header');
  const toTop = document.getElementById('toTop');
  if (!header || !toTop) return;

  const onScroll = () => {
    const scrolled = window.scrollY > 20;

    // Липкая шапка
    header.classList.toggle('is-scrolled', scrolled);

    // Кнопка "наверх" (правило UX: появляется после прокрутки первого экрана)
    toTop.classList.toggle('is-visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // вызываем сразу при загрузке

  // Клик по кнопке "наверх" — плавный скролл
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
