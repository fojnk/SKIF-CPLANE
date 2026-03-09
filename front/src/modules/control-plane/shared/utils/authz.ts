import {
  AclRightDC,
  ResponsesUserCapabilitiesDC,
} from '@/modules/control-plane/shared/api/__generated__/data-contracts';
import { EntityType } from '@/modules/control-plane/shared/types';

type AuthzAction =
  | 'view'
  | 'edit'
  | 'delete'
  | 'create_project'
  | 'create_dataset'
  | 'create_experiment'
  | 'create_namespace'
  | 'start_experiment'
  | 'stop_experiment'
  | 'apply_experiment'
  | 'manage_acl';

export const hasCapability = (
  capabilities: ResponsesUserCapabilitiesDC | null | undefined,
  capability: 'can_create_namespace' | 'can_manage_acl' | 'is_root',
): boolean => {
  if (!capabilities) {
    return false;
  }
  return Boolean(capabilities[capability]);
};

export const can = (
  rights: AclRightDC[] | undefined,
  action: AuthzAction,
  objectType?: EntityType,
  capabilities?: ResponsesUserCapabilitiesDC,
): boolean => {
  if (hasCapability(capabilities, 'is_root')) {
    return true;
  }

  const allRights = rights || [];

  switch (action) {
    case 'view':
      return allRights.length > 0;
    case 'edit':
      return (
        allRights.includes(AclRightDC.RightEditConfig) ||
        allRights.includes(AclRightDC.RightEditName) ||
        allRights.includes(AclRightDC.RightEditSchema)
      );
    case 'delete':
      switch (objectType) {
        case 'project':
          return allRights.includes(AclRightDC.RightDeleteProject);
        case 'dataset':
          return allRights.includes(AclRightDC.RightDeleteDataset);
        case 'experiment':
          return allRights.includes(AclRightDC.RightDeleteExperiment);
        case 'namespace':
          return allRights.includes(AclRightDC.RightDeleteNamespace);
        default:
          return false;
      }
    case 'create_project':
      return allRights.includes(AclRightDC.RightCreateProject);
    case 'create_dataset':
      return allRights.includes(AclRightDC.RightCreateDataset);
    case 'create_experiment':
      return allRights.includes(AclRightDC.RightCreateExperiment);
    case 'create_namespace':
      return hasCapability(capabilities, 'can_create_namespace');
    case 'start_experiment':
      return allRights.includes(AclRightDC.RightStartExperiment);
    case 'stop_experiment':
      return allRights.includes(AclRightDC.RightStopExperiment);
    case 'apply_experiment':
      return allRights.includes(AclRightDC.RightApplyExperiment);
    case 'manage_acl':
      return hasCapability(capabilities, 'can_manage_acl');
    default:
      return false;
  }
};
