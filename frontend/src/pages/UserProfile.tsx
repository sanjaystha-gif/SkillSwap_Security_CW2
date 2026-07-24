import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../usecases/userUseCases';
import { fetchUserSkills } from '../usecases/skillsUseCases';
import type { UserProfile } from '../services/userService';
import type { Skill } from '../services/skillsService';
import CreditChip from '../components/CreditChip';

export default function UserProfile(): JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const auth = useAuth();

  const { data: profile, isLoading: profileLoading, isError: profileError, error: profileErrorMsg } = useQuery<UserProfile>(
    {
      queryKey: ['userProfile', userId],
      queryFn: () => (userId ? fetchProfile(userId, auth.accessToken ?? undefined) : Promise.reject(new Error('Invalid user ID'))),
      enabled: Boolean(userId),
    },
  );

  const { data: skillsData, isLoading: skillsLoading, isError: skillsError, error: skillsErrorMsg } = useQuery<Skill[]>(
    {
      queryKey: ['userSkills', userId],
      queryFn: () => (userId ? fetchUserSkills(userId) : Promise.reject(new Error('Invalid user ID'))),
      enabled: Boolean(userId),
    },
  );

  const skills = useMemo(() => skillsData ?? [], [skillsData]);
  const isMine = auth.user?.uid === userId;

  if (!userId) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">Invalid user ID</div>
      </main>
    );
  }

  if (profileLoading || skillsLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">Loading profile...</div>
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          {(profileErrorMsg as Error)?.message || 'Unable to load user profile.'}
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">User not found</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                <Sparkles className="h-3.5 w-3.5" />
                Member profile
              </span>
              <h1 className="mt-6 text-3xl font-semibold text-slate-950">{profile.display_name}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {profile.bio || 'No bio provided yet. Connect with this member to learn more about their offerings.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Email</p>
                <p className="mt-2 text-base font-medium text-slate-950">{profile.email}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Membership</p>
                <p className="mt-2 text-base font-medium text-slate-950">{profile.status}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Visibility</p>
                <p className="mt-2 text-base font-medium text-slate-950">{profile.is_public ? 'Public' : 'Private'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Role</p>
                <p className="mt-2 text-base font-medium text-slate-950">{profile.role}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-sm sm:p-10">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
            <BadgeCheck className="h-4 w-4" />
            Verified member
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            This profile shows all skill listings from this member. If you want to work together, start by reviewing their credit values and sending a request.
          </p>
          {isMine && (
            <Link
              to="/profile"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Edit your profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </aside>
      </section>

      <section className="mt-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{profile.display_name}'s skills</h2>
            <p className="mt-1 text-sm text-slate-600">Browse available lessons, offers, and sessions shared by this member.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            <span>{skills.length}</span>
            {skills.length === 1 ? 'listing' : 'listings'}
          </div>
        </div>

        {skillsError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
            {(skillsErrorMsg as Error)?.message || 'Unable to load skills.'}
          </div>
        )}

        {skills.length === 0 && !skillsError && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            This member has not posted any skills yet.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((skill) => (
            <article key={skill.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    to={`/skills/${skill.id}`}
                    className="text-lg font-semibold text-slate-950 transition hover:text-teal-700"
                  >
                    {skill.title}
                  </Link>
                  {skill.category && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{skill.category}</p>
                  )}
                </div>
                <CreditChip value={skill.credit_cost ?? 0} />
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{skill.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${skill.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {skill.is_active ? 'Active' : 'Inactive'}
                </span>
                {auth.isAuthenticated && !isMine && (
                  <Link
                    to={`/swaps/initiate/${skill.id}`}
                    className="text-sm font-semibold text-teal-950 transition hover:text-teal-700"
                  >
                    Interested
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link to="/skills" className="text-sm font-semibold text-teal-950 transition hover:text-teal-700">
          ← Back to skills
        </Link>
      </div>
    </main>
  );
}
