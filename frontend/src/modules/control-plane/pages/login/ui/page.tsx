import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { useEffect, useState } from 'react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { loginPageModel } from '@/modules/control-plane/pages/login';
import { AuthPageBranding } from '@/modules/control-plane/shared/ui/auth-page';
import authCss from '@/modules/control-plane/shared/ui/auth-page/auth-page.module.scss';
import { Link } from '@/shared/lib/routing';

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
    <div className={authCss.shell}>
      <div className={authCss.content}>
        <AuthPageBranding />
        <Text
          className={authCss.title}
          variant="header-1"
          whiteSpace="break-spaces"
          color="light-primary"
        >
          Вход в систему
        </Text>
        <div className={authCss.form}>
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
          {error && (
            <Text variant="body-2" color="danger">
              {error}
            </Text>
          )}
        </div>
        <Button size="xl" view="action" onClick={handleClick} loading={loading}>
          {loading ? 'Подождите...' : 'Войти'}
        </Button>
        <div className={authCss.footer}>
          <Link
            to={ControlPlaneModule.routes.register}
            className={authCss.subLink}
          >
            Создать аккаунт
          </Link>
        </div>
      </div>
    </div>
  );
};
