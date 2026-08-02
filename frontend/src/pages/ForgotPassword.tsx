import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components';
import { requestPasswordReset } from '../services/authService';

export default function ForgotPassword(): JSX.Element {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {submitted ? (
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-slate-950">Check your email</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If an account exists, you&apos;ll receive a password reset link shortly.
            </p>
            <div className="mt-8">
              <Link to="/login" className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-900">
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-slate-950">Forgot password?</h1>
              <p className="mt-2 text-sm text-slate-600">
                Enter your email and we&apos;ll send a secure link to reset your password.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <label className="block text-sm font-medium text-slate-900">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="you@example.com"
                required
              />
              {error && <p className="text-sm text-red-600" aria-live="assertive">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Send reset link
              </Button>
              <p className="mt-3 text-xs text-slate-500" aria-live="polite">
                If an account exists, we will send a password reset link without disclosing whether the email is registered.
              </p>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-teal-950 hover:text-teal-700">
                Sign in
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </main>
  );
}
