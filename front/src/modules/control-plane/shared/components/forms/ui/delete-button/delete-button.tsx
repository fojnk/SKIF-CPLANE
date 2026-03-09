import { TrashBin } from '@gravity-ui/icons';
import { Button, Icon } from '@gravity-ui/uikit';
import React from 'react';

import './delete-button.scss';

interface DeleteButtonProps {
  onClick: () => void;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  style?: React.CSSProperties;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  size = 'xs',
  style,
}) => {
  return (
    <Button
      view="flat-secondary"
      size={size}
      onClick={onClick}
      className="delete-button-hover-danger"
      style={style}
    >
      <Icon data={TrashBin} />
    </Button>
  );
};
