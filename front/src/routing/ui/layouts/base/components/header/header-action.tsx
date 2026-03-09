import { DropdownMenu, DropdownMenuItem } from '@gravity-ui/uikit';
import { ComponentType, MouseEventHandler } from 'react';

import { Button, ButtonProps } from '@/shared/ui/button';

import './header.scss';

export interface BaseLayoutHeaderAction {
  icon?: ComponentType;
  text?: string;
  disabled?: boolean;
  action?: MouseEventHandler<HTMLButtonElement | HTMLElement> | undefined;
  loading?: boolean;
  rightIcon?: ComponentType;
  view?: ButtonProps['view'];
  submitFormName?: string;
  hidden?: boolean;
  items?: BaseLayoutHeaderAction[];
}

const HeaderActionButton = ({
  action,
  disabled,
  view = 'action',
  text,
  icon: Icon,
  rightIcon: RightIcon,
  submitFormName,
  loading,
  hidden,
}: BaseLayoutHeaderAction) => {
  if (hidden) return null;

  return (
    <Button
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
};

export const headerActionToDropdownItem = (
  action: BaseLayoutHeaderAction,
): DropdownMenuItem<any> | DropdownMenuItem<any>[] => ({
  // @ts-expect-error ignore html element / html button element type difference
  action: (e) => action.action?.(e),
  disabled: action.disabled,
  text: action.text,
  iconStart: action.icon && <action.icon />,
  iconEnd: action.rightIcon && <action.rightIcon />,
  theme: action.view === 'danger' ? 'danger' : 'normal',
  items: action.items?.map(headerActionToDropdownItem) ?? undefined,
});

export const HeaderAction = (props: BaseLayoutHeaderAction) => {
  if (props.items) {
    return (
      <DropdownMenu
        items={props.items.map(headerActionToDropdownItem)}
        menuProps={{
          size: 'l',
        }}
        renderSwitcher={(switcherProps) => (
          <HeaderActionButton
            {...props}
            action={switcherProps.onClick}
            items={undefined}
          />
        )}
      />
    );
  }

  return <HeaderActionButton {...props} />;
};
