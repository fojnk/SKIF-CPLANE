import { Plus } from '@gravity-ui/icons';
import { Button, Disclosure, Flex, Text } from '@gravity-ui/uikit';
import cx from 'clsx';

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
        <Button view="flat-action" size="xs" onClick={onCreateClick}>
          <Button.Icon>
            <Plus />
          </Button.Icon>
          New
        </Button>
      )}
    </Flex>
  );
};
