import {
  ThemeProvider,
  Theme,
  ToasterProvider,
  ToasterComponent,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { router } from '@/routing/router';
import { uiKitConfig } from '@/shared/config/ui-kit';
import { getFromStorage } from '@/shared/lib/common/storage';
import { useAppStarter } from '@/shared/lib/complex/app-starter';
import { embeddedModel } from '@/shared/lib/complex/embedded';
import { themeModel } from '@/shared/lib/complex/theme';
import { RouterRenderer } from '@/shared/lib/routing';
import { ModalsRoot } from '@/shared/ui/modals';
import { toaster } from '@/shared/ui/notifications';

import { ErrorBoundary } from './ui';

import './start';

export const App: FC = () => {
  const colorSchema = useUnit(themeModel.$colorScheme);

  const [isEmbedded, embeddedTheme] = useUnit([
    embeddedModel.$isEmbedded,
    embeddedModel.$theme,
  ]);

  const fallBackEmbeddedTheme = getFromStorage({
    type: 'local',
    key: 'embedded_theme',
  }) as string;
  const updatedEmbeddedTheme =
    !embeddedTheme || (embeddedTheme === 'auto' && fallBackEmbeddedTheme)
      ? fallBackEmbeddedTheme
      : embeddedTheme;
  const theme: Theme = isEmbedded ? updatedEmbeddedTheme : colorSchema;

  useAppStarter();

  return (
    <ThemeProvider theme={theme} layout={uiKitConfig.layoutTheme}>
      <ToasterProvider toaster={toaster}>
        <ErrorBoundary>
          <RouterRenderer router={router}>
            <ModalsRoot />
            <ToasterComponent />
          </RouterRenderer>
        </ErrorBoundary>
      </ToasterProvider>
    </ThemeProvider>
  );
};
