import { ClipboardButton, Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { ShowCubesMarketModel } from '@/modules/stream-flow/features/cubes/market';
import { CubeListDC } from '@/modules/stream-flow/shared/types';

// ============================================================================
// Компонент для отображения базовой информации о кубе (CubeType, ID, Params)
// ============================================================================

interface CubeBaseInfoProps {
  /** Базовый куб из списка */
  baseCube: CubeListDC | null;
  /** Ключ параметров (ParamsName) */
  paramsKey?: string | null;
  /** Разрешить добавление куба в маркете (для editor) */
  canAddInMarket?: boolean;
}

/**
 * Отображает базовую информацию о кубе:
 * - CubeType (кликабельный, открывает маркет)
 * - CubeTypeId (опционально)
 * - Params (если есть)
 */
export const CubeBaseInfo: React.FC<CubeBaseInfoProps> = ({
  baseCube,
  paramsKey,
  canAddInMarket = false,
}) => {
  if (!baseCube) {
    return null;
  }

  const handleCubeTypeClick = () => {
    if (baseCube.id) {
      ShowCubesMarketModel.start({
        cubeId: baseCube.id,
        canAdd: canAddInMarket,
      });
    }
  };

  return (
    <Flex direction="column" gap={1}>
      {/* CubeType */}
      <Flex
        direction="row"
        justifyContent="space-between"
        gap={2}
        style={{ overflow: 'hidden' }}
      >
        <Flex direction="row" gap={1} alignItems="center">
          <Text variant="body-1" color="secondary">
            CubeType:
          </Text>
          <Text
            variant="body-1"
            color="info"
            ellipsis
            style={{ cursor: 'pointer' }}
            onClick={handleCubeTypeClick}
          >
            {baseCube.name}
          </Text>
          <ClipboardButton
            text={baseCube.name ?? ''}
            size="xs"
            view="flat-secondary"
            style={{ flexShrink: 0 }}
          />
        </Flex>
      </Flex>

      <Flex direction="row" gap={1} alignItems="center">
        <Text variant="body-1" color="secondary">
          CubeTypeId:
        </Text>
        <Text variant="body-1">{baseCube.id}</Text>
        <ClipboardButton
          text={String(baseCube.id)}
          size="xs"
          view="flat-secondary"
        />
      </Flex>

      {paramsKey && (
        <Flex direction="row" gap={1} alignItems="center">
          <Text variant="body-1" color="secondary">
            Params:
          </Text>
          <Text variant="body-1">{paramsKey}</Text>
          <ClipboardButton text={paramsKey} size="xs" view="flat-secondary" />
        </Flex>
      )}
    </Flex>
  );
};
