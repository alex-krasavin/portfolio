/* ============================================
   КРАСАВИН АЛЕКСАНДР — портфолио
   Этап 1: Каркас (JS)
   ============================================ */

'use strict';

// --- Переключатель тёмной/светлой темы ---
(function initTheme() {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  // Читаем сохранённую тему из localStorage (или по системной)
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const currentTheme = savedTheme || systemTheme;

  root.setAttribute('data-theme', currentTheme);

  // Переключение темы
  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
})();

// --- Липкая шапка (появление фона при скролле) ---
(function initHeader() {
  const header = document.getElementById('header');
  const toTop = document.getElementById('toTop');

  const onScroll = () => {
    const scrolled = window.scrollY > 20;

    // Липкая шапка
    header.classList.toggle('is-scrolled', scrolled);

    // Кнопка "наверх"
    toTop.classList.toggle('is-visible', window.scrollY > 600);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // вызываем сразу при загрузке

  // Клик по кнопке "наверх" — плавный скролл
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// --- Бургер-меню (мобильная навигация) ---
(function initBurger() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const links = nav.querySelectorAll('.header__link');

  const toggleMenu = (open) => {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };

  // Открыть/закрыть по клику на бургер
  burger.addEventListener('click', () => {
    const isOpen = burger.classList.contains('is-open');
    toggleMenu(!isOpen);
  });

  // Закрыть меню при клике на ссылку
  links.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Закрыть по Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleMenu(false);
    }
  });

  // Закрыть при клике вне меню
  document.addEventListener('click', (e) => {
    const isMenuClick = nav.contains(e.target) || burger.contains(e.target);
    if (!isMenuClick && nav.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });
})();