import {
  CircleCheck,
  CircleInfoFill,
  CircleXmark,
  Database,
} from '@gravity-ui/icons';
import {
  Flex,
  Icon,
  Label,
  SegmentedRadioGroup,
  Text,
  Tooltip,
  ClipboardButton,
} from '@gravity-ui/uikit';
import React from 'react';

import { ShowVersionMode } from '@/modules/control-plane/features/dataset/version/show/types';
import { DatasetTypeLabel } from '@/modules/control-plane/shared/ui';

import { HeaderActions } from './header-actions';

type Tab = 'config' | 'schema';

interface Props {
  experimentName: string;
  version: number;
  mode: ShowVersionMode;
  head: boolean;
  setMode: (mode: ShowVersionMode) => void;
  isPublic?: boolean;
  tab: Tab;
  setTab: (tab: Tab) => void;
  dsType?: string;
  isHeadPublic?: boolean;
  versionValue: string;
  comment?: string;
}

export const ModalHeader = ({
  experimentName,
  version,
  mode,
  head,
  setMode,
  isPublic,
  tab,
  setTab,
  dsType,
  isHeadPublic,
  versionValue,
  comment,
}: Props) => {
  return (
    <Flex direction="column" gapRow={3}>
      <Flex
        direction="row"
        alignItems="center"
        gap={2}
        justifyContent="space-between"
        style={{ width: '100%' }}
      >
        <Flex
          direction="row"
          alignItems="center"
          gap={2}
          style={{ flexGrow: 1, minWidth: 0 }}
        >
          <Icon
            data={Database}
            className="no-shrink"
            size={16}
            style={{
              color: 'var(--g-color-text-secondary)',
            }}
          />
          <Text
            variant="subheader-3"
            ellipsis
            style={{ flexShrink: 1, minWidth: 0 }}
          >
            {experimentName}
          </Text>
          {dsType && (
            <DatasetTypeLabel type={dsType} showValue={false} size="xs" />
          )}
        </Flex>
        <Flex direction="row" alignItems="center" gap={2}>
          {!head && <HeaderActions setMode={setMode} mode={mode} />}
          <Flex
            direction="row"
            alignItems="center"
            gap={2}
            style={{
              marginLeft: '10px',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              paddingRight: '10px',
            }}
          >
            {comment && comment !== '' && (
              <Tooltip content={comment} openDelay={0} closeDelay={200}>
                <Icon
                  data={CircleInfoFill}
                  size={16}
                  style={{ color: 'var(--g-color-text-secondary)' }}
                />
              </Tooltip>
            )}
            <Text variant="subheader-2">Версия: {version}</Text>
            <ClipboardButton
              text={versionValue}
              size="xs"
              view="flat-secondary"
              tooltipInitialText={`Скопировать версию ${tab}`}
            />
            {head && (
              <Label theme="success" size="xs">
                HEAD
              </Label>
            )}
          </Flex>
        </Flex>
      </Flex>
      {mode !== 'edit' && (
        <Flex
          direction="row"
          alignItems="center"
          gap={4}
          style={{ width: '100%' }}
          justifyContent="space-between"
        >
          <SegmentedRadioGroup value={tab} onUpdate={setTab} size="s">
            <SegmentedRadioGroup.Option value="config" content="Конфиг" />
            <SegmentedRadioGroup.Option value="schema" content="Схема" />
          </SegmentedRadioGroup>
          <Flex gap={4} direction="row" alignItems="center">
            {isPublic !== undefined && (
              <Flex direction="row" alignItems="center" gap={1}>
                <Text variant="subheader-1">Публичный:</Text>
                <Text
                  color={isPublic ? 'positive' : 'danger'}
                  style={{ lineHeight: 1 }}
                >
                  <Icon data={isPublic ? CircleCheck : CircleXmark} size={16} />
                </Text>
                {mode === 'compare' && isHeadPublic !== undefined && (
                  <>
                    <Text variant="subheader-1" color="secondary">
                      |
                    </Text>
                    <Text
                      color={isHeadPublic ? 'positive' : 'danger'}
                      style={{ lineHeight: 1 }}
                    >
                      <Icon
                        data={isHeadPublic ? CircleCheck : CircleXmark}
                        size={16}
                      />
                    </Text>
                  </>
                )}
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
