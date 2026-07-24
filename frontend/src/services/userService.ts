import apiClient from './apiClient';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: string;
  status: string;
  email_verified: boolean;
  bio?: string;
  is_public?: boolean;
}

export interface ProfileResponse {
  profile: UserProfile;
}

export async function getProfile(userId: string, accessToken?: string): Promise<UserProfile> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const response = await apiClient.request<ProfileResponse>(`/users/${userId}`, {
    method: 'GET',
    headers,
  });

  return response.profile;
}

export interface UpdateProfilePayload {
  display_name?: string;
  bio?: string;
  is_public?: boolean;
}

export async function updateProfile(userId: string, payload: UpdateProfilePayload, accessToken?: string): Promise<{ message: string }> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  return apiClient.request<{ message: string }>(`/users/${userId}`, {
    method: 'PUT',
    headers,
    body: payload,
  });
}
