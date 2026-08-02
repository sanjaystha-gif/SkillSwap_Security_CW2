import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components';
import { resetPasswordWithToken } from '../services/authService';

export default function ResetPassword(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      navigate('/forgot-password');
    } else {
      setToken(t);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken(token, password);
      navigate('/login');
    } catch (err) {
      setError((err as Error).message || 'Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-950">Create a new password</h1>
          <p className="mt-2 text-sm text-slate-600">This will update your account and sign you in securely.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-900">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="Enter your new password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-900">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Reset password
          </Button>

          <div className="pt-4 text-center text-sm text-slate-600">
            <button type="button" onClick={() => navigate('/login')} className="font-semibold text-teal-950 hover:text-teal-700">
              Back to login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
