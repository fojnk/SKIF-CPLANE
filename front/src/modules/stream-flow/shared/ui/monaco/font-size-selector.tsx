import { Flex, Select } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { monacoModel } from '@/modules/stream-flow/entities/monaco';

export const FontSizeSelector = () => {
  const [fontSize, setFontSize] = useUnit([
    monacoModel.$fontSize,
    monacoModel.setFontSize,
  ]);

  return (
    <Flex alignItems="center" gap={1}>
      <span style={{ fontSize: '13px', fontWeight: 400 }}>Font size</span>
      <Select
        value={[fontSize]}
        onUpdate={(value) => setFontSize(value[0])}
        options={[...monacoModel.FONT_SIZE_OPTIONS]}
        size="s"
        width={80}
      />
    </Flex>
  );
};
