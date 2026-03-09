import { ChevronDown } from '@gravity-ui/icons';
import { Button, DropdownMenu } from '@gravity-ui/uikit';
import React from 'react';

import { ShowVersionMode } from '@/modules/stream-flow/features/version/show/types';

interface Props {
  setMode: (mode: ShowVersionMode) => void;
  mode?: ShowVersionMode;
}

export const ExperimentVersionHeaderActions = ({
  setMode,
  mode = 'view',
}: Props) => {
  // В режимах edit и restore не показываем actions
  if (mode === 'edit' || mode === 'restore') {
    return null;
  }

  const items = [];

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

  // "Restore version" всегда доступно для не-head версий
  items.push({
    action: () => setMode('restore'),
    text: 'Восстановить версию',
    theme: 'normal' as const,
  });

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
