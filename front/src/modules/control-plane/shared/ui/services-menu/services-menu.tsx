import { useTheme } from '@gravity-ui/uikit';
import { useState, useCallback, useEffect } from 'react';

import css from './services-menu.module.scss';

const isTesting = import.meta.env.VITE_TESTING === 'true';
const domain = isTesting ? 'testing.oneui.vk.team' : 'data-tools.vk.team';

export const ServicesMenu = () => {
  const [loaded, setLoaded] = useState(false);
  const isDarkTheme = useTheme() === 'dark';
  const src = `https://${domain}/menu.html?theme=${isDarkTheme ? 'dark' : 'light'}&active=control-plane`;

  const listener = useCallback((event: MessageEvent) => {
    const { data } = event;

    if (data.type === 'iframe-event' && data.payload === 'menu-loaded') {
      setLoaded(data.type === 'iframe-event' && data.payload === 'menu-loaded');
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      window.addEventListener('message', listener);
    }

    return () => {
      window.removeEventListener('message', listener);
    };
  }, [listener, loaded]);

  return (
    <div className={css.container} style={{ opacity: loaded ? 1 : 0 }}>
      <iframe src={src} />
    </div>
  );
};
