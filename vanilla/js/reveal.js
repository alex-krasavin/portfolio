'use strict';

/**
 * Анимация появления секций (reveal on scroll).
 * Использует IntersectionObserver, учитывает prefers-reduced-motion.
 */

export function initReveal() {
  const revealSelector = '.work, .why, .process, .skills, .about, .contacts, .reviews, .services, .quiz, .faq';
  const elements = document.querySelectorAll(revealSelector);
  if (!elements.length) return;

  // Левая/правая колонки и подсекции внутри тоже анимируем каскадом
  const inner = document.querySelectorAll(
    '.work__card, .why__stats, .why__list, .process__step, .skills__grid, .about__facts, .contacts__inner, .reviews__card, .services__card, .faq__item'
  );

  // Сначала помечаем элементы для reveal
  elements.forEach((el) => el.classList.add('reveal'));
  inner.forEach((el) => el.classList.add('reveal'));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    // Без анимаций — просто показываем всё сразу
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}
