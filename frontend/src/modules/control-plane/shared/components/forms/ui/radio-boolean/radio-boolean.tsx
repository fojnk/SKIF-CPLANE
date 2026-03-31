import { SegmentedRadioGroup } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { useMemo } from 'react';

import css from './radio-boolean.module.scss';

// Тип значения для RadioBoolean
export type RadioBooleanValue = boolean | undefined;

interface RadioBooleanProps {
  /** Текущее значение */
  value: RadioBooleanValue;
  /** Callback при изменении значения */
  onChange: (value: RadioBooleanValue) => void;
  /** Разрешить выбор undefined (по умолчанию false) */
  allowUndefined?: boolean;
  /** Обязательное поле - если true и allowUndefined=true, undefined будет недоступен */
  required?: boolean;
  /** Размер компонента */
  size?: 's' | 'm' | 'l' | 'xl';
  /** Отключить компонент */
  disabled?: boolean;
  /** Текст для значения true */
  trueLabel?: string;
  /** Текст для значения false */
  falseLabel?: string;
  /** Текст для значения undefined */
  undefinedLabel?: string;
}

/**
 * Компонент для выбора boolean значения с возможностью выбора undefined
 */
export const RadioBoolean: React.FC<RadioBooleanProps> = ({
  value,
  onChange,
  allowUndefined = false,
  required = false,
  size = 'm',
  disabled = false,
  trueLabel = 'True',
  falseLabel = 'False',
  undefinedLabel = 'Undefined',
}) => {
  // Определяем, показывать ли опцию undefined
  // Показываем если allowUndefined=true И required=false
  const showUndefined = allowUndefined && !required;

  // Конвертируем boolean в строку для SegmentedRadioGroup
  const stringValue = useMemo(() => {
    if (value === true) return 'true';
    if (value === false) return 'false';
    // Если значение undefined и showUndefined=false, показываем false по умолчанию
    return showUndefined ? 'undefined' : 'false';
  }, [value, showUndefined]);

  // Обработчик изменения
  const handleUpdate = (newValue: string) => {
    if (newValue === 'true') {
      onChange(true);
    } else if (newValue === 'false') {
      onChange(false);
    } else {
      onChange(undefined);
    }
  };

  // Формируем массив опций
  const options = [
    <SegmentedRadioGroup.Option key="true" value="true" content={trueLabel} />,
    <SegmentedRadioGroup.Option
      key="false"
      value="false"
      content={falseLabel}
    />,
  ];

  if (showUndefined) {
    options.push(
      <SegmentedRadioGroup.Option
        key="undefined"
        value="undefined"
        content={undefinedLabel}
      />,
    );
  }

  // Определяем CSS класс в зависимости от значения
  const className = cx(css.radioBoolean, {
    [css.isTrue]: value === true,
    [css.isFalse]: value === false,
    [css.isUndefined]: value === undefined,
  });

  return (
    <SegmentedRadioGroup
      value={stringValue}
      onUpdate={handleUpdate}
      size={size}
      disabled={disabled}
      className={className}
    >
      {options}
    </SegmentedRadioGroup>
  );
};
