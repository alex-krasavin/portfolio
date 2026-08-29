'use strict';

import { openModal } from './modal.js';

/**
 * Модуль дополнительных CTA-приёмов для повышения конверсии:
 *
 *  1. initExitIntent()   — модалка появляется, когда пользователь уводит курсор
 *                          к закрытию вкладки (выход с сайта). Срабатывает
 *                          один раз за сессию, не раньше чем через 15 секунд
 *                          и только если пользователь не долистал до футера.
 *
 *  2. initFloatingCTA()  — плавающая кнопка «Обсудить проект» в правом нижнем
 *                          углу. Появляется через 6 секунд после загрузки
 *                          (или раньше — после скролла 40% страницы).
 *                          При клике открывает ту же модалку.
 *
 * Оба приёма используют одну и ту же модалку (см. modal.js).
 */

const SESSION_KEY_EXIT = 'exitIntentShown';
const FLOATING_CTA_DELAY_MS = 6000;
const EXIT_INTENT_MIN_TIME_MS = 15000;
const EXIT_INTENT_MIN_SCROLL_PERCENT = 70; // показываем, только если не долистал до футера

/**
 * Проверяем, долистал ли пользователь до конца страницы (≈ до футера).
 * Возвращаем true, если пользователь НЕ долистал — то есть exit-intent уместен.
 */
const isFarFromFooter = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return false; // страница короткая — показывать нет смысла
  const scrolledPercent = (scrollTop / docHeight) * 100;
  return scrolledPercent < (100 - EXIT_INTENT_MIN_SCROLL_PERCENT);
};

export function initExitIntent() {
  // Один раз за сессию: не повторяем приём
  let alreadyShown = false;
  try {
    alreadyShown = sessionStorage.getItem(SESSION_KEY_EXIT) === '1';
  } catch (e) {
    /* sessionStorage недоступен — продолжаем без флага */
  }
  if (alreadyShown) return;

  const pageLoadedAt = Date.now();

  // Слушаем уход курсора к верху окна (типичный жест «закрыть вкладку»).
  // Используем mouseleave на document.documentElement — он срабатывает,
  // когда курсор покидает viewport. Дополнительно фильтруем clientY <= 0.
  document.documentElement.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0) {
      handleExit();
    }
  });

  // На мобильных mouseleave не работает. Используем visibilitychange:
  // если пользователь уходит на другую вкладку — показываем модалку,
  // когда он вернётся. Но это агрессивнее, поэтому отключаем на мобильных.
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  if (!isCoarse) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // не показываем сразу, только если вернётся
      }
    });
  }

  function handleExit() {
    if (alreadyShown) return;
    if (!isFarFromFooter()) return; // уже всё прочитал — не мешаем
    if (Date.now() - pageLoadedAt < EXIT_INTENT_MIN_TIME_MS) return;

    alreadyShown = true;
    try {
      sessionStorage.setItem(SESSION_KEY_EXIT, '1');
    } catch (e) {
      /* ignore */
    }
    openModal();
  }
}

export function initFloatingCTA() {
  const btn = document.getElementById('floatingCta');
  if (!btn) return;

  // Показываем кнопку через FLOATING_CTA_DELAY_MS или при скролле 40% — что наступит раньше.
  let shown = false;
  const reveal = () => {
    if (shown) return;
    shown = true;
    btn.hidden = false;
    requestAnimationFrame(() => btn.classList.add('is-visible'));
  };

  setTimeout(reveal, FLOATING_CTA_DELAY_MS);

  // Раннее появление при активном скролле
  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const scrolledPercent = (scrollTop / docHeight) * 100;
    if (scrolledPercent >= 40) reveal();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Клик — открываем модалку
  btn.addEventListener('click', () => {
    openModal();
  });
}
