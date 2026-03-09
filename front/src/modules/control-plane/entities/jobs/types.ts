export type ProjectJobsQuery = {
  entity_id: number;
  entity_type: string;
  limit?: number;
  offset?: number;
  created_by?: string;
  order?: string;
  sort?: string;
  status?: string;
  type?: string;
};
