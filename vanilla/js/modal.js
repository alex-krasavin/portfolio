'use strict';

/**
 * Модальное окно формы заявки:
 * открытие/закрытие, фокус-ловушка, корректные aria-атрибуты.
 */

export function initModal() {
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('modalClose');
  const overlay = document.querySelector('.modal__overlay');
  if (!modal || !closeBtn) return;

  const openers = document.querySelectorAll('[data-modal-open]');
  // Фокус-ловушка: настраиваемый список фокусируемых элементов внутри модалки
  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const toggleBodyScroll = (lock) => {
    document.body.style.overflow = lock ? 'hidden' : '';
  };

  const openModal = () => {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    toggleBodyScroll(true);
    // Запоминаем элемент, открывший модалку, чтобы вернуть фокус после закрытия
    modal._lastFocus = document.activeElement;
    // Фокус на первый фокусируемый элемент
    const firstFocusable = modal.querySelector(focusableSelector);
    if (firstFocusable) firstFocusable.focus();
  };

  const closeModal = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    toggleBodyScroll(false);
    // Возвращаем фокус на элемент, который открыл модалку
    if (modal._lastFocus && typeof modal._lastFocus.focus === 'function') {
      modal._lastFocus.focus();
    }
  };

  openers.forEach((opener) => {
    opener.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn.addEventListener('click', closeModal);

  // Закрытие по клику на оверлей
  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  // Закрытие по Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  // Фокус-ловушка: Tab не должен уходить за пределы модалки
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || modal.hidden) return;

    const focusables = Array.from(modal.querySelectorAll(focusableSelector))
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
