import { ArrowRightFromSquare } from '@gravity-ui/icons';
import { Button } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';

import {
  UserBadge,
  userModel,
} from '@/modules/control-plane/entities/session/user';
import { logoutModel } from '@/modules/control-plane/features/logout';
import { navigationModel } from '@/modules/control-plane/features/navigation';

import css from './current-user-badge.module.scss';

export const CurrentUserBadge = () => {
  const user = useUnit(userModel.$user);
  const onLogout = useUnit(logoutModel.start);

  const handleLogout = () => {
    onLogout();
    userModel.reset();
    navigationModel.login.navigate();
  };

  return (
    <div className={css.container}>
      <UserBadge user={user} size="l" />
      <div className={css.actions}>
        <Button view="flat" size="l" title="Выйти" onClick={handleLogout}>
          <Button.Icon>
            <ArrowRightFromSquare />
          </Button.Icon>
          Выйти
        </Button>
      </div>
    </div>
  );
};
