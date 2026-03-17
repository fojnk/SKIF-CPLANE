import { useUnit } from 'effector-react';
import React from 'react';

import { formParamsSettingsModel } from '@/modules/control-plane/entities/settings/form-params';

interface Props {
  children: React.ReactNode;
  paddingTop?: boolean;
}

export const FormContainer = ({ children, paddingTop }: Props) => {
  const [settings] = useUnit([formParamsSettingsModel.$settings]);

  return (
    <div
      className="sf-l-pl sf-l-pr"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        paddingBottom: '60px',
        paddingTop: paddingTop ? '12px' : '0px',
        gap: '12px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: settings.width === 'fixed' ? '1024px' : undefined,
          minWidth: settings.width === 'fixed' ? '600px' : undefined,
          gap: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
};
