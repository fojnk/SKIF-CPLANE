import React, { useCallback } from 'react';

interface MonacoDialogWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Обёртка для Monaco Editor внутри Dialog.
 * Останавливает всплытие событий клавиатуры, чтобы FloatingFocusManager
 * из @gravity-ui/uikit Dialog не перехватывал их (например, пробел).
 */
export const MonacoDialogWrapper = ({
  children,
  className,
  style,
}: MonacoDialogWrapperProps) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      style={style}
      className={className}
      onKeyDown={handleKeyDown}
      role="textbox"
      tabIndex={-1}
    >
      {children}
    </div>
  );
};
