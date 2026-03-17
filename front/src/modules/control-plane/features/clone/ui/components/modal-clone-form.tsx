import { Button, Flex } from '@gravity-ui/uikit';
import React from 'react';

import { ProjectDC } from '@/modules/control-plane/shared/types';
import {
  FormFieldInput,
  DataItemCard,
  FormFieldTextarea,
} from '@/modules/control-plane/shared/ui';
import { validators } from '@/shared/lib/final-form';

interface Props {
  selectedProject: ProjectDC;
  onResetSelected: () => void;
  srcName: string;
  srcType: string;
}

export const ModalCloneForm = ({
  onResetSelected,
  selectedProject,
  srcName,
  srcType,
}: Props) => {
  return (
    <Flex direction="column" gapRow={3}>
      <DataItemCard name={srcName} fieldName={srcType} />
      <FormFieldInput
        fieldName="name"
        label="Название"
        validate={validators.required}
        required
        hasClear
        autoFocus
        placeholder="Введите название"
      />
      <Flex direction="row" gap={2} alignItems="flex-end">
        <DataItemCard
          name={selectedProject.name!}
          fieldName="Целевой проект"
          required
        />
        <Button
          view="flat-action"
          onClick={onResetSelected}
          size="l"
          style={{ width: 'fit-content', flexShrink: 0 }}
        >
          сменить проект
        </Button>
      </Flex>
      <FormFieldTextarea fieldName="comment" label="Комментарий" hasClear />
    </Flex>
  );
};
