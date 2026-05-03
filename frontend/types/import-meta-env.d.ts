/** Дополнение к типам Vite (`vite/client`) для переменных `VITE_*`. */
interface ImportMetaEnv {
  /** Название установки / станции на экранах входа и регистрации */
  readonly VITE_PLATFORM_STATION_NAME?: string;
  /** Подзаголовок под названием (опционально) */
  readonly VITE_PLATFORM_TAGLINE?: string;
}
