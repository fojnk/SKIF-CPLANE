export type CloneForm = {
  comment?: string;
  name: string;
};

export type SelectedProject = {
  name: string;
  id: number;
};

export type ClonePayload = {
  src_id: number;
  src_name: string;
  src_type: 'pipe' | 'ds';
  src_project?: SelectedProject;
  can_create?: boolean;
};
