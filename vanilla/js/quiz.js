'use strict';

import { sanitize, isValidEmail, isValidTelegram } from './utils.js';

/**
 * Квиз: поэтапный, с прогресс-баром, ветвлением и санитизацией.
 */

export function initQuiz() {
  const form = document.getElementById('quizForm');
  if (!form) return;

  const status = document.getElementById('quizStatus');
  const steps = Array.from(form.querySelectorAll('.quiz__step'));
  const fill = document.getElementById('quizProgressFill');
  const count = document.getElementById('quizProgressCount');
  const backBtn = document.getElementById('quizBack');
  const nextBtn = document.getElementById('quizNext');
  const submitBtn = document.getElementById('quizSubmit');
  const currentInput = document.getElementById('quizCurrent');

  // Последовательности шагов по типу задачи (нумерация data-step)
  const SEQUENCES = {
    site: [0, 1, 3, 5],          // need → design → project → контакты
    infographic: [0, 2, 5],      // need → marketplace → контакты
    both: [0, 1, 2, 3, 5],       // need → design → marketplace → project → контакты
  };

  let seen = []; // посещённые шаги в текущей последовательности

  // --- Счётчик символов для textarea "пожелания" ---
  const messageInput = form.querySelector('textarea[name="message"]');
  const messageCounter = document.getElementById('quizMessageCounter');
  const updateCounter = () => {
    if (messageInput && messageCounter) {
      const len = (messageInput.value || '').length;
      messageCounter.textContent = len + ' / 500';
    }
  };
  if (messageInput && messageCounter) {
    messageInput.addEventListener('input', updateCounter);
  }
  updateCounter();

  // --- Навигация: показать/скрыть шаги ---
  const showStep = (stepId) => {
    const target = steps.find((s) => Number(s.dataset.step) === stepId);
    steps.forEach((step) => {
      step.hidden = step !== target;
    });
    currentInput.value = stepId;
    updateProgress();
    syncSubmitState(); // сразу синхронизируем кнопку при смене шага (в т.ч. вход на шаг 5)
  };

  const getNext = (current) => {
    // Определяем тип задачи
    const need = form.querySelector('input[name="need"]:checked');
    const needVal = need && need.value;
    const seq = SEQUENCES[needVal] || SEQUENCES.site;

    const idx = seq.indexOf(current);
    return seq[idx + 1];
  };

  const getPrev = (current) => {
    // Предыдущий шаг — последний посещённый из текущей последовательности
    const need = form.querySelector('input[name="need"]:checked');
    const needVal = need && need.value;
    const seq = SEQUENCES[needVal] || SEQUENCES.site;

    const idx = seq.indexOf(current);
    return idx > 0 ? seq[idx - 1] : 0;
  };

  // --- Проверка валидности контактной формы (шаг 5) без вывода ошибок ---
  const contactsValid = () => {
    const email = sanitize(form.querySelector('input[name="email"]').value);
    const tg = sanitize(form.querySelector('input[name="telegram"]').value);
    const consent = form.querySelector('input[name="consent"]').checked;
    const emailOk = email ? isValidEmail(email) : true;
    const tgOk = tg ? isValidTelegram(tg) : true;
    return (email || tg) && emailOk && tgOk && consent;
  };

  // --- Синхронизация состояния кнопки "Отправить" (активна только на шаге 5 и при валидных полях) ---
  const syncSubmitState = () => {
    const current = Number(currentInput.value);
    const seq = SEQUENCES[form.querySelector('input[name="need"]:checked') ? form.querySelector('input[name="need"]:checked').value : 'site'] || SEQUENCES.site;
    const idx = seq.indexOf(current);
    const isLast = idx === seq.length - 1;
    // На шаге 5 кнопка активна, только если контакты заполнены верно
    submitBtn.disabled = !(isLast && contactsValid());
  };

  // --- Обновление прогресс-бара ---
  const updateProgress = () => {
    const need = form.querySelector('input[name="need"]:checked');
    const needVal = need && need.value;
    const seq = SEQUENCES[needVal] || SEQUENCES.site;

    const current = Number(currentInput.value);
    const idx = seq.indexOf(current);
    // Прогресс считаем относительно полной последовательности (5 шагов максимум)
    const total = SEQUENCES.both.length;
    const pct = Math.round(((idx + 1) / total) * 100);
    fill.style.width = pct + '%';
    count.textContent = (idx + 1) + ' / ' + seq.length;
    if (fill.parentElement) {
      fill.parentElement.setAttribute('aria-valuenow', String(pct));
    }

    // Кнопки: "Далее" всегда видна, но неактивна на последнем шаге; "Отправить" активна только на шаге 5 при валидных полях
    const isLast = idx === seq.length - 1;
    backBtn.hidden = idx === 0;
    nextBtn.disabled = isLast;
    syncSubmitState();
  };

  // --- Проверка ответов на текущем шаге ---
  const stepValid = (index) => {
    const step = steps.find((s) => Number(s.dataset.step) === index);
    if (!step) return true;

    const checked = step.querySelector('input[type="radio"]:checked');
    if (checked) return true;

    // Шаг контактов (5): email или tg + согласие
    if (index === 5) {
      const email = sanitize(step.querySelector('input[name="email"]').value);
      const tg = sanitize(step.querySelector('input[name="telegram"]').value);
      const consent = step.querySelector('input[name="consent"]').checked;

      if (!email && !tg) {
        showError('Укажите хотя бы один контакт — Email или Telegram.');
        return false;
      }
      if (email && !isValidEmail(email)) {
        showError('Введите корректный email.');
        return false;
      }
      if (tg && !isValidTelegram(tg)) {
        showError('Telegram должен быть вида @username (4–32 символа).');
        return false;
      }
      if (!consent) {
        showError('Необходимо согласие на обработку персональных данных.');
        return false;
      }
      return true;
    }

    showError('Выберите один из вариантов ответа.');
    return false;
  };

  const showError = (msg) => {
    status.textContent = msg;
    status.classList.add('is-error');
  };

  const clearStatus = () => {
    status.textContent = '';
    status.classList.remove('is-error');
  };

  // --- Живая синхронизация кнопки "Отправить" ---
  // Делегирование на форму: перехватывает input/change по любым полям (email, tg, чекбокс),
  // надёжно работает независимо от порядка и момента появления элементов (правило 6.1).
  form.addEventListener('input', syncSubmitState);
  form.addEventListener('change', syncSubmitState);

  // --- Кнопки ---
  nextBtn.addEventListener('click', () => {
    const current = Number(currentInput.value);
    if (!stepValid(current)) return;
    clearStatus();

    const next = getNext(current);
    if (next === undefined) {
      showError('Что-то пошло не так. Попробуйте ещё раз.');
      return;
    }
    seen.push(current);
    showStep(next);
  });

  backBtn.addEventListener('click', () => {
    const current = Number(currentInput.value);
    const prev = getPrev(current);
    seen.pop();
    clearStatus();
    showStep(prev);
  });

  // --- Отправка формы ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const current = Number(currentInput.value);
    if (!stepValid(current)) return;
    clearStatus();

    // Собираем ответы с санитизацией
    const data = {};
    form.querySelectorAll('input[type="radio"]:checked').forEach((input) => {
      data[input.name] = sanitize(input.value);
    });

    const emailInput = form.querySelector('input[name="email"]');
    const tgInput = form.querySelector('input[name="telegram"]');
    data.email = sanitize(emailInput.value);
    data.telegram = sanitize(tgInput.value);

    // Необязательное описание пожеланий (макс 500 символов)
    data.message = messageInput ? sanitize(messageInput.value, 500) : '';

    // Здесь будет POST на /api/leads на этапе 4
    console.log('Данные квиза:', data);

    // Сообщение об успехе
    status.textContent = 'Спасибо! Я свяжусь с вами в течение дня с расчётом.';
    status.classList.remove('is-error');
    form.reset();
    updateCounter(); // сбрасываем счётчик символов textarea

    // Сброс к первому шагу
    seen = [];
    showStep(0);
  });

  // Инициализация: показываем первый шаг
  showStep(0);
}
