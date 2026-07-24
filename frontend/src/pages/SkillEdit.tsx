import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchSkillDetail, updateExistingSkill } from '../usecases/skillsUseCases';
import type { Skill, UpdateSkillPayload } from '../services/skillsService';

const skillEditSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || undefined : value),
    z.string().max(80).optional(),
  ),
  is_active: z.boolean().optional(),
  credit_cost: z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : Number(trimmed);
      }
      return value;
    },
    z.number().min(0, 'Credit cost must be 0 or more').max(999, 'Credit cost must be 999 or less').optional(),
  ),
});

type SkillFormData = z.infer<typeof skillEditSchema>;

export default function SkillEdit(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: skill, isLoading, isError, error } = useQuery<Skill>({
    queryKey: ['skill', id],
    queryFn: () => (id ? fetchSkillDetail(id) : Promise.reject(new Error('Invalid skill ID'))),
    enabled: Boolean(id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillEditSchema),
  });

  useEffect(() => {
    if (skill) {
      reset({
        title: skill.title,
        description: skill.description,
        category: skill.category ?? '',
        is_active: skill.is_active,
        credit_cost: skill.credit_cost ?? undefined,
      });
    }
  }, [skill, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSkillPayload) => (id ? updateExistingSkill(id, data) : Promise.reject(new Error('Invalid skill ID'))),
    onSuccess: () => {
      navigate('/my-skills');
    },
  });

  const onSubmit = async (data: SkillFormData) => {
    const payload: UpdateSkillPayload = {
      title: data.title,
      description: data.description,
      category: data.category,
      is_active: data.is_active,
      credit_cost: data.credit_cost,
    };
    updateMutation.mutate(payload);
  };

  if (!id) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          Invalid skill ID
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
          Loading skill details...
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
          {(error as Error)?.message || 'Unable to load skill.'}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="text-3xl font-semibold text-slate-950">Edit skill</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Update your skill information.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-950">
              Skill title
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:border-teal-950 focus:outline-none"
              placeholder="e.g., Web Design"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-950">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:border-teal-950 focus:outline-none resize-none"
              placeholder="Describe your skill in detail..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-950">
              Category (optional)
            </label>
            <input
              {...register('category')}
              type="text"
              id="category"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:border-teal-950 focus:outline-none"
              placeholder="e.g., Design, Development"
            />
          </div>

          <div>
            <label htmlFor="credit_cost" className="block text-sm font-semibold text-slate-950">
              Credit cost
            </label>
            <input
              {...register('credit_cost')}
              type="number"
              id="credit_cost"
              min={0}
              step={1}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:border-teal-950 focus:outline-none"
              placeholder="e.g. 20"
            />
            {errors.credit_cost && <p className="mt-1 text-sm text-red-600">{errors.credit_cost.message}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                {...register('is_active')}
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-teal-950"
              />
              <span className="text-sm font-semibold text-slate-950">Skill is active</span>
            </label>
          </div>

          {updateMutation.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(updateMutation.error as Error)?.message || 'Failed to update skill'}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="flex-1 rounded-2xl bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:opacity-50"
            >
              {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-skills')}
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
