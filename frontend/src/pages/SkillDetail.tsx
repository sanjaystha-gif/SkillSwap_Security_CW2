import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSkillDetail } from '../usecases/skillsUseCases';
import { fetchProfile } from '../usecases/userUseCases';
import type { Skill } from '../services/skillsService';
import type { UserProfile } from '../services/userService';

export default function SkillDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  const { data: skill, isLoading, isError, error } = useQuery<Skill>({
    queryKey: ['skill', id],
    queryFn: () => fetchSkillDetail(id!),
    enabled: Boolean(id),
  });

  const { data: owner } = useQuery<UserProfile>({
    queryKey: ['skillOwner', skill?.owner_id],
    queryFn: () => fetchProfile(skill?.owner_id as string),
    enabled: Boolean(skill?.owner_id),
  });

  const skillData = useMemo(() => skill, [skill]);
  const ownerData = useMemo(() => owner, [owner]);

  if (!id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">Invalid skill ID.</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {isLoading && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-700">Loading skill...</div>
      )}

      {isError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          {(error as Error)?.message || 'Unable to load skill.'}
        </div>
      )}

      {skillData && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold text-slate-950">{skillData.title}</h1>
                {skillData.category && (
                  <p className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-slate-600">
                    {skillData.category}
                  </p>
                )}
              </div>
              <div>
                {skillData.is_active ? (
                  <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">Active</span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700">Inactive</span>
                )}
              </div>
            </div>

            <p className="mt-6 text-base leading-7 text-slate-700">{skillData.description}</p>
          </section>

          {ownerData && (
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
              <h2 className="text-2xl font-semibold text-slate-950">About the instructor</h2>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">{ownerData.display_name}</p>
                  <p className="mt-1 text-sm text-slate-600">Member since account creation</p>
                </div>
                <Link
                  to={`/users/${ownerData.id}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-teal-950 px-6 py-2 text-sm font-semibold text-white transition hover:bg-teal-900"
                >
                  View profile
                </Link>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
