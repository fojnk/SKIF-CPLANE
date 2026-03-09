import { Plus } from '@gravity-ui/icons';
import { Button, Icon } from '@gravity-ui/uikit';
import React from 'react';

interface AddButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  /** 'outlined' для внутренних Add кнопок, 'normal' для основных */
  variant?: 'outlined' | 'normal';
  /** Отступ сверху в пикселях */
  marginTop?: number;
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  children,
  disabled,
  variant = 'outlined',
  marginTop,
}) => (
  <Button
    view={variant === 'outlined' ? 'outlined-action' : 'normal'}
    size="m"
    onClick={onClick}
    width="max"
    disabled={disabled}
    style={marginTop ? { marginTop: `${marginTop}px` } : undefined}
  >
    <Icon data={Plus} />
    {children}
  </Button>
);
