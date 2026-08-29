'use strict';

/**
 * Переключатель тёмной/светлой темы.
 *
 * Начальная тема ставится инлайн-скриптом в <head> до первой отрисовки
 * (правило 6.5 — без FOUC). Здесь — только обработчик переключения.
 */

export function initTheme() {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (e) {
      /* localStorage недоступен — игнорируем */
    }
  });
}
