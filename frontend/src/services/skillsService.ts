import apiClient from './apiClient';

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: string | null;
  owner_id: string;
  is_active: boolean;
}

export interface SkillsResponse {
  skills: Skill[];
}

export async function listSkills(): Promise<Skill[]> {
  const response = await apiClient.request<SkillsResponse>('/skills', {
    method: 'GET',
  });
  return response.skills;
}

export async function getSkill(skillId: string): Promise<Skill> {
  return apiClient.request<Skill>(`/skills/${skillId}`, {
    method: 'GET',
  });
}

export async function listMySkills(accessToken?: string): Promise<Skill[]> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const response = await apiClient.request<SkillsResponse>('/skills?owner=me', {
    method: 'GET',
    headers,
  });
  return response.skills;
}

export async function listUserSkills(userId: string): Promise<Skill[]> {
  const response = await apiClient.request<SkillsResponse>(`/skills?owner=${userId}`, {
    method: 'GET',
  });
  return response.skills;
}

export interface CreateSkillPayload {
  title: string;
  description: string;
  category?: string;
}

export async function createSkill(payload: CreateSkillPayload): Promise<Skill> {
  return apiClient.request<Skill>('/skills', {
    method: 'POST',
    body: payload,
  });
}

export interface UpdateSkillPayload {
  title?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}

export async function updateSkill(
  skillId: string,
  payload: UpdateSkillPayload
): Promise<Skill> {
  return apiClient.request<Skill>(`/skills/${skillId}`, {
    method: 'PUT',
    body: payload,
  });
}

export async function deleteSkill(skillId: string): Promise<void> {
  await apiClient.request<void>(`/skills/${skillId}`, {
    method: 'DELETE',
  });
}
