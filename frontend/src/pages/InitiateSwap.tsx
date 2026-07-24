import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchSkillDetail, fetchMySkills } from '../usecases/skillsUseCases';
import { submitSwapRequest } from '../usecases/swapUseCases';
import type { Skill } from '../services/skillsService';

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

  if (skills.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-semibold text-slate-950">Unable to initiate swap</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You need to create at least one skill before you can request a swap with another user.
          </p>
          <div className="mt-6">
            <a
              href="/skills/create"
              className="inline-flex items-center justify-center rounded-2xl bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Create a skill
            </a>
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
              className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700"
            >
              <p className="font-semibold">{targetSkill.title}</p>
              <p className="mt-1 text-sm text-slate-600">{targetSkill.description}</p>
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
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.title}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-600">
              {skills.length} skill{skills.length === 1 ? '' : 's'} available
            </p>
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
