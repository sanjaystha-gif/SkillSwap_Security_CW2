import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchMySkills, removeSkill } from '../usecases/skillsUseCases';
import type { Skill } from '../services/skillsService';

export default function MySkills(): JSX.Element {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<Skill[]>({
    queryKey: ['mySkills'],
    queryFn: () => fetchMySkills(auth.accessToken ?? undefined),
    enabled: Boolean(auth.accessToken),
  });

  const deleteMutation = useMutation({
    mutationFn: removeSkill,
    onSuccess: () => {
      setDeletingId(null);
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ['mySkills'] });
    },
    onError: (err) => {
      setDeleteError((err as Error).message || 'Failed to delete skill');
    },
  });

  const handleDelete = (skillId: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      setDeletingId(skillId);
      deleteMutation.mutate(skillId);
    }
  };

  const skillItems = useMemo(() => data ?? [], [data]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">My skills</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Manage your skill listings and keep them up to date.
            </p>
          </div>
          <Link
            to="/skills/create"
            className="inline-flex items-center justify-center rounded-2xl bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
          >
            Post new skill
          </Link>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            Loading skills...
          </div>
        )}

        {isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
            {(error as Error)?.message || 'Unable to load skills.'}
          </div>
        )}

        {deleteError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
            {deleteError}
          </div>
        )}

        {skillItems.length === 0 && !isLoading && !isError && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            You have not posted any skills yet.{' '}
            <Link to="/skills/create" className="font-semibold text-teal-950 hover:text-teal-700">
              Create one now
            </Link>
            .
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {skillItems.map((skill) => (
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
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/skills/${skill.id}/edit`}
                  className="text-sm font-semibold text-teal-950 transition hover:text-teal-700"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(skill.id)}
                  disabled={deletingId === skill.id}
                  className="text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-50"
                >
                  {deletingId === skill.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
