import { ChevronDown, ChevronUp } from '@gravity-ui/icons';
import { Flex, Icon, Text } from '@gravity-ui/uikit';
import React, { useEffect, useMemo, useState } from 'react';

import css from './param-disclosure.module.scss';

interface Props {
  title: string;
  beforeTitle?: React.ReactNode;
  afterTitle?: React.ReactNode;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean; // Контролируемое состояние
  onToggle?: (expanded: boolean) => void; // Callback для изменения состояния
  width?: 'max' | 'auto';
  size?: 1 | 2 | 3;
  paddingLeft?: number;
  hasBorder?: boolean;
  hasError?: boolean;
  required?: boolean;
  itemsCounter?: number; // Счётчик элементов
}

export const ParamDisclosure = React.memo<Props>(
  ({
    title,
    children,
    beforeTitle,
    afterTitle,
    defaultExpanded = false,
    expanded: controlledExpanded,
    onToggle,
    width = 'max',
    size = 2,
    paddingLeft = 6,
    hasBorder = false,
    hasError = false,
    required = false,
    itemsCounter,
  }) => {
    const [internalExpanded, setInternalExpanded] = useState(
      controlledExpanded !== undefined ? controlledExpanded : defaultExpanded,
    );

    // Синхронизируем внутреннее состояние с контролируемым
    useEffect(() => {
      if (controlledExpanded !== undefined) {
        setInternalExpanded(controlledExpanded);
      }
    }, [controlledExpanded]);

    // Используем контролируемое состояние, если оно передано
    const expanded =
      controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

    const headerStyle = useMemo(
      () => ({
        cursor: 'pointer',
        userSelect: 'none' as const,
        width: width === 'auto' ? 'fit-content' : '100%',
      }),
      [width],
    );

    const contentStyle = useMemo(
      () => ({
        paddingLeft: `${paddingLeft}px`,
        maxHeight: expanded ? 'unset' : '0',
        overflow: 'hidden' as const,
        marginTop: expanded ? '6px' : 0,
      }),
      [paddingLeft, expanded],
    );

    const textVariant = useMemo(() => `subheader-${size}` as const, [size]);
    const textColor = hasError ? 'danger' : undefined;
    const iconColor = hasError ? 'var(--g-color-text-danger)' : undefined;

    const className = useMemo(() => {
      if (!hasBorder) return undefined;
      return hasError ? `${css.discBlock} ${css.hasError}` : css.discBlock;
    }, [hasBorder, hasError]);

    return (
      <Flex direction="column" gap={0} className={className}>
        <Flex
          direction="row"
          alignItems="center"
          gap={2}
          style={headerStyle}
          onClick={() => {
            const newExpanded = !expanded;
            if (onToggle) {
              onToggle(newExpanded);
            } else {
              setInternalExpanded(newExpanded);
            }
          }}
        >
          {beforeTitle && (
            <div style={{ color: iconColor, display: 'flex' }}>
              {beforeTitle}
            </div>
          )}
          <Flex
            direction="row"
            alignItems="center"
            gap={0}
            style={{ flex: 1, minWidth: 0 }}
          >
            <Text
              variant={textVariant}
              color={textColor}
              ellipsis
              style={{ textAlign: 'left' }}
            >
              {title}
            </Text>
            {required && (
              <Text
                variant={textVariant}
                color="danger"
                style={{ flexShrink: 0, marginLeft: '2px' }}
              >
                *
              </Text>
            )}
            {itemsCounter !== undefined && !expanded && (
              <Text
                variant="body-1"
                color="secondary"
                style={{ flexShrink: 0, marginLeft: '6px' }}
              >
                {itemsCounter}
              </Text>
            )}
          </Flex>
          <Icon
            data={expanded ? ChevronUp : ChevronDown}
            size={16}
            style={{ color: iconColor }}
          />
          {afterTitle && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex' }}
            >
              {afterTitle}
            </div>
          )}
        </Flex>
        {children && (
          <Flex direction="column" style={contentStyle}>
            {children}
          </Flex>
        )}
      </Flex>
    );
  },
);

ParamDisclosure.displayName = 'ParamDisclosure';
