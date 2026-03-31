import { Gear, Palette } from '@gravity-ui/icons';
import { Settings } from '@gravity-ui/navigation';
import { Text } from '@gravity-ui/uikit';
import { ReactNode } from 'react';

import { ThemeSwitcher } from './components';

export const AppSettings = ({
  additionalSystemSections,
  children,
}: {
  additionalSystemSections?: ReactNode;
  children?: ReactNode;
}) => {
  return (
    <Settings>
      <Settings.Group id="main" groupTitle="Основные">
        <Settings.Page
          id="appearance"
          title="Оформление"
          icon={{ data: Palette }}
        >
          <Settings.Section
            title="Оформление"
            header={
              <div className="appearance-header">
                Эти настройки меняют оформление приложения
              </div>
            }
          >
            <Settings.Item title="Тема интерфейса">
              <ThemeSwitcher className="ml-auto" />
            </Settings.Item>
          </Settings.Section>
        </Settings.Page>
        <Settings.Page id="system" title="Система" icon={{ data: Gear }}>
          <Settings.Section title="Базовая информация">
            <Settings.Item title="Версия">
              <Text variant="subheader-2">{`${buildEnvs.VERSION}`}</Text>
            </Settings.Item>
            <Settings.Item title="Сборка">
              <Text variant="body-1">{`${buildEnvs.BUILD_DATE}`}</Text>
            </Settings.Item>
          </Settings.Section>
          {additionalSystemSections}
        </Settings.Page>
      </Settings.Group>
      {children}
    </Settings>
  );
};
