import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchMySwaps, acceptSwapRequest, declineSwapRequest } from '../usecases/swapUseCases';
import { fetchSkillDetail } from '../usecases/skillsUseCases';
import type { Skill } from '../services/skillsService';
import type { SwapRequest } from '../services/swapService';

export default function Swaps(): JSX.Element {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [expandedSwapId, setExpandedSwapId] = useState<string | null>(null);

  const { data: swaps, isLoading, isError, error } = useQuery<SwapRequest[]>({
    queryKey: ['mySwaps'],
    queryFn: () => fetchMySwaps(auth.accessToken ?? undefined),
    enabled: Boolean(auth.accessToken),
  });

  const swapsList = useMemo(() => swaps ?? [], [swaps]);
  const userId = auth.user?.uid;

  const uniqueSkillIds = useMemo(
    () =>
      Array.from(
        new Set(
          swapsList.flatMap((swap) => [swap.requester_skill_id, swap.target_skill_id]),
        ),
      ),
    [swapsList],
  );

  const skillQueries = useQueries({
    queries: uniqueSkillIds.map((skillId) => ({
      queryKey: ['skill', skillId],
      queryFn: () => fetchSkillDetail(skillId),
      enabled: Boolean(skillId),
    })),
  });

  const skillMap = useMemo(
    () =>
      skillQueries.reduce((map, query) => {
        if (query.data) {
          map[query.data.id] = query.data;
        }
        return map;
      }, {} as Record<string, Skill>),
    [skillQueries],
  );

  const getSkillTitle = (skillId: string) => skillMap[skillId]?.title ?? 'Unknown skill';

  const getSkillLink = (skillId: string) => (
    <Link
      to={`/skills/${skillId}`}
      className="text-sm font-semibold text-teal-950 underline decoration-dotted underline-offset-2 transition hover:text-teal-700"
    >
      {getSkillTitle(skillId)}
    </Link>
  );

  const isRequester = (swap: SwapRequest) => swap.requester_id === userId;
  const getUserSkillId = (swap: SwapRequest) => (isRequester(swap) ? swap.requester_skill_id : swap.target_skill_id);
  const getPartnerSkillId = (swap: SwapRequest) => (isRequester(swap) ? swap.target_skill_id : swap.requester_skill_id);

  const actionMutation = useMutation({
    mutationFn: ({ swapId, action }: { swapId: string; action: 'accept' | 'decline' }) => {
      if (action === 'accept') {
        return acceptSwapRequest(swapId, auth.accessToken ?? undefined);
      }
      return declineSwapRequest(swapId, auth.accessToken ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySwaps'] });
    },
  });

  // Group swaps by status
  const pending = swapsList.filter((s) => s.status === 'pending');
  const accepted = swapsList.filter((s) => s.status === 'accepted');
  const declined = swapsList.filter((s) => s.status === 'declined');

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Skill swaps</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              View and manage your skill exchange requests.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-950">Total swaps</span> {swapsList.length}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Pending</p>
            <p className="mt-3 text-3xl font-semibold text-amber-950">{pending.length}</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Accepted</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-950">{accepted.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Declined</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{declined.length}</p>
          </div>
        </div>
      </section>

      {isError && (
        <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          {(error as Error)?.message || 'Unable to load swaps.'}
        </section>
      )}

      {isLoading && (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
          Loading swap requests...
        </section>
      )}

      {!isLoading && swapsList.length === 0 && (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
          You have not initiated any skill swaps yet.{' '}
          <Link to="/skills" className="font-semibold text-teal-950 hover:text-teal-700">
            Browse skills
          </Link>
          {' '}to get started.
        </section>
      )}

      {/* Pending Swaps */}
      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-950">
            Pending ({pending.length})
          </h2>
          <div className="mt-4 space-y-3">
            {pending.map((swap) => (
              <article key={swap.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Pending
                      </span>
                      <span className="text-sm text-slate-600">
                        Requested {' '}
                        {new Date(swap.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedSwapId(expandedSwapId === swap.id ? null : swap.id)}
                    className="text-sm font-semibold text-teal-950 transition hover:text-teal-700"
                  >
                    {expandedSwapId === swap.id ? 'Hide' : 'View'}
                  </button>
                </div>

                {expandedSwapId === swap.id && (
                  <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          You offer
                        </p>
                        <div className="mt-2">
                          {getSkillLink(getUserSkillId(swap))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          They offer
                        </p>
                        <div className="mt-2">
                          {getSkillLink(getPartnerSkillId(swap))}
                        </div>
                      </div>
                    </div>

                    {!isRequester(swap) ? (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => actionMutation.mutate({ swapId: swap.id, action: 'accept' })}
                          disabled={actionMutation.isPending}
                          className="flex-1 rounded-2xl bg-green-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => actionMutation.mutate({ swapId: swap.id, action: 'decline' })}
                          disabled={actionMutation.isPending}
                          className="flex-1 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        Your request is pending. You will be notified when the other user responds.
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Accepted Swaps */}
      {accepted.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-950">
            Accepted ({accepted.length})
          </h2>
          <div className="mt-4 space-y-3">
            {accepted.map((swap) => (
              <article key={swap.id} className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        Accepted
                      </span>
                      <span className="text-sm text-green-700">
                        Accepted {' '}
                        {new Date(swap.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedSwapId(expandedSwapId === swap.id ? null : swap.id)}
                    className="text-sm font-semibold text-green-950 transition hover:text-green-700"
                  >
                    {expandedSwapId === swap.id ? 'Hide' : 'View'}
                  </button>
                </div>

                {expandedSwapId === swap.id && (
                  <div className="mt-4 space-y-4 border-t border-green-200 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                          You offer
                        </p>
                        <div className="mt-2">
                          {getSkillLink(getUserSkillId(swap))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                          They offer
                        </p>
                        <div className="mt-2">
                          {getSkillLink(getPartnerSkillId(swap))}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-green-700">
                      This swap has been accepted. Both parties can now coordinate the exchange.
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Declined Swaps */}
      {declined.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-950">
            Declined ({declined.length})
          </h2>
          <div className="mt-4 space-y-3">
            {declined.map((swap) => (
              <article key={swap.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm opacity-80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        Declined
                      </span>
                      <span className="text-sm text-slate-600">
                        Declined {' '}
                        {new Date(swap.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/skills/${isRequester(swap) ? swap.target_skill_id : swap.requester_skill_id}`}
                    className="text-sm font-semibold text-teal-950 transition hover:text-teal-700"
                  >
                    View the listing
                  </Link>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">You offered</p>
                    <div className="mt-2">{getSkillLink(getUserSkillId(swap))}</div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">They offered</p>
                    <div className="mt-2">{getSkillLink(getPartnerSkillId(swap))}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
