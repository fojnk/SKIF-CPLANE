import { ChevronDown, ChevronRight } from '@gravity-ui/icons';
import { ClipboardButton, Flex, Icon, Label, Text } from '@gravity-ui/uikit';
import React, { useState } from 'react';

import { CubeInputMapping } from '@/modules/control-plane/entities/cubes';

import css from '../forms/form-param-view.module.scss';

// ============================================================================
// Типы
// ============================================================================

interface CubeMappingsViewProps {
  mappings: Record<string, CubeInputMapping>;
  /** Раскрыты ли элементы по умолчанию */
  defaultExpanded?: boolean;
}

// ============================================================================
// Компоненты для отображения значений
// ============================================================================

const ValueText: React.FC<{ value?: string }> = ({ value }) => (
  <Flex
    direction="row"
    justifyContent="space-between"
    gap={1}
    style={{ width: '100%', position: 'relative' }}
  >
    <Text
      color="primary"
      wordBreak="break-all"
      whiteSpace="break-spaces"
      className={css.valueBox}
      variant="body-1"
      style={{ fontWeight: 600 }}
    >
      {value}
    </Text>
    <ClipboardButton
      text={value ?? ''}
      size="xs"
      view="flat-secondary"
      style={{ position: 'absolute', right: '3px', top: '3px' }}
    />
  </Flex>
);

// ============================================================================
// Компонент для одного маппинга
// ============================================================================

interface MappingItemViewProps {
  name: string;
  mapping: CubeInputMapping;
  defaultExpanded?: boolean;
}

const MappingItemView: React.FC<MappingItemViewProps> = ({
  name,
  mapping,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Определяем тип маппинга и соответствующий label/theme
  const getTypeInfo = () => {
    switch (mapping.Type) {
      case 'CIT_CUBE':
        return { label: 'Cube', theme: 'success' as const };
      case 'CIT_RETRY':
        return { label: 'Retry', theme: 'info' as const };
      case 'CIT_RESHARDER':
      default:
        return { label: 'Resharder', theme: 'warning' as const };
    }
  };

  const { label: typeLabel, theme: typeTheme } = getTypeInfo();
  const showCubeName =
    mapping.Type === 'CIT_CUBE' || mapping.Type === 'CIT_RETRY';
  const showOutputName = mapping.Type !== 'CIT_RETRY';

  return (
    <Flex
      direction="column"
      gap={0}
      style={{
        border: '1px dashed var(--g-color-line-generic)',
      }}
    >
      <Flex
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        style={{
          padding: '6px 10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Flex direction="row" alignItems="center" gap={1}>
          <Icon
            data={expanded ? ChevronDown : ChevronRight}
            size={14}
            style={{ color: 'var(--g-color-text-hint)', flexShrink: 0 }}
          />
          <Text variant="subheader-1" ellipsis>
            {name}
          </Text>
        </Flex>
        <Label theme={typeTheme} size="xs">
          {typeLabel}
        </Label>
      </Flex>
      {expanded && (
        <Flex
          direction="column"
          gap={2}
          style={{
            padding: '0 10px 12px 28px',
          }}
        >
          {showCubeName && mapping.CubeName && (
            <Flex direction="column" gap={0}>
              <Text
                variant="body-1"
                style={{
                  opacity: 0.8,
                  fontWeight: 400,
                  marginBottom: '4px',
                }}
              >
                CubeName
              </Text>
              <ValueText value={mapping.CubeName} />
            </Flex>
          )}
          {showOutputName && (
            <Flex direction="column" gap={0}>
              <Text
                variant="body-1"
                style={{
                  opacity: 0.8,
                  fontWeight: 400,
                  marginBottom: '4px',
                }}
              >
                OutputName
              </Text>
              <ValueText value={mapping.OutputName} />
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
};

// ============================================================================
// Главный компонент
// ============================================================================

export const CubeMappingsView: React.FC<CubeMappingsViewProps> = ({
  mappings,
  defaultExpanded = false,
}) => {
  if (!mappings || Object.keys(mappings).length === 0) {
    return (
      <Text variant="body-1" color="secondary">
        no mappings
      </Text>
    );
  }

  const entries = Object.entries(mappings);

  return (
    <Flex direction="column" gap={2}>
      {entries.map(([name, mapping]) => (
        <MappingItemView
          key={name}
          name={name}
          mapping={mapping}
          defaultExpanded={defaultExpanded}
        />
      ))}
    </Flex>
  );
};
