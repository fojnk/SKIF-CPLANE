import {
  configure as uikitConfigure,
  Theme,
  ThemeProviderProps,
} from '@gravity-ui/uikit';

const layoutTheme: ThemeProviderProps['layout'] = {
  config: {
    spaceBaseSize: 4,
  },
};

const theme: Theme = 'dark';

export const uiKitConfig = {
  layoutTheme,
  theme,
} as const;

uikitConfigure({
  lang: 'ru',
});
