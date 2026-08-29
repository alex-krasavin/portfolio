'use strict';

/**
 * Модальное окно формы заявки:
 * открытие/закрытие, фокус-ловушка, корректные aria-атрибуты.
 *
 * Экспортируются:
 *  - initModal()     — навешивает обработчики на [data-modal-open], крестик, оверлей, Esc.
 *  - openModal()     — программное открытие (для exit-intent и плавающей кнопки).
 *  - closeModal()    — программное закрытие.
 */

let modal = null;
let closeBtn = null;
const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let isInitialized = false;

const toggleBodyScroll = (lock) => {
  document.body.style.overflow = lock ? 'hidden' : '';
};

export function openModal() {
  if (!modal) return;
  if (!modal.hidden) return;

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  toggleBodyScroll(true);

  // Запоминаем элемент, открывший модалку, чтобы вернуть фокус после закрытия
  modal._lastFocus = document.activeElement;

  // Фокус на первый фокусируемый элемент
  const firstFocusable = modal.querySelector(focusableSelector);
  if (firstFocusable) firstFocusable.focus();
}

export function closeModal() {
  if (!modal) return;
  if (modal.hidden) return;

  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  toggleBodyScroll(false);

  // Возвращаем фокус на элемент, который открыл модалку
  if (modal._lastFocus && typeof modal._lastFocus.focus === 'function') {
    modal._lastFocus.focus();
  }
}

export function initModal() {
  modal = document.getElementById('modal');
  // В HTML крестик помечен как .modal__close + data-modal-close (без отдельного id)
  closeBtn = document.querySelector('.modal__close');
  const overlay = document.querySelector('.modal__overlay');
  if (!modal || !closeBtn) return;

  // Защита от повторной инициализации
  if (isInitialized) return;
  isInitialized = true;

  const openers = document.querySelectorAll('[data-modal-open]');

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
    if (e.key === 'Escape' && modal && !modal.hidden) {
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
