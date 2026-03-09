import { AclRightDC } from '@/modules/stream-flow/shared/api/__generated__/data-contracts';
import { EntityType } from '@/modules/stream-flow/shared/types';
export interface MyAclRightDC {
  title: string;
  has: boolean;
}
/**
 * Converts AclRightDC value to readable format by removing "Right" prefix
 * @param rightValue - AclRightDC enum value (e.g., "stop_experiment")
 * @returns Readable right name (e.g., "StopExperiment")
 */
export function formatRightName(rightValue: string): string {
  // Create a mapping from enum values to enum keys
  const rightMapping: Record<string, string> = {
    [AclRightDC.RightEditConfig]: 'EditConfig',
    [AclRightDC.RightEditName]: 'EditName',
    [AclRightDC.RightEditSchema]: 'EditSchema',
    [AclRightDC.RightCreateProject]: 'CreateProject',
    [AclRightDC.RightCreateDataset]: 'CreateDataset',
    [AclRightDC.RightCreateExperiment]: 'CreateExperiment',
    [AclRightDC.RightCreateNamespace]: 'CreateNamespace',
    [AclRightDC.RightDeleteExperiment]: 'DeleteExperiment',
    [AclRightDC.RightDeleteDataset]: 'DeleteDataset',
    [AclRightDC.RightDeleteProject]: 'DeleteProject',
    [AclRightDC.RightDeleteNamespace]: 'DeleteNamespace',
    [AclRightDC.RightStartExperiment]: 'StartExperiment',
    [AclRightDC.RightStopExperiment]: 'StopExperiment',
    [AclRightDC.RightApplyExperiment]: 'ApplyExperiment',
    [AclRightDC.RightCreateVariable]: 'CreateVariable',
    [AclRightDC.RightEditVariable]: 'EditVariable',
    [AclRightDC.RightDeleteVariable]: 'DeleteVariable',
  };

  return rightMapping[rightValue] || rightValue;
}

/**
 * Filters and processes rights for Project entity
 * @param rights - Array of user rights
 * @returns Processed rights specific to project
 */
function getProjectRights(rights: AclRightDC[]): MyAclRightDC[] {
  const result: MyAclRightDC[] = [];

  // Check for edit_config or edit_name -> EditProject
  const hasEditConfig = rights.includes(AclRightDC.RightEditConfig);
  const hasEditName = rights.includes(AclRightDC.RightEditName);
  result.push({
    title: 'EditProject',
    has: hasEditConfig || hasEditName,
  });
  // Check for delete_project
  result.push({
    title: formatRightName(AclRightDC.RightDeleteProject),
    has: rights.includes(AclRightDC.RightDeleteProject),
  });
  // Check for create_experiment
  result.push({
    title: formatRightName(AclRightDC.RightCreateExperiment),
    has: rights.includes(AclRightDC.RightCreateExperiment),
  });
  // Check for create_dataset
  result.push({
    title: formatRightName(AclRightDC.RightCreateDataset),
    has: rights.includes(AclRightDC.RightCreateDataset),
  });
  return result;
}

/**
 * Filters and processes rights for Namespace entity
 * @param rights - Array of user rights
 * @returns Processed rights specific to namespace
 */
function getNamespaceRights(rights: AclRightDC[]): MyAclRightDC[] {
  const result: MyAclRightDC[] = [];

  // Check for edit_config or edit_name -> EditNamespace
  const hasEditConfig = rights.includes(AclRightDC.RightEditConfig);
  const hasEditName = rights.includes(AclRightDC.RightEditName);
  result.push({
    title: 'EditNamespace',
    has: hasEditConfig || hasEditName,
  });
  // Check for delete_namespace
  result.push({
    title: formatRightName(AclRightDC.RightDeleteNamespace),
    has: rights.includes(AclRightDC.RightDeleteNamespace),
  });
  // Check for create_project
  result.push({
    title: formatRightName(AclRightDC.RightCreateProject),
    has: rights.includes(AclRightDC.RightCreateProject),
  });
  return result;
}

/**
 * Filters and processes rights for Experiment entity
 * @param rights - Array of user rights
 * @returns Processed rights specific to experiment
 */
function getExperimentRights(rights: AclRightDC[]): MyAclRightDC[] {
  const result: MyAclRightDC[] = [];

  // Check for edit_config or edit_name -> EditExperiment
  const hasEditConfig = rights.includes(AclRightDC.RightEditConfig);
  const hasEditName = rights.includes(AclRightDC.RightEditName);
  result.push({
    title: 'EditExperiment',
    has: hasEditConfig || hasEditName,
  });
  // Check for delete_experiment
  result.push({
    title: formatRightName(AclRightDC.RightDeleteExperiment),
    has: rights.includes(AclRightDC.RightDeleteExperiment),
  });
  // Check for start_experiment
  result.push({
    title: formatRightName(AclRightDC.RightStartExperiment),
    has: rights.includes(AclRightDC.RightStartExperiment),
  });

  // Check for stop_experiment
  result.push({
    title: formatRightName(AclRightDC.RightStopExperiment),
    has: rights.includes(AclRightDC.RightStopExperiment),
  });

  // Check for apply_experiment
  result.push({
    title: formatRightName(AclRightDC.RightApplyExperiment),
    has: rights.includes(AclRightDC.RightApplyExperiment),
  });

  // Check for create_dataset
  result.push({
    title: 'CreateDatasetLink',
    has: rights.includes(AclRightDC.RightCreateDataset),
  });

  // Check for delete_dataset
  result.push({
    title: 'DeleteDatasetLink',
    has: rights.includes(AclRightDC.RightDeleteDataset),
  });

  // Check for create_variable
  result.push({
    title: formatRightName(AclRightDC.RightCreateVariable),
    has: rights.includes(AclRightDC.RightCreateVariable),
  });

  // Check for edit_variable
  result.push({
    title: formatRightName(AclRightDC.RightEditVariable),
    has: rights.includes(AclRightDC.RightEditVariable),
  });

  // Check for delete_variable
  result.push({
    title: formatRightName(AclRightDC.RightDeleteVariable),
    has: rights.includes(AclRightDC.RightDeleteVariable),
  });

  return result;
}

/**
 * Filters and processes rights for Dataset entity
 * @param rights - Array of user rights
 * @returns Processed rights specific to dataset
 */
function getDatasetRights(rights: AclRightDC[]): MyAclRightDC[] {
  const result: MyAclRightDC[] = [];

  // Check for edit_config or edit_schema or edit_name -> EditDataset
  const hasEditConfig = rights.includes(AclRightDC.RightEditConfig);
  const hasEditSchema = rights.includes(AclRightDC.RightEditSchema);
  const hasEditName = rights.includes(AclRightDC.RightEditName);
  result.push({
    title: 'EditDataset',
    has: hasEditConfig || hasEditSchema || hasEditName,
  });

  // Check for delete_dataset
  result.push({
    title: formatRightName(AclRightDC.RightDeleteDataset),
    has: rights.includes(AclRightDC.RightDeleteDataset),
  });

  return result;
}

/**
 * Gets entity-specific rights based on entity type
 * @param rights - Array of user rights
 * @param objectType - Type of the entity
 * @returns Filtered rights specific to the entity type
 */
export function getUserEntityRights(
  rights: AclRightDC[],
  objectType: EntityType,
): MyAclRightDC[] {
  switch (objectType) {
    case 'project':
      return getProjectRights(rights);
    case 'namespace':
      return getNamespaceRights(rights);
    case 'experiment':
      return getExperimentRights(rights);
    case 'dataset':
      return getDatasetRights(rights);
    default:
      return [];
  }
}

/**
 * Checks if user has simple right for specific action
 * @param rights - Array of user rights
 * @param action - Type of action to check
 * @param objectType - Type of object
 * @returns Boolean indicating if user has the right
 */
export function getUserSimpleRight(
  rights: AclRightDC[],
  action: 'edit' | 'delete' | 'create',
  objectType: EntityType,
): boolean {
  switch (action) {
    case 'edit':
      // Check for edit_config or edit_name
      return (
        rights.includes(AclRightDC.RightEditConfig) ||
        rights.includes(AclRightDC.RightEditName)
      );
    case 'delete':
      // Check delete rights based on entity type
      switch (objectType) {
        case 'project':
          return rights.includes(AclRightDC.RightDeleteProject);
        case 'dataset':
          return rights.includes(AclRightDC.RightDeleteDataset);
        case 'experiment':
          return rights.includes(AclRightDC.RightDeleteExperiment);
        case 'namespace':
          return rights.includes(AclRightDC.RightDeleteNamespace);
        default:
          return false;
      }
    case 'create':
      // Check create rights based on entity type
      switch (objectType) {
        case 'project':
          return (
            rights.includes(AclRightDC.RightCreateExperiment) ||
            rights.includes(AclRightDC.RightCreateDataset)
          );
        case 'dataset':
          return false;
        case 'experiment':
          return (
            rights.includes(AclRightDC.RightCreateDataset) ||
            rights.includes(AclRightDC.RightCreateVariable)
          );
        case 'namespace':
          return rights.includes(AclRightDC.RightCreateProject);
        default:
          return false;
      }
    default:
      return false;
  }
}
