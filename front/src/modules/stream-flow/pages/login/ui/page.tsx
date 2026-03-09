import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { useEffect, useState } from 'react';

import { loginPageModel } from '@/modules/stream-flow/pages/login';
import { ControlPlaneLogo } from '@/shared/ui/service-icon';

import { BackgroundImageIcon } from '../assets';

import css from './page.module.scss';

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const onLogin = useUnit(loginPageModel.loginFx);
  const onAutoLogin = useUnit(loginPageModel.autoLoginFx);
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('root');
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      await onLogin({ username, password });
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const isAuto = params.get('auto') === '1';
  useEffect(() => {
    if (isAuto) {
      onAutoLogin();
    }
  }, [isAuto, onAutoLogin]);

  return (
    <div className={css.loginPage}>
      <BackgroundImageIcon className={css.backgroundImage} />
      <div className={css.content}>
        <ControlPlaneLogo style={{ width: '96px', height: '96px' }} />
        <Text
          className={css.title}
          variant="display-2"
          whiteSpace="break-spaces"
          color="light-primary"
        >
          Вход в систему
        </Text>
        <div className={css.form}>
          <TextInput
            size="xl"
            value={username}
            placeholder="Логин"
            onUpdate={setUsername}
          />
          <TextInput
            size="xl"
            value={password}
            type="password"
            placeholder="Пароль"
            onUpdate={setPassword}
          />
          {error && <Text variant="body-2">{error}</Text>}
        </div>
        <Button size="xl" view="action" onClick={handleClick} loading={loading}>
          {loading ? 'Подождите...' : 'Войти'}
        </Button>
      </div>
    </div>
  );
};
