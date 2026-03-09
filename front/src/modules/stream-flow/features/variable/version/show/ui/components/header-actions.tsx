import { ChevronDown } from '@gravity-ui/icons';
import { Button, DropdownMenu } from '@gravity-ui/uikit';
import React from 'react';

import { VariableVersionMode } from '@/modules/stream-flow/features/variable/version/show/types';

interface Props {
  setMode: (mode: VariableVersionMode) => void;
  head: boolean;
  canEdit: boolean;
  mode?: VariableVersionMode;
}

export const VariableVersionHeaderActions = ({
  setMode,
  head,
  canEdit,
  mode = 'view',
}: Props) => {
  // В режимах edit и restore не показываем actions
  if (mode === 'edit' || mode === 'restore') {
    return null;
  }

  const items = [];

  // Для head версии показываем "Edit variable" только если есть права
  if (head && mode === 'view' && canEdit) {
    items.push({
      action: () => setMode('edit'),
      text: 'Редактировать переменную',
      theme: 'normal' as const,
    });
  }

  // Для не-head версий показываем действия
  if (!head) {
    // В режиме compare показываем "Back to view mode"
    if (mode === 'compare') {
      items.push({
        action: () => setMode('view'),
        text: 'Вернуться к просмотру',
        theme: 'normal' as const,
      });
    } else {
      // В режиме view показываем "Compare with head"
      items.push({
        action: () => setMode('compare'),
        text: 'Сравнить с HEAD',
        theme: 'normal' as const,
      });
    }

    // "Restore version" только если есть права на редактирование
    if (canEdit) {
      items.push({
        action: () => setMode('restore'),
        text: 'Восстановить версию',
        theme: 'normal' as const,
      });
    }
  }

  // Если нет доступных действий, не показываем кнопку
  if (items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu
      size="s"
      items={items}
      renderSwitcher={(props) => (
        <Button {...props} size="s" view="outlined">
          Действия
          <Button.Icon>
            <ChevronDown />
          </Button.Icon>
        </Button>
      )}
    />
  );
};
