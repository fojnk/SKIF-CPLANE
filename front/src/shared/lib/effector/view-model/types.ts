/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouteInstance } from 'atomic-router';
import { Event, Store } from 'effector';
import { ComponentType } from 'react';

export interface CreateViewModelConfig<
  Events extends AnyObject,
  RouteParams extends AnyObject,
> {
  events?: Events;
  route?: RouteInstance<RouteParams>;
  parent?: ViewModel<AnyObject>;
  region?: (params: {
    onMounted: Event<void>;
    onUnmounted: Event<void>;
    $mounted: Event<void>;
  }) => void;
}

export interface ViewModelBase<Events extends AnyObject> {
  $mounted: Store<boolean>;
  onMounted: Event<void>;
  onUnmounted: Event<void>;
  events: Events;
}

export interface ViewModelInternal<Events extends AnyObject>
  extends ViewModelBase<Events> {
  __: AnyObject;
}

export interface ViewModel<Events extends AnyObject>
  extends ViewModelBase<Events> {
  connect: <P extends AnyObject>(
    component: ComponentType<P>,
  ) => ComponentType<P>;
  useConnect: VoidFunction;
}
