import { Flex, Label, Text } from '@gravity-ui/uikit';
import React from 'react';

import { SFMonaco } from '@/modules/control-plane/shared/ui/sf-monaco';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { getMonacoLanguage } from '@/modules/control-plane/shared/utils/monacoLanguageMapper';
import {
  getTypeLabel,
  getTypeTheme,
} from '@/modules/control-plane/shared/utils/variablesHelpers';

interface Props {
  name: string;
  type?: string;
  value?: string;
}

export const LogVariableDelete: React.FC<Props> = ({ name, type, value }) => {
  const formattedValue = React.useMemo(() => {
    if (type === 'json') {
      return formatData(value ?? '');
    }
    return value;
  }, [value, type]);

  return (
    <Flex direction="column" gap={1} style={{ height: '100%' }}>
      <Flex
        direction="row"
        gap={2}
        style={{ paddingBottom: '9px' }}
        alignItems="center"
      >
        <Text variant="body-2" color="danger">
          <b>{name}</b>
        </Text>
        {type && (
          <Label size="xs" theme={getTypeTheme(type)}>
            {getTypeLabel(type)}
          </Label>
        )}
      </Flex>
      <SFMonaco
        language={getMonacoLanguage(type ?? 'string')}
        value={formattedValue}
        className="editor-page-monaco"
        options={{
          readOnly: true,
        }}
      />
    </Flex>
  );
};
