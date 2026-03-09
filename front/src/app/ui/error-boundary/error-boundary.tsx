import { ArrowRotateRight } from '@gravity-ui/icons';
import { ClipboardButton } from '@gravity-ui/uikit';
import { Component, ErrorInfo, ReactNode } from 'react';

import { Button } from '@/shared/ui/button';

import css from './error-boundary.module.scss';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Nullable<Error> }
> {
  state = {
    hasError: false,
    error: null as Nullable<Error>,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={css.errorBlock}>
          <span>Что-то пошло не так :(</span>
          <span>Перезагрузите страницу</span>
          {!!this.state.error?.message && (
            <div>
              <span>Ошибка:</span>
              <span>{this.state.error.message}</span>
              <span>{this.state.error.stack}</span>
            </div>
          )}
          <div className={css.actions}>
            <ClipboardButton
              text={[this.state.error?.message, this.state.error?.stack]
                .filter(Boolean)
                .join('\n')}
              className="yc-button_size_m"
            />
            <Button view="action" size="m" onClick={() => location.reload()}>
              <Button.Icon>
                <ArrowRotateRight />
              </Button.Icon>
              перезагрузить
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
