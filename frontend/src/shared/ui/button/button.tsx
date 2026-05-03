import { Button as ButtonUI } from '@gravity-ui/uikit';
import cx from 'clsx';
import { forwardRef } from 'react';
import './button.scss';

const customViews = ['utility', 'danger', 'link', 'glass'] as const;

type BaseView =
  | 'normal'
  | 'action'
  | 'outlined'
  | 'outlined-info'
  | 'outlined-success'
  | 'outlined-warning'
  | 'outlined-danger'
  | 'outlined-utility'
  | 'outlined-action'
  | 'flat'
  | 'flat-info'
  | 'flat-success'
  | 'flat-warning'
  | 'flat-danger'
  | 'flat-utility'
  | 'flat-action'
  | 'flat-secondary'
  | 'flat-contrast';
type CustomView = (typeof customViews)[number];

export interface ButtonProps {
  view?: BaseView | CustomView;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: 's' | 'm' | 'l' | 'xl';
  pin?:
    | 'round-round'
    | 'round-brick'
    | 'brick-round'
    | 'brick-brick'
    | 'brick-clear'
    | 'clear-brick'
    | 'clear-clear'
    | 'round-clear'
    | 'clear-round';
  qa?: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  extraProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const ButtonBase = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ view, ...props }, ref) => (
    <ButtonUI
      {...props}
      ref={ref}
      view={
        customViews.includes(view as CustomView) ? 'action' : (view as BaseView)
      }
      className={cx('button', view, props.className)}
    />
  ),
);

export const Button = ButtonBase as typeof ButtonBase & {
  Icon: typeof ButtonUI.Icon;
};

Button.Icon = ButtonUI.Icon;
