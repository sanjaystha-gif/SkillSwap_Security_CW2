import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BadgeCheck, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchSkillDetail } from '../usecases/skillsUseCases';
import { fetchProfile } from '../usecases/userUseCases';
import type { Skill } from '../services/skillsService';
import type { UserProfile } from '../services/userService';
import CreditChip from '../components/CreditChip';

export default function SkillDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const auth = useAuth();
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (!id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">Invalid skill ID.</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {isLoading && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">Loading skill...</div>
      )}

      {isError && (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {(error as Error)?.message || 'Unable to load skill.'}
        </div>
      )}

      {skillData && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
                <Sparkles className="h-4 w-4" />
                Skill listing
              </span>
              {skillData.is_active ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">Active</span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">Inactive</span>
              )}
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{skillData.title}</h1>
            {skillData.category && (
              <p className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                {skillData.category}
              </p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <CreditChip value={skillData.credit_cost ?? 0} />
              <span className="text-sm text-slate-500">Credits held when the swap is confirmed</span>
            </div>

            <p className="mt-6 text-base leading-8 text-slate-700">{skillData.description}</p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Exchange value</p>
                  <p className="mt-2 text-sm text-slate-600">Credits held during a confirmed booking.</p>
                </div>
                <CreditChip value={skillData.credit_cost ?? 0} />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {auth.isAuthenticated ? (
                skillData.owner_id === auth.user?.uid ? (
                  <Link
                    to="/my-skills"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Manage your listing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    to={`/swaps/initiate/${skillData.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
                  >
                    Request swap
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
                >
                  Sign in to request swap
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link to="/skills" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700">
                Back to listings
              </Link>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
                <BookOpen className="h-4 w-4" />
                About the provider
              </div>
              {ownerData ? (
                <div className="mt-6">
                  <p className="text-2xl font-semibold">{ownerData.display_name}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{ownerData.bio || 'This member has shared a clear profile and is ready to connect.'}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-teal-100">
                    <BadgeCheck className="h-4 w-4" />
                    Verified skill exchange member
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <Link
                      to={`/users/${ownerData.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      View provider profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      {copied ? 'Copied!' : 'Copy listing link'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm leading-7 text-slate-300">Profile details are loading.</p>
              )}
            </section>
          </aside>
        </div>
      )}
    </main>
  );
}
