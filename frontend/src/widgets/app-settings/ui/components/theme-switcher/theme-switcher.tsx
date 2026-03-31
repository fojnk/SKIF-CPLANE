import {
  SegmentedRadioGroup,
  SegmentedRadioGroupProps,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';

import { Theme, themeModel } from '@/shared/lib/complex/theme';

type ThemeSwitcherProps = Omit<
  SegmentedRadioGroupProps,
  'onUpdate' | 'options' | 'value'
>;

export const ThemeSwitcher = (props: ThemeSwitcherProps) => {
  const theme = useUnit(themeModel.theme);

  const handleUpdate = (value: string) => theme.set(value as Theme);

  return (
    <SegmentedRadioGroup
      {...props}
      onUpdate={handleUpdate}
      size="l"
      value={theme.value}
    >
      <SegmentedRadioGroup.Option value="light" content="Светлая" />
      <SegmentedRadioGroup.Option value="dark" content="Тёмная" />
      <SegmentedRadioGroup.Option value="auto" content="Системная" />
    </SegmentedRadioGroup>
  );
};
