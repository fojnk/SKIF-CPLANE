/**
 * Форматирует данные, пытаясь распарсить как JSON
 * @param data - строка с данными
 * @returns отформатированная строка или исходные данные
 */
export const formatData = (data: string): string => {
  if (!data) return '';

  try {
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // Если не валидный JSON, возвращаем как есть
    return data;
  }
};
