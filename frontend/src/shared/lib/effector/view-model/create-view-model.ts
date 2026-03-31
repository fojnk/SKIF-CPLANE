import { createGate } from 'effector-react';
import { and, not } from 'patronum';

import { always } from '@/shared/lib/effector/always';
import { when } from '@/shared/lib/effector/when';

import { connectHOC } from './connect-hoc';
import { connectHook } from './connect-hook';
import type {
  CreateViewModelConfig,
  ViewModel,
  ViewModelInternal,
} from './types';

export const createViewModel = <
  Events extends AnyObject,
  RouteParams extends AnyObject,
>({
  events = {} as Events,
  parent,
}: CreateViewModelConfig<Events, RouteParams> = {}): ViewModel<Events> => {
  const Gate = createGate();

  const $mounted = Gate.status;
  const $isParentMounted = parent ? parent.$mounted : always(true);

  const $connected = and($mounted, $isParentMounted);

  const viewModel: ViewModelInternal<Events> = {
    $mounted: $connected,
    onMounted: when($connected),
    onUnmounted: when(not($connected)),
    events,

    __: {
      Gate,
    },
  };

  return {
    ...viewModel,
    connect: connectHOC(viewModel),
    useConnect: connectHook(viewModel),
  };
};
