import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { useState } from 'react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { registerPageModel } from '@/modules/control-plane/pages/register';
import { ControlPlaneLogo } from '@/shared/ui/service-icon';
import { Link } from '@/shared/lib/routing';

import { BackgroundImageIcon } from '../../login/assets';

import css from './page.module.scss';

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
    <div className={css.registerPage}>
      <BackgroundImageIcon className={css.backgroundImage} />
      <div className={css.content}>
        <ControlPlaneLogo style={{ width: '96px', height: '96px' }} />
        <Text
          className={css.title}
          variant="display-2"
          whiteSpace="break-spaces"
          color="light-primary"
        >
          Регистрация
        </Text>
        <div className={css.form}>
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
        <Button size="xl" view="action" onClick={handleClick} loading={loading}>
          {loading ? 'Подождите...' : 'Зарегистрироваться'}
        </Button>
        <div className={css.footer}>
          <Link
            to={ControlPlaneModule.routes.login}
            className={css.subLink}
            params={{}}
          >
            Уже есть аккаунт? Войти
          </Link>
        </div>
      </div>
    </div>
  );
};
