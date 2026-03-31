import {
  EmptyObject,
  RouteInstance as AtomicRouteInstance,
} from 'atomic-router';
import { Store } from 'effector';
import { ComponentType } from 'react';

import { ViewModel } from '@/shared/lib/effector/view-model';
import { AsyncViewLoader } from '@/shared/lib/routing';

export interface RouteInstance<Params extends AnyObject = EmptyObject>
  extends AtomicRouteInstance<Params> {
  view: ViewModel<AnyObject>;
  $blocked: Store<boolean>;
  preventRedirectIf: (condition: Store<boolean>) => void;

  __: AnyObject;
}

export interface BaseRouteCfg {
  view: AsyncViewLoader;
  /**
   * Приветный роут или нет (реализация приватности описаывается через роутер)
   */
  private?: boolean;
  requiredCapability?: 'can_create_namespace' | 'can_manage_acl' | 'is_root';
  loader?: ComponentType;
  config?: AnyObject;
}
