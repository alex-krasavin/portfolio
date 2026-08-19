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

// --- Бургер-меню (мобильная навигация, весь экран + блокировка скролла) ---
(function initBurger() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const links = nav.querySelectorAll('.header__link');

  // Блокируем/разблокируем скролл страницы при открытом меню (правило 10.3)
  const toggleBodyScroll = (lock) => {
    document.body.style.overflow = lock ? 'hidden' : '';
    document.body.style.position = lock ? 'fixed' : '';
    document.body.style.width = lock ? '100%' : '';
  };

  const toggleMenu = (open) => {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    toggleBodyScroll(open);
  };

  // Открыть/закрыть по клику на бургер
  burger.addEventListener('click', () => {
    const isOpen = burger.classList.contains('is-open');
    toggleMenu(!isOpen);
  });

  // Закрыть меню при клике на ссылку (пункт меню)
  links.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Закрыть по Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleMenu(false);
    }
  });

  // Закрыть при клике вне меню (по фону/оверлею)
  document.addEventListener('click', (e) => {
    const isMenuClick = nav.contains(e.target) || burger.contains(e.target);
    if (!isMenuClick && nav.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });
})();

// --- Квиз: поэтапный, с прогресс-баром, ветвлением и санитизацией ---
(function initQuiz() {
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

  // --- Санитизация строк (правило 9 PROJECT_RULES) ---
  const sanitize = (value, maxLen = 120) => {
    return String(value || '')
      .replace(/<[^>]*>/g, '')     // убираем HTML-теги
      .replace(/[<>"']/g, '')      // служебные символы
      .trim()
      .slice(0, maxLen);
  };

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidTelegram = (val) => /^@[A-Za-z0-9_]{4,32}$/.test(val);

  // --- Навигация: показать/скрыть шаги ---
  const showStep = (index) => {
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });
    currentInput.value = index;
    updateProgress();
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

    // Показываем/скрываем кнопки
    const isLast = idx === seq.length - 1;
    backBtn.hidden = idx === 0;
    nextBtn.hidden = isLast;
    submitBtn.hidden = !isLast;
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

    // Здесь будет POST на /api/leads на этапе 4
    console.log('Данные квиза:', data);

    // Сообщение об успехе
    status.textContent = 'Спасибо! Я свяжусь с вами в течение дня с расчётом.';
    status.classList.remove('is-error');
    form.reset();

    // Сброс к первому шагу
    seen = [];
    showStep(0);
  });

  // Инициализация: показываем первый шаг
  showStep(0);
})();
