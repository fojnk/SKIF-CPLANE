function envString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

/** Название из окружения (`VITE_PLATFORM_STATION_NAME`), иначе значение по умолчанию. */
export const PLATFORM_STATION_NAME =
  envString(import.meta.env.VITE_PLATFORM_STATION_NAME) ??
  'ЦКП СКИФ: Станция 1-7';

/** Подзаголовок (`VITE_PLATFORM_TAGLINE`), иначе текст по умолчанию. */
export const PLATFORM_TAGLINE =
  envString(import.meta.env.VITE_PLATFORM_TAGLINE) ??
  'Планирование и управление экспериментами, проектами и инфраструктурой установки.';
