import apiClient from './apiClient';

export interface SwapRequest {
  id: string;
  requester_id: string;
  requester_skill_id: string;
  target_skill_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface SwapResponse {
  swaps: SwapRequest[];
}

export async function createSwapRequest(
  requesterSkillId: string,
  targetSkillId: string,
  accessToken?: string
): Promise<SwapRequest> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const body = {
    requester_skill_id: requesterSkillId,
    target_skill_id: targetSkillId,
  };

  return apiClient.request<SwapRequest>('/swaps', {
    method: 'POST',
    headers,
    body,
  });
}

export async function listMySwapRequests(accessToken?: string): Promise<SwapRequest[]> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const response = await apiClient.request<SwapResponse>('/swaps', {
    method: 'GET',
    headers,
  });
  return response.swaps;
}

export async function updateSwapRequest(
  swapId: string,
  status: 'accepted' | 'declined',
  accessToken?: string
): Promise<SwapRequest> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  return apiClient.request<SwapRequest>(`/swaps/${swapId}`, {
    method: 'PUT',
    headers,
    body: { status },
  });
}
