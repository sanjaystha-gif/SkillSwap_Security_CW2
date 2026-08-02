import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitNewSkill } from '../usecases/skillsUseCases';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || undefined : value),
    z.string().max(80).optional(),
  ),
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

type SkillFormValues = z.infer<typeof schema>;

export default function CreateSkill(): JSX.Element {
  const { register, handleSubmit, formState, reset } = useForm<SkillFormValues>({
    resolver: zodResolver(schema),
  });
  const { errors, isSubmitting } = formState;
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const auth = useAuth();

  const onSubmit: SubmitHandler<SkillFormValues> = async (values) => {
    setServerError(null);
    setSuccess(null);

    try {
      await submitNewSkill(values, auth.accessToken ?? undefined);
      setSuccess('Skill posted successfully. Redirecting to skills page...');
      reset();
      setTimeout(() => {
        navigate('/skills');
      }, 1200);
    } catch (error) {
      const apiError = error as { payload?: { message?: string }; message?: string };
      setServerError(apiError.payload?.message ?? apiError.message ?? 'Unable to post skill');
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Create listing</p>
            <h1 className="text-3xl font-semibold text-slate-950">Post a new skill</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Share a new skill offering and let others discover what you can teach.
            </p>
            <div className="rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">Pro tip</p>
              <ul className="mt-3 space-y-2">
                <li>• Keep the title concise and outcome-focused.</li>
                <li>• Describe what attendees will learn or achieve.</li>
                <li>• Set a credit cost that reflects the session effort.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              {...register('description')}
              rows={6}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <input
              type="text"
              {...register('category')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Credit cost</label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register('credit_cost')}
              min={0}
              step={1}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="e.g. 20"
            />
            {errors.credit_cost && <p className="mt-2 text-sm text-red-600">{errors.credit_cost.message}</p>}
            <p className="mt-2 text-sm text-slate-500">Set how many credits this skill is worth for swap requests.</p>
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-teal-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-950/10 transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Posting…' : 'Post skill'}
          </button>
        </form>
      </div>
    </section>
  </main>
  );
}
