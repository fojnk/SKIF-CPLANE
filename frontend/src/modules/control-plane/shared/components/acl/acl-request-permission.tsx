import {
  Button,
  Dialog,
  Flex,
  Select,
  Text,
  TextArea,
} from '@gravity-ui/uikit';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createPermissionRequest,
} from '@/modules/control-plane/api/permission-requests-api';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui';
import { notifications } from '@/shared/ui/notifications';

export type PermissionRequestableEntity = 'namespace' | 'project' | 'experiment';

const EXPERIMENT_FULL_RIGHTS_OPTION_VALUE = '__experiment_full__';
const EXPERIMENT_FULL_RIGHTS_ATTRIBUTE_PATTERN =
  '^(|meta|dataset|experiment_state)$';

const ACTION_OPTIONS = [
  { value: '00R', content: 'Чтение' },
  { value: '01E', content: 'Изменение' },
  { value: '02C', content: 'Создание' },
  { value: '03D', content: 'Удаление' },
] as const;

const ATTRIBUTE_BY_ENTITY: Record<
  PermissionRequestableEntity,
  { value: string; content: string }[]
> = {
  namespace: [
    { value: 'meta', content: 'Метаданные и настройки (meta)' },
    { value: 'project', content: 'Проекты в области (project)' },
    { value: 'namespace', content: 'Сама область (namespace)' },
  ],
  project: [
    { value: 'meta', content: 'Метаданные и настройки (meta)' },
    { value: 'project', content: 'Проект (project)' },
    { value: 'experiment', content: 'Эксперименты (experiment)' },
    { value: 'dataset', content: 'Датасеты (dataset)' },
  ],
  experiment: [
    { value: 'meta', content: 'Метаданные (meta)' },
    { value: 'experiment', content: 'Эксперимент (experiment)' },
    { value: 'experiment_state', content: 'Состояние запуска (experiment_state)' },
    { value: 'dataset', content: 'Датасеты в эксперименте (dataset)' },
    {
      value: EXPERIMENT_FULL_RIGHTS_OPTION_VALUE,
      content: 'Полный доступ к эксперименту (все права)',
    },
  ],
};

const DIALOG_TITLE: Record<PermissionRequestableEntity, string> = {
  namespace: 'Заявка на доступ к рабочей области',
  project: 'Заявка на доступ к проекту',
  experiment: 'Заявка на доступ к эксперименту',
};

interface AclRequestPermissionActionProps {
  objectType: PermissionRequestableEntity;
  objectId: number;
}

export const AclRequestPermissionAction = ({
  objectType,
  objectId,
}: AclRequestPermissionActionProps) => {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<string>('00R');
  const [objectAttribute, setObjectAttribute] = useState<string>('meta');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const opts = ATTRIBUTE_BY_ENTITY[objectType];
    setAction('00R');
    setObjectAttribute(opts[0]?.value ?? 'meta');
    setMessage('');
    setPending(false);
  }, [open, objectType]);

  const attrOptions = ATTRIBUTE_BY_ENTITY[objectType];

  const canSubmit = objectId > 0 && !pending;
  const isExperimentFullRightsSelected =
    objectType === 'experiment' &&
    objectAttribute === EXPERIMENT_FULL_RIGHTS_OPTION_VALUE;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    const requestAction = isExperimentFullRightsSelected ? '03D' : action;
    const requestObjectAttribute = isExperimentFullRightsSelected
      ? EXPERIMENT_FULL_RIGHTS_ATTRIBUTE_PATTERN
      : objectAttribute;

    setPending(true);
    try {
      await createPermissionRequest({
        object_type: objectType,
        object_id: objectId,
        object_attribute: requestObjectAttribute,
        action: requestAction,
        message: message.trim(),
      });
      notifications.push({
        name: `perm-req-ok-${objectType}-${objectId}`,
        title: 'Заявка отправлена',
        type: 'success',
      });
      setOpen(false);
    } catch {
      notifications.push({
        name: `perm-req-err-${objectType}-${objectId}`,
        title: 'Не удалось отправить заявку',
        type: 'danger',
      });
    } finally {
      setPending(false);
    }
  }, [
    action,
    canSubmit,
    isExperimentFullRightsSelected,
    message,
    objectAttribute,
    objectId,
    objectType,
  ]);

  const actionSelectOptions = useMemo(
    () => ACTION_OPTIONS.map((o) => ({ value: o.value, content: o.content })),
    [],
  );

  return (
    <>
      <Button view="outlined" size="m" onClick={() => setOpen(true)}>
        Заказать права
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="s"
        className="sf-dialog"
      >
        <Dialog.Header caption={DIALOG_TITLE[objectType]} />
        <Dialog.Body>
          <Flex direction="column" gapRow={4}>
            <Text variant="body-2" color="secondary">
              Заявку увидит администратор на странице «Доступ». Пока она в
              статусе ожидания, дополнительные права не действуют.
            </Text>
            <Select
              label="Действие"
              width="max"
              size="l"
              options={actionSelectOptions}
              value={[action]}
              onUpdate={(v) => setAction(v[0] ?? '00R')}
              disabled={isExperimentFullRightsSelected}
            />
            <Select
              label="Область права"
              width="max"
              size="l"
              options={attrOptions}
              value={[objectAttribute]}
              onUpdate={(v) =>
                setObjectAttribute(v[0] ?? attrOptions[0]?.value ?? 'meta')
              }
            />
            {isExperimentFullRightsSelected ? (
              <Text variant="body-2" color="secondary">
                Для полного доступа будет отправлена заявка с действием
                «Удаление», которое включает редактирование и создание.
              </Text>
            ) : null}
            <TextArea
              minRows={3}
              maxRows={8}
              size="l"
              placeholder="Комментарий для администратора (необязательно)"
              value={message}
              onUpdate={setMessage}
            />
          </Flex>
        </Dialog.Body>
        <SfDialogFooter
          onClose={() => setOpen(false)}
          onSubmit={() => void handleSubmit()}
          disabled={!canSubmit}
          pending={pending}
          textApply="Отправить заявку"
        />
      </Dialog>
    </>
  );
};
