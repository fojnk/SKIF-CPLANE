import {
  Flex,
  FlexProps,
  Text,
  Tooltip,
  TooltipProps,
} from '@gravity-ui/uikit';
import cx from 'clsx';
import { ReactNode } from 'react';

import { FieldSectionError } from '../field-section-error';

import './index.scss';

export interface SimpleFieldSectionProps {
  title?: ReactNode;
  showAsterisk?: boolean;
  children?: ReactNode;
  outerContent?: ReactNode;
  innerContent?: ReactNode;
  contentProps?: Omit<FlexProps, 'width'>;
  className?: string;
  tooltip?: Omit<TooltipProps, 'children'>;
  error?: string;
  view?: 'column' | 'row';
  titleVariant?: 'caption-1' | 'caption-2' | 'body-1' | 'body-2';
  titleColor?: 'primary' | 'info' | 'hint';
  hideTitle?: boolean;
}

export const SimpleFieldSection = ({
  title,
  showAsterisk,
  children,
  innerContent,
  outerContent,
  className,
  error,
  contentProps,
  tooltip,
  view = 'row',
  titleVariant = 'body-1',
  titleColor = 'primary',
  hideTitle = false,
}: SimpleFieldSectionProps) => {
  return (
    <>
      <div
        className={cx(
          'sfs',
          { 'sfs--error': error },
          `sfs--view-${view}`,
          className,
        )}
      >
        {!hideTitle && (
          <Text
            variant={titleVariant}
            color={titleColor}
            className="sfs__title"
          >
            {title || <>&nbsp;</>}

            {showAsterisk && (
              <Text variant={titleVariant} color="danger">
                *
              </Text>
            )}
            {tooltip && (
              <Tooltip {...tooltip} openDelay={0}>
                <Text className="sfs__tooltip_question">?</Text>
              </Tooltip>
            )}
          </Text>
        )}
        <Flex
          {...contentProps}
          direction={contentProps?.direction ?? 'column'}
          className={cx(contentProps?.className, 'sfs__content')}
        >
          {children}
          {innerContent}
          {error && <FieldSectionError>{error}</FieldSectionError>}
        </Flex>
      </div>
      {outerContent}
    </>
  );
};
