import { ContentType } from '@/shared/api/common/http-client';
import { apiUrl, http } from '@/shared/api/http';

const cpBase = () =>
  buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl;

export type PermissionRequestItem = {
  id: number;
  requester_user_id: number;
  requester_name?: string;
  requester_email?: string | null;
  object_type: string;
  object_id: number;
  object_attribute: string;
  action: string;
  message: string;
  status: string;
  reviewer_user_id?: number | null;
  reviewed_at?: string | null;
  created_at: string;
};

export type PermissionRequestsList = {
  items: PermissionRequestItem[];
  total: number;
};

export async function fetchPermissionRequestsList(params: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<PermissionRequestsList> {
  const query: Record<string, string> = {
    limit: String(params.limit ?? 200),
    offset: String(params.offset ?? 0),
  };
  if (params.status) {
    query.status = params.status;
  }

  const r = await http.request<PermissionRequestsList>({
    path: `${cpBase()}/api/v2/permission-requests`,
    method: 'GET',
    query,
  });

  return r.data ?? { items: [], total: 0 };
}

export async function fetchMyPermissionRequestsList(): Promise<PermissionRequestsList> {
  const r = await http.request<PermissionRequestsList>({
    path: `${cpBase()}/api/v2/permission-requests/mine`,
    method: 'GET',
  });

  return r.data ?? { items: [], total: 0 };
}

export async function approvePermissionRequest(id: number): Promise<void> {
  await http.request({
    path: `${cpBase()}/api/v2/permission-requests/approve`,
    method: 'POST',
    type: ContentType.Json,
    body: { id },
  });
}

export async function rejectPermissionRequest(id: number): Promise<void> {
  await http.request({
    path: `${cpBase()}/api/v2/permission-requests/reject`,
    method: 'POST',
    type: ContentType.Json,
    body: { id },
  });
}

export type CreatePermissionRequestBody = {
  object_type: string;
  object_id: number;
  object_attribute?: string;
  action?: string;
  message?: string;
};

export async function createPermissionRequest(
  body: CreatePermissionRequestBody,
): Promise<PermissionRequestItem> {
  const r = await http.request<PermissionRequestItem>({
    path: `${cpBase()}/api/v2/permission-requests`,
    method: 'POST',
    type: ContentType.Json,
    body,
  });
  if (!r.data) {
    throw new Error('empty response');
  }
  return r.data;
}
