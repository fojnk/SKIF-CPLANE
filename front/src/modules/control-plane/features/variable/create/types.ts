export type SFVariableCreateForm = {
  name: string;
  type: 'string' | 'int' | 'json' | 'yql' | 'python';
  value: string;
  comment?: string;
};

export type SFVariableCreatePayload = {
  parent: 'namespace' | 'project' | 'experiment';
  parent_id: number;
};
