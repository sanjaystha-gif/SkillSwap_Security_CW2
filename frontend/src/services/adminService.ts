import apiClient from './apiClient';

export interface AdminStats {
  total_users: number;
  total_skills: number;
  total_swaps: number;
  total_transactions: number;
  active_users_today: number;
  pending_swaps: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface AdminResponse {
  stats: AdminStats;
  recent_activities: ActivityLog[];
}

export async function getAdminStats(accessToken?: string): Promise<AdminStats> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  return apiClient.request<AdminStats>('/admin/stats', {
    method: 'GET',
    headers,
  });
}

export async function getRecentActivity(
  limit?: number,
  accessToken?: string
): Promise<ActivityLog[]> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const query = limit ? `?limit=${limit}` : '';

  const response = await apiClient.request<{ activities: ActivityLog[] }>(
    `/admin/activity${query}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.activities;
}

export async function suspendUser(userId: string, reason: string, accessToken?: string): Promise<{ message: string }> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  return apiClient.request<{ message: string }>(`/admin/users/${userId}/suspend`, {
    method: 'POST',
    headers,
    body: { reason },
  });
}

export async function unsuspendUser(userId: string, accessToken?: string): Promise<{ message: string }> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  return apiClient.request<{ message: string }>(`/admin/users/${userId}/unsuspend`, {
    method: 'POST',
    headers,
  });
}
