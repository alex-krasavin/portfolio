/* ============================================
   КРАСАВИН АЛЕКСАНДР — портфолио
   Точка входа: импорт и запуск всех модулей.
   Подключается через <script type="module">,
   поэтому выполняется после парсинга HTML и
   даёт каждому модулю свою область видимости.
   ============================================ */

import { initTheme } from './theme.js';
import { initHeader } from './header.js';
import { initBurger } from './burger.js';
import { initQuiz } from './quiz.js';
import { initCookie } from './cookie.js';
import { initReveal } from './reveal.js';
import { initFaq } from './faq.js';
import { initModal } from './modal.js';
import { initLeadForms } from './lead-forms.js';
import { initExitIntent, initFloatingCTA } from './cta.js';

initTheme();
initHeader();
initBurger();
initQuiz();
initCookie();
initReveal();
initFaq();
initModal();
initLeadForms();
initExitIntent();
initFloatingCTA();
