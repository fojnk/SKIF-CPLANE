import { Dialog, Flex, Label, Text } from '@gravity-ui/uikit';
import React from 'react';

import { LogDataDC } from '@/modules/control-plane/shared/types';
import { FullDate, VkUser } from '@/modules/control-plane/shared/ui';
import { getActionColor } from '@/modules/control-plane/shared/utils/getActionColor';
import { GlobalLoader } from '@/shared/ui/loaders';

interface LogRendererProps {
  type: string;
  log: LogDataDC;
  loading: boolean;
  isBig: boolean;
  open: boolean;
  onClose: () => void;
  reset: () => void;
  children: React.ReactNode;
  comment?: React.ReactNode;
}

export const LogDialog: React.FC<LogRendererProps> = ({
  log,
  loading,
  isBig,
  open,
  onClose,
  reset,
  children,
  comment,
}) => {
  const renderContent = () => {
    if (loading) {
      return (
        <Flex
          direction="column"
          style={{ position: 'relative', height: '200px' }}
        >
          <GlobalLoader size="m" absolute />
        </Flex>
      );
    }
    return (
      <>
        <Dialog.Header
          caption={
            <Flex
              direction="row"
              alignItems="flex-end"
              justifyContent="space-between"
              gap={2}
            >
              <Text
                variant="header-1"
                ellipsis
                ellipsisLines={1}
                wordBreak="break-all"
              >{`${log.name}`}</Text>
              <Flex direction="row" alignItems="flex-end" gap={1}>
                <Label
                  size="s"
                  type="copy"
                  copyText={log.id!.toString()}
                  value={log.id!.toString()}
                >
                  Log ID
                </Label>
              </Flex>
            </Flex>
          }
        />
        <Dialog.Body>
          <Flex
            direction="column"
            gapRow={4}
            style={{ paddingBottom: 12, height: '100%' }}
          >
            <Flex direction="row" gap={4} wrap="wrap">
              {log.created_at && <FullDate date={log.created_at} showSeconds />}
              <VkUser user={log.user} />
              <Flex direction="row" gap={2}>
                <Text variant="body-1">
                  <b>action:</b>
                </Text>
                <Text variant="body-1" color={getActionColor(log.act)}>
                  {log.act}
                </Text>
              </Flex>
            </Flex>
            {children}
            {comment}
          </Flex>
        </Dialog.Body>
      </>
    );
  };

  return (
    <Dialog
      onTransitionOutComplete={reset}
      open={open}
      onClose={onClose}
      size={isBig ? 'l' : 'm'}
      disableOutsideClick
      className={`sf-dialog ${isBig ? 'variable-dialog' : ''}`}
    >
      {renderContent()}
    </Dialog>
  );
};
