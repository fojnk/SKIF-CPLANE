import {
  ArrowsRotateLeft,
  ChevronDown,
  ChevronUp,
  Cube,
} from '@gravity-ui/icons';
import { Flex, Icon, Text } from '@gravity-ui/uikit';
import React, { forwardRef, useMemo } from 'react';

import { CubeType } from '@/modules/control-plane/entities/cubes';
import { DeleteButton } from '@/modules/control-plane/shared/components/forms';

import css from './cubes.module.scss';

interface CubeDisclosureProps {
  /** Название куба */
  title: string;
  /** Тип куба (для иконки) */
  cubeType?: CubeType;
  /** Раскрыт ли disclosure */
  expanded: boolean;
  /** Выбран ли куб */
  selected?: boolean;
  /** Есть ли ошибка */
  hasError?: boolean;
  /** Обработчик переключения disclosure */
  onToggle: (expanded: boolean) => void;
  /** Обработчик удаления (если передан — показывается кнопка удаления) */
  onDelete?: () => void;
  /** Контент disclosure */
  children: React.ReactNode;
}

/**
 * Универсальный компонент disclosure для куба
 * Поддерживает режим просмотра и редактирования
 */
export const CubeDisclosure = forwardRef<HTMLDivElement, CubeDisclosureProps>(
  (
    {
      title,
      cubeType = CubeType.CUBE,
      expanded,
      selected,
      hasError,
      onToggle,
      onDelete,
      children,
    },
    ref,
  ) => {
    // Иконка в зависимости от типа куба
    const cubeIcon = cubeType === CubeType.RETRY ? ArrowsRotateLeft : Cube;

    // Формируем className блока
    const blockClassName = useMemo(() => {
      const classes = [css.cubeDisclosure];
      if (selected) classes.push(css.isSelected);
      if (hasError) classes.push(css.hasError);
      return classes.join(' ');
    }, [selected, hasError]);

    // Цвет текста и иконки
    const textColor = hasError ? 'danger' : undefined;
    const iconColor = hasError ? 'var(--g-color-text-danger)' : undefined;

    return (
      <div ref={ref} className={blockClassName}>
        <Flex direction="column" gap={0}>
          {/* Header */}
          <Flex
            direction="row"
            alignItems="center"
            gap={2}
            className={css.cubeDisclosureHeader}
            onClick={() => onToggle(!expanded)}
          >
            <div style={{ color: iconColor, display: 'flex' }}>
              <Icon data={cubeIcon} className="no-shrink" size={12} />
            </div>
            <Text
              variant="subheader-1"
              color={textColor}
              ellipsis
              style={{ flex: 1, textAlign: 'left' }}
            >
              {title}
            </Text>
            {onDelete && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex' }}
              >
                <DeleteButton onClick={onDelete} />
              </div>
            )}
            <Icon
              data={expanded ? ChevronUp : ChevronDown}
              size={16}
              style={{ color: iconColor }}
            />
          </Flex>

          {/* Content */}
          {expanded && (
            <Flex direction="column" className={css.cubeDisclosureContent}>
              {children}
            </Flex>
          )}
        </Flex>
      </div>
    );
  },
);

CubeDisclosure.displayName = 'CubeDisclosure';
