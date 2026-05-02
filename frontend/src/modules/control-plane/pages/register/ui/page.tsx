import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { useState } from 'react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { registerPageModel } from '@/modules/control-plane/pages/register';
import {
  AuthPageBranding,
  AuthPageLayout,
} from '@/modules/control-plane/shared/ui/auth-page';
import authCss from '@/modules/control-plane/shared/ui/auth-page/auth-page.module.scss';
import { Link } from '@/shared/lib/routing';

async function messageFromAuthError(e: unknown): Promise<string> {
  if (e instanceof Response) {
    try {
      const data = (await e.clone().json()) as Record<string, unknown>;
      if (typeof data.error === 'string') {
        return data.error;
      }
      if (typeof data.external_message === 'string') {
        return data.external_message;
      }
    } catch {
      /* ignore */
    }
  }
  return 'Не удалось зарегистрироваться';
}

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const onRegister = useUnit(registerPageModel.registerPageFx);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      await onRegister({ name, email, password, displayName });
    } catch (e) {
      setError(await messageFromAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <AuthPageBranding />
      <Text
        className={authCss.title}
        variant="header-1"
        whiteSpace="break-spaces"
        color="light-primary"
      >
        Регистрация
      </Text>
      <div className={authCss.form}>
        <TextInput
          size="xl"
          value={name}
          placeholder="Имя пользователя (логин)"
          onUpdate={setName}
        />
        <TextInput
          size="xl"
          value={email}
          placeholder="Email"
          type="email"
          onUpdate={setEmail}
        />
        <TextInput
          size="xl"
          value={displayName}
          placeholder="Отображаемое имя (необязательно)"
          onUpdate={setDisplayName}
        />
        <TextInput
          size="xl"
          value={password}
          type="password"
          placeholder="Пароль (не менее 8 символов)"
          onUpdate={setPassword}
        />
        {error && (
          <Text variant="body-2" color="danger">
            {error}
          </Text>
        )}
      </div>
      <Button
        className={authCss.primaryAction}
        size="xl"
        view="action"
        onClick={handleClick}
        loading={loading}
      >
        {loading ? 'Подождите...' : 'Зарегистрироваться'}
      </Button>
      <div className={authCss.footer}>
        <Link
          to={ControlPlaneModule.routes.login}
          className={authCss.subLink}
          params={{}}
        >
          Уже есть аккаунт? Войти
        </Link>
      </div>
    </AuthPageLayout>
  );
};
