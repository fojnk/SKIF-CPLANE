import { Label } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  id: number;
}

export const EntityLabels = ({ id }: Props) => {
  return (
    <>
      <Label
        size="s"
        theme="clear"
        value={`${id}`}
        copyText={`${id}`}
        type="copy"
      >
        ID
      </Label>
      <Label
        size="s"
        theme="clear"
        interactive
        type="copy"
        copyText={window.location.href}
      >
        link
      </Label>
    </>
  );
};
