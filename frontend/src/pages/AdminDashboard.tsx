import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchAdminStats, fetchRecentActivity } from '../usecases/adminUseCases';
import type { AdminStats, ActivityLog } from '../services/adminService';

export default function AdminDashboard(): JSX.Element {
  const auth = useAuth();

  const isAdmin = auth.user?.role === 'admin';

  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErrorMsg } = useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: () => fetchAdminStats(auth.accessToken ?? undefined),
    enabled: Boolean(auth.accessToken && isAdmin),
  });

  const { data: activities, isLoading: activitiesLoading, isError: activitiesError, error: activitiesErrorMsg } = useQuery<ActivityLog[]>({
    queryKey: ['recentActivity'],
    queryFn: () => fetchRecentActivity(20, auth.accessToken ?? undefined),
    enabled: Boolean(auth.accessToken && isAdmin),
  });

  const activityList = useMemo(() => activities ?? [], [activities]);

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-red-950">Access Denied</h1>
          <p className="mt-2 text-red-700">
            You do not have permission to access the admin dashboard. Only administrators can view this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="text-3xl font-semibold text-slate-950">Admin Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          System monitoring and administration tools.
        </p>
      </section>

      {/* System Statistics */}
      {statsLoading && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
          Loading system statistics...
        </div>
      )}

      {statsError && (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          {(statsErrorMsg as Error)?.message || 'Unable to load statistics.'}
        </div>
      )}

      {stats && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-950">System Statistics</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Total Users</p>
              <p className="mt-4 text-4xl font-bold text-slate-950">{stats.total_users}</p>
              <p className="mt-2 text-xs text-slate-600">{stats.active_users_today} active today</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skills Posted</p>
              <p className="mt-4 text-4xl font-bold text-slate-950">{stats.total_skills}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skill Swaps</p>
              <p className="mt-4 text-4xl font-bold text-slate-950">{stats.total_swaps}</p>
              <p className="mt-2 text-xs text-slate-600">{stats.pending_swaps} pending</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Transactions</p>
              <p className="mt-4 text-4xl font-bold text-slate-950">{stats.total_transactions}</p>
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-950">Recent Activity</h2>

        {activitiesLoading && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            Loading activity log...
          </div>
        )}

        {activitiesError && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
            {(activitiesErrorMsg as Error)?.message || 'Unable to load activity.'}
          </div>
        )}

        {activityList.length === 0 && !activitiesLoading && !activitiesError && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            No activity recorded yet.
          </div>
        )}

        <div className="mt-6 space-y-3">
          {activityList.map((activity) => (
            <article key={activity.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-950 capitalize">
                    {activity.action} {' '} <span className="text-slate-600">{activity.entity_type}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    User: {activity.user_id} | Entity ID: {activity.entity_id}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Admin Tools Section */}
      <section className="mt-12 rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm sm:p-12">
        <h2 className="text-2xl font-semibold text-amber-950">Admin Tools</h2>
        <p className="mt-2 text-sm text-amber-800">
          Additional administration features and moderation tools coming soon.
        </p>
        <div className="mt-6 space-y-2 text-sm text-amber-800">
          <p>• User management and suspension</p>
          <p>• Skill content moderation</p>
          <p>• Swap dispute resolution</p>
          <p>• System-wide announcements</p>
        </div>
      </section>
    </main>
  );
}
