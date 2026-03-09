import { Button, Flex } from '@gravity-ui/uikit';
import React from 'react';

import { DatasetDC } from '@/modules/stream-flow/shared/types';
import {
  DatasetTypeLabel,
  FormFieldInput,
  ManagedLabel,
  DataItemCard,
} from '@/modules/stream-flow/shared/ui';
import { validators } from '@/shared/lib/final-form';

interface DsFormProps {
  selectedDS: DatasetDC;
  onResetSelected: () => void;
}

export const DsForm = ({ onResetSelected, selectedDS }: DsFormProps) => {
  return (
    <Flex direction="column" gapRow={2}>
      <Flex direction="row" gap={2} alignItems="center">
        <DataItemCard
          name={selectedDS.name!}
          labelsAfter={
            <Flex direction="row" gap={1}>
              {selectedDS.managed && <ManagedLabel size="xs" />}
              <DatasetTypeLabel type={selectedDS.type} showValue={false} />
            </Flex>
          }
        />
        <Button
          view="flat-action"
          onClick={onResetSelected}
          size="l"
          style={{ width: 'fit-content', flexShrink: 0 }}
        >
          change
        </Button>
      </Flex>

      <FormFieldInput
        fieldName="alias"
        label="Alias"
        validate={validators.required}
        required
        hasClear
        autoFocus
        placeholder="Enter your alias"
      />
    </Flex>
  );
};
