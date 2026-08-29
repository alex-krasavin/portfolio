'use strict';

/**
 * Утилиты для всего проекта.
 * Здесь — функции, которые нужны в нескольких модулях
 * (санитизация строк и валидация контактов).
 */

/**
 * Санитизация строк: убираем HTML-теги и служебные символы,
 * обрезаем по длине. Правило 9 PROJECT_RULES.
 *
 * @param {*} value — исходное значение (приводится к строке)
 * @param {number} [maxLen=120] — максимальная длина результата
 * @returns {string}
 */
export function sanitize(value, maxLen = 120) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')     // убираем HTML-теги
    .replace(/[<>"']/g, '')      // служебные символы
    .trim()
    .slice(0, maxLen);
}

/** Простая проверка email. */
export const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

/** Проверка Telegram: должен быть вида @username (4–32 символа). */
export const isValidTelegram = (val) => /^@[A-Za-z0-9_]{4,32}$/.test(val);
