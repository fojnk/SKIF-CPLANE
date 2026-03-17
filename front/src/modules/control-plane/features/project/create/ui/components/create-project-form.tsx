import { Button, Flex } from '@gravity-ui/uikit';
import React from 'react';

import {
  DataItemCard,
  FormFieldInput,
  FormFieldTextarea,
} from '@/modules/control-plane/shared/ui';
import { validators } from '@/shared/lib/final-form';

interface CreateProjectFormProps {
  namespace: string;
  resetNamespace: () => void;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  namespace,
  resetNamespace,
}) => {
  return (
    <Flex direction="column" gapRow={3}>
      <Flex direction="row" gap={2} alignItems="flex-end">
        <DataItemCard
          name={namespace}
          fieldName="Рабочее пространство"
          required
        />
        <Button
          view="flat-action"
          onClick={resetNamespace}
          size="l"
          style={{ width: '80px', flexShrink: 0 }}
        >
          Изменить
        </Button>
      </Flex>
      <FormFieldInput
        fieldName="name"
        label="Название проекта"
        validate={validators.required}
        required
        hasClear
      />
      <FormFieldTextarea
        fieldName="description"
        label="Описание проекта"
        hasClear
      />
    </Flex>
  );
};
