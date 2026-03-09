import { Flex, Label } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo } from 'react';

import { formParamsSettingsModel } from '@/modules/stream-flow/entities/settings/form-params';

import { ParamType } from '../../types';
import { getParamTypeLabel } from '../../utils';

interface ParamTypeLabelProps {
  type: string;
  nestedType?: string;
  hideStruct?: boolean;
}

export const ParamTypeLabel = React.memo<ParamTypeLabelProps>(
  ({ type, nestedType, hideStruct = true }) => {
    const [settings] = useUnit([formParamsSettingsModel.$settings]);

    const label = useMemo(() => getParamTypeLabel(type), [type]);

    const nestedLabel = useMemo(
      () => (nestedType ? getParamTypeLabel(nestedType) : null),
      [nestedType],
    );

    const className = useMemo(
      () => (!settings.showBackground ? 'no-bg' : ''),
      [settings.showBackground],
    );

    // Мемоизируем функцию получения цвета
    const getColor = useMemo(
      () => (paramType: string) =>
        formParamsSettingsModel.getParamColor(settings, paramType as ParamType),
      [settings],
    );

    // Ранний выход
    if (!label || (type === 'struct' && hideStruct)) {
      return null;
    }

    // Если есть вложенный тип
    if (nestedLabel && nestedType && nestedType !== 'struct') {
      // Для монохромной темы - один label с value
      if (settings.colorTheme === 'monochrome') {
        return (
          <Label
            theme={getColor(type)}
            value={nestedLabel}
            className={className}
          >
            {label}
          </Label>
        );
      }

      // Для многоцветной темы - два отдельных label
      return (
        <Flex direction="row" gap={settings.showBackground ? 1 : 0}>
          <Label theme={getColor(type)} className={className}>
            {label}
          </Label>
          <Label theme={getColor(nestedType)} className={className}>
            {nestedLabel}
          </Label>
        </Flex>
      );
    }

    // Обычный label без вложенного типа
    return (
      <Label theme={getColor(type)} className={className}>
        {label}
      </Label>
    );
  },
);

ParamTypeLabel.displayName = 'ParamTypeLabel';
