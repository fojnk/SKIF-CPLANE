import {
  DatasetTabType,
  EditorConfigType,
  EditorModeType,
  EntityType,
  NamespaceTabType,
  ExperimentTabType,
  ProjectTabType,
} from '@/modules/stream-flow/shared/types';

export interface ProjectSelectedItem {
  type: EntityType;
  id: number;
  name: string;
  dsTab?: DatasetTabType;
  pipeTab?: ExperimentTabType;
}

export interface ProjectNavigateParams {
  id: number;
  name: string;
  tab?: ProjectTabType;
  selected?: ProjectSelectedItem;
  replace?: boolean;
}

export interface BreadParams {
  id: number;
  name: string;
  type?: EntityType;
}

export interface NamespaceNavigateParams {
  id: number;
  name: string;
  tab?: NamespaceTabType;
  replace?: boolean;
}

export interface EditorNavigateParams {
  type: EditorConfigType;
  id: number;
  bread: BreadParams;
  selected?: ProjectSelectedItem;
  replace?: boolean;
  mode?: EditorModeType;
}
