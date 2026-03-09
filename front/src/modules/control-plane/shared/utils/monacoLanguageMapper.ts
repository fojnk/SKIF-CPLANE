/**
 * Определяет язык Monaco Editor по типу переменной
 * @param type - тип переменной
 * @returns язык для Monaco Editor
 */
export const getMonacoLanguage = (type: string): string => {
  switch (type) {
    case 'json':
      return 'json';
    case 'yql':
      return 'yql';
    case 'python':
      return 'python';
    default:
      return 'plaintext';
  }
};

/**
 * Определяет настройки wordWrap для Monaco Editor по типу переменной
 * @param type - тип переменной
 * @returns настройка wordWrap
 */
export const getWordWrapSetting = (type: string): 'on' | 'off' => {
  return type === 'string' ? 'on' : 'off';
};
