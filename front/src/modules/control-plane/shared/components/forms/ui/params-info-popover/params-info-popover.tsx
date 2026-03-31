import { Check } from '@gravity-ui/icons';
import { Flex, Icon, Label, Popover, Text } from '@gravity-ui/uikit';
import React, { useMemo } from 'react';

import { ParamsTypeConstraintDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';
import { getStringTypeTheme } from '@/modules/control-plane/shared/utils/variablesHelpers';

interface ParamsInfoPopoverProps {
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  typeConstraint?: ParamsTypeConstraintDC;
  children: React.ReactNode;
}

// Вынесена за пределы компонента для предотвращения пересоздания
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderValueRecursive = (
  value: any,
  level: number = 0,
): React.ReactNode => {
  if (value === null || value === undefined) {
    return (
      <Text variant="body-1" color="hint">
        null
      </Text>
    );
  }

  const valueType = typeof value;

  // Обработка массивов
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <Text variant="body-1" color="hint">
          []
        </Text>
      );
    }

    return (
      <Flex
        direction="column"
        gap={0.5}
        style={{ marginLeft: `${8 * level}px` }}
      >
        {value.map((item, index) => (
          <Flex key={index} direction="row" gap={1} alignItems="flex-start">
            <Text variant="body-1" color="secondary">
              [{index}]:
            </Text>
            {renderValueRecursive(item, level + 1)}
          </Flex>
        ))}
      </Flex>
    );
  }

  // Обработка объектов
  if (valueType === 'object' && value !== null) {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return (
        <Text variant="body-1" color="hint">
          {'{}'}
        </Text>
      );
    }

    return (
      <Flex
        direction="column"
        gap={0.5}
        style={{ marginLeft: `${8 * level}px` }}
      >
        {keys.map((key) => (
          <Flex key={key} direction="row" gap={1} alignItems="flex-start">
            <Text variant="body-1" color="secondary">
              {key}:
            </Text>
            {renderValueRecursive(value[key], level + 1)}
          </Flex>
        ))}
      </Flex>
    );
  }

  // Обработка простых типов
  if (valueType === 'boolean') {
    return (
      <Text variant="body-1" color={value ? 'positive' : 'danger'}>
        {String(value)}
      </Text>
    );
  }

  if (valueType === 'number') {
    return <Text variant="body-1">{value}</Text>;
  }

  if (valueType === 'string') {
    return <Text variant="body-1">{value}</Text>;
  }

  return <Text variant="body-1">{String(value)}</Text>;
};

export const ParamsInfoPopover = ({
  description,
  defaultValue,
  typeConstraint,
  children,
}: ParamsInfoPopoverProps) => {
  const hasContent = useMemo(
    () => description || defaultValue !== undefined || typeConstraint,
    [description, defaultValue, typeConstraint],
  );

  const renderDefaultValue = () => {
    if (defaultValue === undefined) {
      return null;
    }

    const valueType = typeof defaultValue;
    const isMultiline = typeConstraint?.multiline === true;
    // Проверяем, содержит ли строка переносы строк (даже если multiline не указан)
    const hasNewlines = valueType === 'string' && defaultValue.includes('\n');

    // Для multiline строк или строк с переносами выводим с сохранением переносов
    if ((isMultiline || hasNewlines) && valueType === 'string') {
      return (
        <Text
          variant="body-1"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {defaultValue}
        </Text>
      );
    }

    // Для объектов и массивов используем рекурсивный вывод
    if (
      Array.isArray(defaultValue) ||
      (valueType === 'object' && defaultValue !== null)
    ) {
      return renderValueRecursive(defaultValue, 0);
    }

    // Для простых типов
    if (valueType === 'boolean') {
      return (
        <Text variant="body-1" color={defaultValue ? 'positive' : 'danger'}>
          {String(defaultValue)}
        </Text>
      );
    }

    if (valueType === 'number') {
      return <Text variant="body-1">{defaultValue}</Text>;
    }

    return <Text variant="body-1">{String(defaultValue)}</Text>;
  };

  const renderTypeConstraint = () => {
    if (!typeConstraint) {
      return null;
    }

    const hasAnyConstraint =
      typeConstraint.gt !== undefined ||
      typeConstraint.lt !== undefined ||
      typeConstraint.enum !== undefined ||
      typeConstraint.length !== undefined ||
      typeConstraint.multiline !== undefined ||
      typeConstraint.string_type !== undefined;

    if (!hasAnyConstraint) {
      return null;
    }

    return (
      <Flex direction="column" gap={1}>
        <Flex direction="column" gap={1}>
          {typeConstraint.gt !== undefined && (
            <Text variant="body-1">&gt; {typeConstraint.gt}</Text>
          )}
          {typeConstraint.lt !== undefined && (
            <Text variant="body-1">&lt; {typeConstraint.lt}</Text>
          )}
          {typeConstraint.length !== undefined && (
            <Text variant="body-1">length: {typeConstraint.length}</Text>
          )}
          {typeConstraint.multiline === true && (
            <Flex direction="row" gap={1} alignItems="center">
              <Text variant="body-1">multiline</Text>
              <Icon
                data={Check}
                size={14}
                style={{ color: 'var(--g-color-text-positive)' }}
              />
            </Flex>
          )}
          {typeConstraint.string_type && (
            <Flex direction="row" gap={1} alignItems="center">
              <Text variant="body-1">type:</Text>
              <Label
                size="xs"
                theme={getStringTypeTheme(typeConstraint.string_type)}
              >
                {typeConstraint.string_type}
              </Label>
            </Flex>
          )}
          {typeConstraint.enum && typeConstraint.enum.length > 0 && (
            <Flex direction="column" gap={0.5}>
              <Text variant="body-1">enum:</Text>
              <Flex direction="column" gap={0.5} style={{ marginLeft: '9px' }}>
                {typeConstraint.enum.map((value, index) => (
                  <Text key={index} variant="body-1" color="secondary">
                    {value}
                  </Text>
                ))}
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    );
  };

  if (!hasContent) {
    return <>{children}</>;
  }

  return (
    <Popover
      content={
        <Flex direction="column" gap={2} style={{ padding: '8px' }}>
          {description && (
            <Flex direction="column" gap={1}>
              <Text variant="body-1">{description}</Text>
            </Flex>
          )}
          {renderTypeConstraint()}
          {defaultValue !== undefined &&
            (() => {
              const isMultiline = typeConstraint?.multiline === true;
              const hasNewlines =
                typeof defaultValue === 'string' && defaultValue.includes('\n');
              const isShortValue =
                !isMultiline &&
                !hasNewlines &&
                String(defaultValue).length <= 30;

              return (
                <Flex
                  direction={isShortValue ? 'row' : 'column'}
                  gap={isShortValue ? 2 : 1}
                  alignItems={isShortValue ? 'center' : 'flex-start'}
                >
                  <Text variant="subheader-1" color="secondary">
                    Default value:
                  </Text>
                  {renderDefaultValue()}
                </Flex>
              );
            })()}
        </Flex>
      }
      placement="right"
      openDelay={0}
    >
      <span style={{ display: 'inline-flex' }}>{children}</span>
    </Popover>
  );
};
