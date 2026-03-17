import { Flex } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { ReactNode } from 'react';

import { SFLayoutHeader } from '@/modules/control-plane/shared/layout/sf-layout-header';
import { useResizer } from '@/modules/control-plane/shared/ui/resizer/useResizer';
import { useValue } from '@/shared/lib/react/hooks/use-value';

import css from './sf.module.scss';

import '@/modules/control-plane/shared/ui/resizer/resizer.scss';

interface Props {
  title?: string;
  button?: ReactNode;
  children?: ReactNode;
  filter?: ReactNode;
  showFilter?: boolean;
  level2?: boolean;
  resizable?: {
    resizableRight?: boolean;
    resizableLeft?: boolean;
    maxWidth?: number;
    minWidth?: number;
    canCollapse?: boolean;
    pageId?: string;
  };
}
export const SFLayoutAside = ({
  children,
  button,
  title,
  filter,
  showFilter,
  level2 = false,
  resizable,
}: Props) => {
  const open = useValue<boolean>(true);

  const [ref] = useResizer({
    size: {
      maxWidth: resizable?.maxWidth ?? 600,
      minWidth: resizable?.minWidth ?? 150,
    },
    canCollapse: resizable?.canCollapse,
    pageId: resizable?.pageId,
  });
  if (!open.value) return null;

  return (
    <Flex
      direction="column"
      className={cx(
        css.aside,
        resizable && 'resizable',
        resizable?.resizableLeft && 'is-resizable-right-column',
      )}
      ref={resizable ? ref : null}
    >
      {resizable?.resizableRight && (
        <div id="resizer_r" className="resizer resizer_r"></div>
      )}
      {title && (
        <SFLayoutHeader
          title={title}
          button={button}
          className={level2 && css.emptyBg}
          onClick={() => open.set(false)}
        />
      )}
      {showFilter && (
        <Flex className={css.filters} direction="column">
          {filter}
        </Flex>
      )}
      <Flex direction="column" className={css.asideContentWrapper}>
        <Flex direction="column" className={css.asideContent}>
          <Flex direction="column">{children}</Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
