/* eslint-disable import/order,import/no-internal-modules */
import './bootstrap';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { rootElement } from '@/shared/config/dom';

import '@/app/styles/tailwind.css';
import '@/app/styles/keyframes.css';
import '@/app/styles/fonts.scss';
import '@/app/styles/palette.scss';
import '@/app/styles/globals.scss';
import '@/app/styles/theme.scss';
import '@/app/styles/gravity-ui-kit/index.scss';

import { App } from '@/app';

const root = createRoot(rootElement);

root.render(<App />);
