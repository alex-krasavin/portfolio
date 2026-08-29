'use strict';

import { sanitize, isValidEmail } from './utils.js';

/**
 * Отправка заявок (#contactForm и #modalForm) на /api/leads (заглушка).
 *
 * Этап 4 добавит реальный сервер; сейчас — POST уходит, а в catch()
 * мы имитируем успех, чтобы UX уже был рабочим.
 */

export function initLeadForms() {
  const forms = Array.from(document.querySelectorAll('#contactForm, #modalForm'));

  forms.forEach((form) => {
    const note = form.querySelector('.contacts__note, .modal__note');

    const setNote = (msg, isError) => {
      if (!note) return;
      note.textContent = msg;
      note.classList.toggle('is-error', !!isError);
      note.setAttribute('aria-live', 'polite'); // скринридер объявляет сообщение
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot-ловушка (правило 9.4): если скрытое поле заполнено — это бот.
      // Отправляем «тихо» (без обработки) и не показываем пользователю ошибок/успеха.
      const hp = form.querySelector('.contacts__honeypot, .modal__honeypot');
      if (hp && hp.value) {
        // Имитируем отправку заявки бота — без реакции интерфейса
        console.log('Honeypot сработал, заявка отклонена тихо.');
        return;
      }

      // Валидация
      const name = sanitize(form.querySelector('[name="name"]') && form.querySelector('[name="name"]').value);
      const email = sanitize(form.querySelector('[name="email"]') && form.querySelector('[name="email"]').value);
      const message = sanitize(form.querySelector('[name="message"]') && form.querySelector('[name="message"]').value);
      const consent = form.querySelector('[name="consent"]') && form.querySelector('[name="consent"]').checked;

      if (!name) {
        setNote('Пожалуйста, представьтесь — как к вам обращаться?', true);
        return;
      }
      if (!email || !isValidEmail(email)) {
        setNote('Введите корректный email для связи.', true);
        return;
      }
      if (!consent) {
        setNote('Необходимо согласие на обработку персональных данных.', true);
        return;
      }

      setNote('Отправка…', false);

      // Заглушка: POST на /api/leads (фактический сервер появится на этапе 4)
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, source: form.id }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Ошибка сервера');
          return res.json();
        })
        .then(() => {
          setNote('Спасибо! Заявка отправлена. Я свяжусь с вами в течение дня.', false);
          form.reset();
        })
        .catch(() => {
          // Заглушка: показываем успех, т.к. реального сервера нет (этап 4 добавит обработку ошибок)
          setNote('Спасибо! Заявка отправлена. Я свяжусь с вами в течение дня.', false);
          form.reset();
        });
    });
  });
}
