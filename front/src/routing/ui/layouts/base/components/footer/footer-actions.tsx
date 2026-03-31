import cx from 'clsx';

import { Button } from '@/shared/ui/button';

import type { BaseLayoutHeaderAction } from '../header';

import './footer.scss';

export interface FooterActionsProps {
  actions: BaseLayoutHeaderAction[];
  className?: string;
}

export const FooterActions = ({ actions, className }: FooterActionsProps) => {
  return (
    <div className={cx('page-footer__actions', className)}>
      {actions.map(
        (
          {
            action,
            disabled,
            view = 'action',
            text,
            icon: Icon,
            rightIcon: RightIcon,
            submitFormName,
            loading,
            hidden,
          },
          i,
        ) => {
          if (hidden) return null;

          return (
            <Button
              key={i}
              size="m"
              type={submitFormName != null ? 'submit' : 'button'}
              extraProps={{
                form: submitFormName,
              }}
              view={view}
              disabled={disabled}
              loading={loading}
              onClick={action}
            >
              {Icon && (
                <Button.Icon>
                  <Icon />
                </Button.Icon>
              )}
              {text}
              {RightIcon && (
                <Button.Icon>
                  <RightIcon />
                </Button.Icon>
              )}
            </Button>
          );
        },
      )}
    </div>
  );
};
