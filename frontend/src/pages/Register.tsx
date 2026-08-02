import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { registerUser } from '../usecases/authUseCases';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    display_name: z.string().min(3, 'Display name must be at least 3 characters'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirm_password: z.string().min(12, 'Please confirm your password'),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirm_password'],
      });
    }
  });

type RegisterFormValues = z.infer<typeof schema>;

export default function Register(): JSX.Element {
  const { register, handleSubmit, formState } = useForm<RegisterFormValues>({ resolver: zodResolver(schema) });
  const { errors, isSubmitting } = formState;
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setServerError(null);
    setSuccess(null);
    try {
      await registerUser(values);
      setSuccess('Registration successful. Please verify your email, then sign in.');
      setTimeout(() => {
        navigate('/login');
      }, 1300);
    } catch (error) {
      const apiError = error as { payload?: { message?: string }; message?: string };
      setServerError(apiError.payload?.message ?? apiError.message ?? 'Unable to register');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm sm:p-10 overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-teal-100">
            <ShieldCheck className="h-4 w-4" />
            Secure sign-up
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Create your SkillSwap account</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            Join trusted collaborators, offer knowledge, and trade credits in a community built around practical learning.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-inner shadow-slate-950/5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">Why join SkillSwap?</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-300" />
                <p>Share your skills, grow your profile, and earn credits from real exchanges.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                <p>Discover members offering exactly the expertise you need.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <p>Keep every booking transparent with clear credit tracking and progress updates.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Create your account</h2>
            <p className="mt-2 text-sm text-slate-600">Start sharing skills with the community.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Display name</span>
              <input
                type="text"
                autoComplete="name"
                {...register('display_name')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              {errors.display_name && <p className="mt-2 text-sm text-red-600">{errors.display_name.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Confirm password</span>
              <input
                type="password"
                autoComplete="new-password"
                {...register('confirm_password')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              {errors.confirm_password && <p className="mt-2 text-sm text-red-600">{errors.confirm_password.message}</p>}
            </label>

            <div aria-live="polite" className="min-h-[1.5rem] text-sm">
              {serverError && (
                <p className="text-red-600" role="alert">
                  {serverError}
                </p>
              )}
              {success && <p className="text-green-600">{success}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Registering…' : 'Register'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-950 hover:text-teal-700">
              Sign in
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
