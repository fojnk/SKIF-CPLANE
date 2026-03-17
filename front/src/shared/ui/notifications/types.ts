import { ToastProps } from '@gravity-ui/uikit';
import { ReactNode } from 'react';

export interface NotificationExtraContent {
  text: string;
  label?: ReactNode;
  type?: 'copy';
  className?: string;
}

export interface NotificationParams extends Omit<ToastProps, 'name' | 'theme'> {
  type?: ToastProps['theme'];
  name?: ToastProps['name'];
  extras?: NotificationExtraContent[];
}

export interface RawNotification {
  /**
   * При повторных вызовах этого уведомления не будут появляться дубликаты в интерфейсе
   */
  unique?: boolean;
  /**
   * Уникальное имя для тех случаев если есть необходимость создавать много разных уведомлений этого типа
   */
  name?: string;
  /**
   * Заголовок уведомления
   */
  title?: string;
  /**
   * Контент или доп. сообщение уведомления
   */
  content?: string;
  /**
   * Тип уведомления, окрашивает тост, добавляет иконку
   */
  type?: NotificationParams['type'];
  /**
   * Необходимо ли закрывать уведомление, если да - через какое время
   */
  autoHiding?: NotificationParams['autoHiding'];
  /**
   * Дополнительный текст уведомления
   */
  extras?: NotificationExtraContent[];
}
