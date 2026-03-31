import { ClipboardButton } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  url?: string;
  className?: string;
  size?: 's' | 'm' | 'l' | 'xl';
  tooltipInitialText?: string;
  tooltipSuccessText?: string;
}

export const CopyLink = ({
  url = window.location.href,
  className = 'copy-secondary',
  size = 's',
  tooltipInitialText = 'Copy link',
  tooltipSuccessText = 'Link copied',
}: Props) => {
  return (
    <ClipboardButton
      className={className}
      size={size}
      text={url}
      tooltipInitialText={tooltipInitialText}
      tooltipSuccessText={tooltipSuccessText}
    />
  );
};
