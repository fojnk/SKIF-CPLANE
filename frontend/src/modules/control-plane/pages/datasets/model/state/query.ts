import { combine } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { router } from '@/routing/router';
import { querySyncModel } from '@/shared/lib/routing';

const view = ControlPlaneModule.routes.dataSources.view;

const dsType = querySyncModel<string>({
  router,
  field: 'type',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const search = querySyncModel<string>({
  router,
  field: 'search',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const namespaceId = querySyncModel<string>({
  router,
  field: 'namespace_id',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const projectId = querySyncModel<string>({
  router,
  field: 'project_id',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const isPublic = querySyncModel<string>({
  router,
  field: 'public',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const limit = querySyncModel<string>({
  router,
  field: 'limit',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const offset = querySyncModel<string>({
  router,
  field: 'offset',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const orderBy = querySyncModel<string>({
  router,
  field: 'order_by',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const $values = combine({
  orderBy: orderBy.$value.map((v) => (v == null ? null : v)),
  type: dsType.$value.map((v) => (v == null ? null : v)),
  search: search.$value.map((v) => (v == null ? null : v)),
  namespace_id: namespaceId.$value.map((v) => (v == null ? null : Number(v))),
  project_id: projectId.$value.map((v) => (v == null ? null : Number(v))),
  public: isPublic.$value.map((v) => (v == null ? null : Number(v) === 1)),
  limit: limit.$value.map((v) => (v == null ? null : Number(v))),
  offset: offset.$value.map((v) => (v == null ? null : Number(v))),
});

export {
  dsType,
  search,
  namespaceId,
  projectId,
  isPublic,
  limit,
  offset,
  orderBy,
  $values,
};
