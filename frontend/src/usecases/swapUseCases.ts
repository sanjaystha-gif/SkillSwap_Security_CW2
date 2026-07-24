import {
  createSwapRequest,
  listMySwapRequests,
  updateSwapRequest,
} from '../services/swapService';
import type { SwapRequest } from '../services/swapService';

export function submitSwapRequest(
  requesterSkillId: string,
  targetSkillId: string,
  accessToken?: string
): Promise<SwapRequest> {
  return createSwapRequest(requesterSkillId, targetSkillId, accessToken);
}

export function fetchMySwaps(accessToken?: string): Promise<SwapRequest[]> {
  return listMySwapRequests(accessToken);
}

export function acceptSwapRequest(
  swapId: string,
  accessToken?: string
): Promise<SwapRequest> {
  return updateSwapRequest(swapId, 'accepted', accessToken);
}

export function declineSwapRequest(
  swapId: string,
  accessToken?: string
): Promise<SwapRequest> {
  return updateSwapRequest(swapId, 'declined', accessToken);
}
