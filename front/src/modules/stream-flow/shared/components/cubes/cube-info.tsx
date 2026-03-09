import { ChevronDown, ChevronUp } from '@gravity-ui/icons';
import {
  Button,
  ClipboardButton,
  Flex,
  Icon,
  Label,
  Text,
} from '@gravity-ui/uikit';
import React, { useMemo, useState } from 'react';

import { ShowCubeParamsModel } from '@/modules/stream-flow/features/cubes/show-params';
import { CubeInfoDC } from '@/modules/stream-flow/shared/types';

import { CubeArgs } from './cube-args';

interface CubeInfoProps {
  cube: CubeInfoDC;
  showTitle?: boolean;
}

interface SectionHeaderProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  defaultExpanded?: boolean;
}

// Вынесен за пределы CubeInfo для предотвращения пересоздания
const SectionHeader = React.memo<SectionHeaderProps>(
  ({ children, content, defaultExpanded = false }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const style = useMemo(() => ({ opacity: 0.6 }), []);

    // Если content не передан, работаем как обычный заголовок
    if (!content) {
      return (
        <Text variant="subheader-1" style={style}>
          {children}
        </Text>
      );
    }

    // Если content передан, работаем как disclosure
    return (
      <Flex direction="column" gap={1}>
        <Flex
          direction="row"
          alignItems="center"
          gap={2}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            width: 'fit-content',
          }}
          onClick={() => setExpanded((prev) => !prev)}
        >
          <Text variant="subheader-1" ellipsis style={style}>
            {children}
          </Text>
          <Text style={style}>
            <Icon data={expanded ? ChevronUp : ChevronDown} size={16} />
          </Text>
        </Flex>
        {expanded && <Flex direction="column">{content}</Flex>}
      </Flex>
    );
  },
);

SectionHeader.displayName = 'SectionHeader';

export const CubeInfo = React.memo<CubeInfoProps>(
  ({ cube, showTitle = true }) => {
    // Мемоизируем контент описания
    const descriptionContent = useMemo(
      () =>
        cube.description ? (
          <Text
            variant="body-1"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            {cube.description}
          </Text>
        ) : null,
      [cube.description],
    );

    return (
      <Flex direction="column" gap={3}>
        {showTitle && (
          <Flex
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
            style={{ minWidth: 0 }}
          >
            <Flex
              direction="row"
              gap={2}
              alignItems="center"
              justifyContent="flex-start"
              style={{ overflow: 'hidden' }}
            >
              <Text variant="header-1" ellipsis>
                {cube.name}
              </Text>
              <ClipboardButton
                text={cube.name || ''}
                size="xs"
                view="flat-secondary"
                style={{ flexShrink: 0 }}
              />
            </Flex>
            {cube.id && (
              <Label theme="clear" type="copy" value={`${cube.id}`}>
                ID
              </Label>
            )}
          </Flex>
        )}

        {cube.author && (
          <Flex direction="row" gap={1} alignItems="center">
            <SectionHeader>Author:</SectionHeader>
            <Text variant="body-1">{cube.author}</Text>
            <ClipboardButton
              text={cube.author}
              size="xs"
              view="flat-secondary"
            />
          </Flex>
        )}

        {cube.base_cube?.name && (
          <Flex direction="row" gap={1} alignItems="center">
            <SectionHeader>Base Cube</SectionHeader>
            <Text variant="body-1">{cube.base_cube.name}</Text>
            <ClipboardButton
              text={cube.base_cube.name}
              size="xs"
              view="flat-secondary"
            />
          </Flex>
        )}

        {cube.description && (
          <SectionHeader
            defaultExpanded={
              cube.description.length < 200 &&
              (cube.description.match(/\n/g) || []).length <= 3
            }
            content={descriptionContent}
          >
            Description
          </SectionHeader>
        )}

        {cube.params_name && (
          <Flex direction="column" gap={1}>
            <SectionHeader>Params name</SectionHeader>
            <Flex direction="row" gap={1} alignItems="center">
              <Text variant="body-1">{cube.params_name}</Text>
              <ClipboardButton
                text={cube.params_name}
                size="xs"
                view="flat-secondary"
              />
            </Flex>
          </Flex>
        )}

        {cube.cube_params && (
          <Flex direction="column" gap={1}>
            <Flex direction="row" gap={3}>
              <SectionHeader>Cube Parameters</SectionHeader>
              <Button
                size="xs"
                onClick={() =>
                  ShowCubeParamsModel.start({
                    cubeName: cube.name || 'Cube',
                    cubeParams: cube.cube_params || '{}',
                  })
                }
              >
                Show json
              </Button>
            </Flex>
            <CubeArgs params={cube.cube_params} />
          </Flex>
        )}
      </Flex>
    );
  },
);

CubeInfo.displayName = 'CubeInfo';
