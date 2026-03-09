/**
 * Утилиты для сбора debug информации при парсинге конфигурации
 */

import type { DebugMessage, ParseDebugInfo, ParseStage } from '../types';

/**
 * Класс для сбора debug информации
 */
export class DebugCollector {
  private messages: DebugMessage[] = [];

  /**
   * Добавляет сообщение об ошибке
   */
  error(stage: ParseStage, message: string, details?: unknown): void {
    this.messages.push({ stage, level: 'error', message, details });
  }

  /**
   * Добавляет предупреждение
   */
  warning(stage: ParseStage, message: string, details?: unknown): void {
    this.messages.push({ stage, level: 'warning', message, details });
  }

  /**
   * Добавляет информационное сообщение
   */
  info(stage: ParseStage, message: string, details?: unknown): void {
    this.messages.push({ stage, level: 'info', message, details });
  }

  /**
   * Возвращает количество ошибок
   */
  get errorCount(): number {
    return this.messages.filter((m) => m.level === 'error').length;
  }

  /**
   * Возвращает количество предупреждений
   */
  get warningCount(): number {
    return this.messages.filter((m) => m.level === 'warning').length;
  }

  /**
   * Проверяет, есть ли ошибки
   */
  get hasErrors(): boolean {
    return this.errorCount > 0;
  }

  /**
   * Возвращает результат сбора debug информации
   */
  getResult(): ParseDebugInfo {
    return {
      messages: [...this.messages],
      errorCount: this.errorCount,
      warningCount: this.warningCount,
    };
  }

  /**
   * Объединяет с другим коллектором
   */
  merge(other: DebugCollector): void {
    this.messages.push(...other.messages);
  }
}

/**
 * Создаёт новый DebugCollector
 */
export function createDebugCollector(): DebugCollector {
  return new DebugCollector();
}

/**
 * Создаёт пустой ParseDebugInfo
 */
export function createEmptyDebugInfo(): ParseDebugInfo {
  return {
    messages: [],
    errorCount: 0,
    warningCount: 0,
  };
}
