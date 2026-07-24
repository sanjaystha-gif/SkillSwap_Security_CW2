import { getProfile, updateProfile } from '../services/userService';
import type { UpdateProfilePayload, UserProfile } from '../services/userService';

export function fetchProfile(userId: string, accessToken?: string): Promise<UserProfile> {
  return getProfile(userId, accessToken);
}

export function saveProfile(userId: string, payload: UpdateProfilePayload, accessToken?: string): Promise<{ message: string }> {
  return updateProfile(userId, payload, accessToken);
}
