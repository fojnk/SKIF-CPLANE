import { Button } from '@gravity-ui/uikit';
import React from 'react';

type ButtonWithProgressProps = React.ComponentProps<typeof Button> & {
  progress?: number;
  intervalMs?: number;
};

type ButtonWithProgressComponent = React.FC<ButtonWithProgressProps> & {
  Icon: typeof Button.Icon;
};

export const ButtonWithProgress: ButtonWithProgressComponent = (({
  progress,
  intervalMs,
  children,
  style,
  onClick,
  ...buttonProps
}) => {
  const [internalProgress, setInternalProgress] = React.useState(0);
  const progressIntervalRef = React.useRef<number | null>(null);
  const refreshIntervalRef = React.useRef<number | null>(null);

  const refreshCallbackRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => {
    refreshCallbackRef.current = () => {
      if (typeof onClick === 'function') {
        // Call without event in auto mode; for manual clicks we'll wrap separately
        (onClick as unknown as () => void)();
      }
    };
  }, [onClick]);

  const clearTimers = React.useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const startProgress = React.useCallback((duration: number) => {
    if (!duration || duration <= 0) return;
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setInternalProgress(0);
    const startTime = Date.now();
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setInternalProgress(newProgress);
      if (newProgress >= 100 && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, 100);
  }, []);

  const startAutoRefresh = React.useCallback(
    (duration: number) => {
      if (!duration || duration <= 0) return;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      // Kick off immediately
      startProgress(duration);
      refreshIntervalRef.current = window.setInterval(() => {
        refreshCallbackRef.current?.();
        startProgress(duration);
      }, duration);
    },
    [startProgress],
  );

  // Initialize auto-refresh if intervalMs provided
  React.useEffect(() => {
    if (intervalMs && intervalMs > 0) {
      startAutoRefresh(intervalMs);
      return () => {
        clearTimers();
      };
    }
    return undefined;
  }, [intervalMs, startAutoRefresh, clearTimers]);

  const handleClick = React.useCallback<NonNullable<typeof onClick>>(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Execute outer onClick first
      onClick?.(e);
      // Restart timers if interval is used
      if (intervalMs && intervalMs > 0) {
        clearTimers();
        startAutoRefresh(intervalMs);
      }
    },
    [onClick, intervalMs, clearTimers, startAutoRefresh],
  );

  const clampedProgress = Math.max(
    0,
    Math.min(100, intervalMs ? internalProgress : progress ?? 0),
  );

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          width: `${clampedProgress}%`,
          backgroundColor: 'var(--g-color-base-brand)',
          transition: 'width 0.1s ease-out',
          zIndex: 1,
        }}
      />
      {children}
    </Button>
  );
}) as ButtonWithProgressComponent;

ButtonWithProgress.Icon = Button.Icon;
