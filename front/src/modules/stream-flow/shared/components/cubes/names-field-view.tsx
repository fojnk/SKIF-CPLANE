import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { CubeIOType } from '@/modules/stream-flow/entities/cubes';
import { ValueText } from '@/modules/stream-flow/shared/components/forms';

// ============================================================================
// Компонент для отображения InputNames/OutputNames с типом (только просмотр)
// ============================================================================

interface NamesFieldViewProps {
  label: string;
  type: CubeIOType;
  names: string[];
}

/**
 * Отображает список имён портов (InputNames/OutputNames) с индикацией типа.
 * Только для режима просмотра.
 */
export const NamesFieldView: React.FC<NamesFieldViewProps> = ({
  label,
  type,
  names,
}) => {
  // Определяем цвет текста в зависимости от типа
  const getTypeColor = (): 'secondary' | 'positive' | 'warning' => {
    switch (type) {
      case CubeIOType.STATIC:
        return 'positive';
      case CubeIOType.DYNAMIC:
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Empty и нет имён - просто показываем label и тип
  if (type === CubeIOType.EMPTY && names.length === 0) {
    return (
      <Flex direction="row" gap={2} alignItems="center">
        <Text variant="body-1" style={{ fontWeight: 600 }}>
          {label}:
        </Text>
        <Text variant="body-1" color={getTypeColor()}>
          {type}
        </Text>
      </Flex>
    );
  }

  // Static или Dynamic с именами
  return (
    <Flex direction="column" gap={1}>
      <Flex direction="row" gap={2} alignItems="center">
        <Text variant="body-1" style={{ fontWeight: 600 }}>
          {label}:
        </Text>
        <Text variant="body-1" color={getTypeColor()}>
          {type}
        </Text>
      </Flex>
      {names.length === 0 ? (
        <Text variant="body-1" color="secondary">
          no items
        </Text>
      ) : (
        <Flex direction="row" gap={1} style={{ flexWrap: 'wrap' }}>
          {names.map((name, index) => (
            <ValueText key={`${name}-${index}`} value={name} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
