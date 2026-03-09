import { Avatar, User, UserProps } from '@gravity-ui/uikit';
import cx from 'clsx';

import { userLib } from '@/modules/stream-flow/entities/session/user';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';

import './user-badge.scss';

export interface UserBadgeProps
  extends Omit<UserProps, 'imgUrl' | 'name' | 'description'> {
  user: Maybe<streamFlowApi.dc.DtoUserInfoDC>;
  compact?: boolean;
}

export const UserBadge = ({
  user,
  compact,
  className,
  ...userProps
}: UserBadgeProps) => (
  <User
    {...userProps}
    className={cx(
      'user-badge',
      {
        compact,
      },
      className,
    )}
    avatar={
      <Avatar
        view="filled"
        size="l"
        text={userLib.getUsername(user)}
        imgUrl={userLib.getUserAvatar(user)}
      />
    }
    name={compact ? '' : userLib.getUserDisplayName(user)}
    description={compact ? '' : userLib.getUsername(user)}
  />
);
