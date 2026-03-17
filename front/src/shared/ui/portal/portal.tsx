import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({
  children,
  element = document.getElementById('portal'),
}: {
  children: ReactNode;
  element?: HTMLElement | null;
}) => {
  if (!element) return null;
  return createPortal(children, element);
};
