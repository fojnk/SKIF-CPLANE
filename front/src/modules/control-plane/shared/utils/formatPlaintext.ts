/**
 * Форматирует plaintext сообщения, заменяя \n на реальные переносы строк
 * @param message - строка с сообщением
 * @returns отформатированная строка с переносами строк
 */
export const formatPlaintext = (message: string): string => {
  if (!message) return '';
  return message.replace(/\\n/g, '\n');
};
