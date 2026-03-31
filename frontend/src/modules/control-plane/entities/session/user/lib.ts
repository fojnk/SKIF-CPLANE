import { controlPlaneApi } from '@/modules/control-plane/shared/api';

import { avatarDummyImage } from './assets';
type UserDC = controlPlaneApi.dc.DtoUserInfoDC;
export const getUserAvatar = (user: Maybe<UserDC>) =>
  user?.avatar ?? avatarDummyImage;

export const getUserDisplayName = (user: Maybe<UserDC>) =>
  (user && [user.first_name, user.last_name].filter(Boolean).join(' ')) || '';

export const getUsername = (user: Maybe<UserDC>) => user?.username || '';

export const getUserEmail = (user: Maybe<UserDC>) => user?.email || '';
