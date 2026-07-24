import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../usecases/userUseCases';
import { fetchUserSkills } from '../usecases/skillsUseCases';
import type { UserProfile } from '../services/userService';
import type { Skill } from '../services/skillsService';

export default function UserProfile(): JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const auth = useAuth();

  const { data: profile, isLoading: profileLoading, isError: profileError, error: profileErrorMsg } = useQuery<UserProfile>({
    queryKey: ['userProfile', userId],
    queryFn: () => (userId ? fetchProfile(userId, auth.accessToken ?? undefined) : Promise.reject(new Error('Invalid user ID'))),
    enabled: Boolean(userId),
  });

  const { data: skillsData, isLoading: skillsLoading, isError: skillsError, error: skillsErrorMsg } = useQuery<Skill[]>({
    queryKey: ['userSkills', userId],
    queryFn: () => (userId ? fetchUserSkills(userId) : Promise.reject(new Error('Invalid user ID'))),
    enabled: Boolean(userId),
  });

  const skills = useMemo(() => skillsData ?? [], [skillsData]);

  if (!userId) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          Invalid user ID
        </div>
      </main>
    );
  }

  if (profileLoading || skillsLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
          Loading profile...
        </div>
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
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
          User not found
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Intro Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">{profile.display_name}</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">{profile.email}</p>
            {profile.bio && <p className="mt-4 leading-6 text-slate-700">{profile.bio}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {profile.status}
            </div>
            {profile.role !== 'user' && (
              <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                {profile.role}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-950">
            {profile.display_name} has posted {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
          </h2>
        </div>

        {skillsError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
            {(skillsErrorMsg as Error)?.message || 'Unable to load skills.'}
          </div>
        )}

        {skills.length === 0 && !skillsError && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            This user has not posted any skills yet.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((skill) => (
            <article key={skill.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <Link
                    to={`/skills/${skill.id}`}
                    className="text-lg font-semibold text-teal-950 transition hover:text-teal-700"
                  >
                    {skill.title}
                  </Link>
                  {skill.category && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{skill.category}</p>
                  )}
                </div>
                <div>
                  {skill.is_active ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{skill.description}</p>
              {auth.isAuthenticated && auth.user?.uid && auth.user.uid !== profile.id && (
                <Link
                  to={`/swaps/initiate/${skill.id}`}
                  className="mt-4 inline-block text-sm font-semibold text-teal-950 transition hover:text-teal-700"
                >
                  Interested
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Back Link */}
      <div className="mt-8">
        <Link to="/skills" className="text-sm font-semibold text-teal-950 transition hover:text-teal-700">
          ← Back to skills
        </Link>
      </div>
    </main>
  );
}
