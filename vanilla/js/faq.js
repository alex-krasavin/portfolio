'use strict';

/**
 * Аккордеон FAQ (плавное раскрытие ответов).
 */

export function initFaq() {
  const faqList = document.querySelector('.faq__list');
  if (!faqList) return;

  const items = Array.from(faqList.querySelectorAll('.faq__item'));

  items.forEach((item) => {
    const question = item.querySelector('.faq__question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Закрываем все остальные пункты
      items.forEach((other) => {
        other.classList.remove('is-open');
        const btn = other.querySelector('.faq__question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      // Открываем текущий (если он не был открыт)
      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
