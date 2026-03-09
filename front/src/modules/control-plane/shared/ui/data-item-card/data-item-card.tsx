import { Flex, Text } from '@gravity-ui/uikit';
import React, { ReactNode } from 'react';

import css from './index.module.scss';

interface DataItemCardProps {
  name: string;
  actionsBefore?: ReactNode;
  labelsBefore?: ReactNode;
  labelsAfter?: ReactNode;
  actionsAfter?: ReactNode;
  onNameClick?: () => void;
  fieldName?: string;
  required?: boolean;
}

export const DataItemCard = ({
  name,
  labelsBefore,
  labelsAfter,
  actionsBefore,
  actionsAfter,
  onNameClick,
  fieldName,
  required,
}: DataItemCardProps) => {
  return (
    <Flex direction="column" gap={0} style={{ width: '100%' }}>
      {fieldName && (
        <Flex direction="row">
          <Text variant="caption-2" color="primary" style={{ opacity: 0.9 }}>
            {fieldName}
          </Text>
          {required && (
            <Text variant="body-1" color="danger">
              *
            </Text>
          )}
        </Flex>
      )}
      <Flex
        direction="row"
        className={css.dataItemCard}
        gapRow={2}
        justifyContent="space-between"
      >
        <Flex direction="row" alignItems="center" gap="2">
          {actionsBefore || labelsBefore ? (
            <Flex direction="row" gap="2" alignItems="center">
              {actionsBefore}
              {labelsBefore && (
                <Flex direction="row" justifyContent="flex-start">
                  {labelsBefore}
                </Flex>
              )}
            </Flex>
          ) : null}
          <Text
            variant="subheader-1"
            ellipsis
            ellipsisLines={3}
            wordBreak="break-all"
            onClick={onNameClick}
            style={{
              cursor: onNameClick ? 'pointer' : 'initial',
              fontWeight: '500',
            }}
          >
            {name}
          </Text>
        </Flex>
        {actionsAfter || labelsAfter ? (
          <Flex direction="row" gap="2" alignItems="center">
            {actionsAfter}
            {labelsAfter && (
              <Flex direction="row" justifyContent="flex-start">
                {labelsAfter}
              </Flex>
            )}
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
};
