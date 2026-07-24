import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

type LoginFormValues = z.infer<typeof schema>;

export default function Login(): JSX.Element {
  const { register, handleSubmit, formState } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });
  const { errors, isSubmitting } = formState;
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setServerError(null);
    try {
      await auth.login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (error) {
      const apiError = error as { payload?: { message?: string }; message?: string };
      setServerError(apiError.payload?.message ?? apiError.message ?? 'Unable to sign in');
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-[linear-gradient(135deg,_#083f3b,_#0f766e)] p-8 text-white sm:p-10 lg:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-teal-50">
            <LockKeyhole className="h-4 w-4" />
            Secure access
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back to SkillSwap</h1>
          <p className="mt-4 max-w-md text-base leading-8 text-teal-50/90">
            Pick up where you left off with a safe sign-in and a clear view of your sessions, credits, and listings.
          </p>
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-100">Why members return</p>
            <ul className="mt-4 space-y-3 text-sm text-teal-50/90">
              <li>• Review upcoming bookings and pending requests</li>
              <li>• Track credits with transparent history</li>
              <li>• Manage your skills and profile from one place</li>
            </ul>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Sign in</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Continue your exchange</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use your email and password to enter your account and pick up your next session.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail className="h-4 w-4 text-teal-700" />
                Email address
              </span>
              <input
                type="email"
                {...register('email')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <LockKeyhole className="h-4 w-4 text-teal-700" />
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </label>

            {serverError && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-teal-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            New to SkillSwap?{' '}
            <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-900">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
