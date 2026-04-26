import { Text } from '@gravity-ui/uikit';
import React from 'react';

import {
  PLATFORM_STATION_NAME,
  PLATFORM_TAGLINE,
} from '@/modules/control-plane/config/platform-branding';

import css from './auth-page.module.scss';

export const AuthPageBranding = () => (
  <div className={css.branding}>
    <Text
      className={css.stationTitle}
      variant="display-3"
      whiteSpace="break-spaces"
      color="light-primary"
    >
      {PLATFORM_STATION_NAME}
    </Text>
    <Text
      className={css.stationSubtitle}
      variant="body-2"
      color="light-secondary"
    >
      {PLATFORM_TAGLINE}
    </Text>
  </div>
);
