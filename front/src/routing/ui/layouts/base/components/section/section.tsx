import { ChevronDown, ChevronRight } from '@gravity-ui/icons';
import { Flex, Skeleton, Text } from '@gravity-ui/uikit';
import cx from 'clsx';
import { isValidElement, ReactNode } from 'react';

import { useToggle } from '@/shared/lib/react/hooks/use-toggle';
import { Button } from '@/shared/ui/button';
import { Label, LabelProps } from '@/shared/ui/label';

import './section.scss';

export interface BaseLayoutSectionProps {
  children?: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
  label?: { text: string; theme?: LabelProps['theme'] } | ReactNode;
  loading?: boolean;
  accordion?: { defaultOpened: boolean };
  titleSize?: 's' | 'm';
}

export const Section = ({
  children,
  className,
  title,
  label,
  loading,
  accordion,
  action,
  titleSize = 'm',
}: BaseLayoutSectionProps) => {
  const [accordionOpened, toggleAccordionOpen] = useToggle(
    !accordion || !!accordion?.defaultOpened,
  );

  const textContent = (
    <>
      {title}
      {label &&
        (isValidElement(label) ? (
          <div className="page-section__custom-label">{label}</div>
        ) : (
          <Label
            className="page-section__label"
            theme={
              // @ts-expect-error react has incorrect type guard
              label.theme
            }
            size="s"
          >
            {
              // @ts-expect-error react has incorrect type guard
              label.text
            }
          </Label>
        ))}
    </>
  );

  return (
    <section
      className={cx(
        'page-section',
        `page-section--title-size-${titleSize}`,
        className,
      )}
    >
      <div className="page-section__title-container">
        {accordion ? (
          <Flex direction="row" justifyContent="space-between">
            <Button
              view="flat"
              onClick={toggleAccordionOpen}
              className="page-section__accordion-toggler"
            >
              <Text
                className="page-section__title"
                variant={titleSize === 'm' ? 'header-1' : 'subheader-3'}
              >
                {textContent}
              </Text>
              <Button.Icon>
                {accordionOpened ? <ChevronDown /> : <ChevronRight />}
              </Button.Icon>
            </Button>
            {action}
          </Flex>
        ) : (
          <Flex direction="row" justifyContent="space-between">
            <Text
              className="page-section__title"
              variant={titleSize === 'm' ? 'header-1' : 'subheader-3'}
            >
              {textContent}
            </Text>
            {action}
          </Flex>
        )}
      </div>
      {accordionOpened ? (
        loading ? (
          <Skeleton className="page-section__skeleton" />
        ) : (
          children
        )
      ) : null}
    </section>
  );
};
