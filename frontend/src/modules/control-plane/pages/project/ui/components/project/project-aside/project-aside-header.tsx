import { Plus } from '@gravity-ui/icons';
import { Disclosure, Flex, Text } from '@gravity-ui/uikit';
import cx from 'clsx';

import { Button } from '@/shared/ui/button';

import css from './project-aside.module.scss';

interface Props {
  title: string;
  showDisclosure?: boolean;
  extended: boolean;
  setExtended: (extended: boolean) => void;
  onCreateClick?: () => void;
}

export const ProjectAsideHeader = ({
  title,
  showDisclosure,
  extended,
  setExtended,
  onCreateClick,
}: Props) => {
  const Title = (
    <Text variant="subheader-1" ellipsis>
      {title}
    </Text>
  );
  return (
    <Flex
      direction="row"
      className={cx(css.asideHeader, css.asideBgLight)}
      gap={2}
      alignItems="center"
      justifyContent="space-between"
      style={{ userSelect: 'none' }}
    >
      {showDisclosure ? (
        <Disclosure
          size="m"
          arrowPosition="end"
          expanded={extended}
          onUpdate={setExtended}
          summary={Title}
        />
      ) : (
        Title
      )}
      {onCreateClick && (
        <Button view="glass" size="m" onClick={onCreateClick}>
          <Button.Icon>
            <Plus />
          </Button.Icon>
          Создать
        </Button>
      )}
    </Flex>
  );
};
