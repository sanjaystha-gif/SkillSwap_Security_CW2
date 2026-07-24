import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchSkillDetail, fetchMySkills } from '../usecases/skillsUseCases';
import { submitSwapRequest } from '../usecases/swapUseCases';
import type { Skill } from '../services/skillsService';
import CreditChip from '../components/CreditChip';

export default function InitiateSwap(): JSX.Element {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');

  const { data: targetSkill, isLoading: skillLoading, isError: skillError, error: skillErrorMsg } = useQuery<Skill>({
    queryKey: ['skill', skillId],
    queryFn: () => (skillId ? fetchSkillDetail(skillId) : Promise.reject(new Error('Invalid skill ID'))),
    enabled: Boolean(skillId),
  });

  const { data: mySkills, isLoading: skillsLoading, isError: skillsError, error: skillsErrorMsg } = useQuery<Skill[]>({
    queryKey: ['mySkills'],
    queryFn: () => fetchMySkills(auth.accessToken ?? undefined),
    enabled: Boolean(auth.accessToken),
  });

  const skills = useMemo(() => mySkills ?? [], [mySkills]);
  const availableSkills = useMemo(
    () =>
      skills
        .filter((skill) => skill.is_active)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [skills],
  );
  const selectedSkill = useMemo(
    () => availableSkills.find((skill) => skill.id === selectedSkillId),
    [availableSkills, selectedSkillId],
  );
  const isOwner = Boolean(targetSkill && auth.user?.uid === targetSkill.owner_id);

  const swapMutation = useMutation({
    mutationFn: (requesterSkillId: string) =>
      submitSwapRequest(requesterSkillId, skillId ?? '', auth.accessToken ?? undefined),
    onSuccess: () => {
      navigate('/swaps');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) {
      return;
    }
    swapMutation.mutate(selectedSkillId);
  };

  if (!skillId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          Invalid skill ID
        </div>
      </main>
    );
  }

  if (skillLoading || skillsLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
          Loading skills...
        </div>
      </main>
    );
  }

  if (skillError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          {(skillErrorMsg as Error)?.message || 'Unable to load skill.'}
        </div>
      </main>
    );
  }

  if (skillsError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          {(skillsErrorMsg as Error)?.message || 'Unable to load your skills.'}
        </div>
      </main>
    );
  }

  if (!targetSkill) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
          Skill not found.
        </div>
      </main>
    );
  }

  if (isOwner) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-semibold text-slate-950">This is your own skill</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You cannot request a swap for a skill you own. Manage this listing from your skills dashboard instead.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-skills')}
              className="inline-flex items-center justify-center rounded-2xl bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Manage my skills
            </button>
            <button
              type="button"
              onClick={() => navigate('/skills')}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              Browse other skills
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (skills.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-semibold text-slate-950">Unable to initiate swap</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You need to create at least one skill before you can request a swap with another user.
          </p>
          <div className="mt-6">
            <Link
              to="/skills/create"
              className="inline-flex items-center justify-center rounded-2xl bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Create a skill
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (availableSkills.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-semibold text-slate-950">No active skills available</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You have created skills, but none are active. Activate one of your skills before sending a swap request.
          </p>
          <div className="mt-6">
            <Link
              to="/my-skills"
              className="inline-flex items-center justify-center rounded-2xl bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Manage my skills
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="text-3xl font-semibold text-slate-950">Request skill swap</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select one of your skills to offer in exchange for this one.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="targetSkill" className="block text-sm font-semibold text-slate-950">
              Target skill (what you want)
            </label>
            <div
              id="targetSkill"
              className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{targetSkill.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{targetSkill.description}</p>
                </div>
                <CreditChip value={targetSkill.credit_cost ?? 0} />
              </div>
              <p className="mt-4 text-sm text-slate-500">
                This skill requires the credit amount above when a swap is confirmed.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="requesterSkill" className="block text-sm font-semibold text-slate-950">
              Your skill (what you offer)
            </label>
            <select
              id="requesterSkill"
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 focus:border-teal-950 focus:outline-none"
            >
              <option value="">Select a skill to offer...</option>
              {availableSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.title} — {skill.credit_cost ?? 0} credits
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-600">
              {availableSkills.length} active skill{availableSkills.length === 1 ? '' : 's'} available
            </p>
            {selectedSkill && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-950">Selected offer</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p>{selectedSkill.title}</p>
                  <CreditChip value={selectedSkill.credit_cost ?? 0} />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Active skill and eligible for booking while this request is pending.
                </p>
              </div>
            )}
          </div>

          {swapMutation.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(swapMutation.error as Error)?.message || 'Failed to create swap request'}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!selectedSkillId || swapMutation.isPending}
              className="flex-1 rounded-2xl bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:opacity-50"
            >
              {swapMutation.isPending ? 'Sending request...' : 'Send swap request'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
