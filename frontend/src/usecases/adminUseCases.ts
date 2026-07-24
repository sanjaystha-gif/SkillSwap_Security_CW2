import {
  getAdminStats,
  getRecentActivity,
  suspendUser,
  unsuspendUser,
} from '../services/adminService';
import type { AdminStats, ActivityLog } from '../services/adminService';

export function fetchAdminStats(accessToken?: string): Promise<AdminStats> {
  return getAdminStats(accessToken);
}

export function fetchRecentActivity(limit?: number, accessToken?: string): Promise<ActivityLog[]> {
  return getRecentActivity(limit, accessToken);
}

export function suspendUserAccount(
  userId: string,
  reason: string,
  accessToken?: string
): Promise<{ message: string }> {
  return suspendUser(userId, reason, accessToken);
}

export function unsuspendUserAccount(userId: string, accessToken?: string): Promise<{ message: string }> {
  return unsuspendUser(userId, accessToken);
}
