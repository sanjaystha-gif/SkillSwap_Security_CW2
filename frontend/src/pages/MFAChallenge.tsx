import { useState, type FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components';

export default function MFAChallenge(): JSX.Element {
  const navigate = useNavigate();
  const { mfaChallengeToken, verifyMfa } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mfaChallengeToken) {
      navigate('/login');
    }
  }, [mfaChallengeToken, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (attempts >= 5) {
      setError('Too many attempts. Return to login and try again.');
      setLoading(false);
      return;
    }

    try {
      if (!mfaChallengeToken) {
        setError('Missing MFA challenge. Please sign in again.');
        return;
      }

      await verifyMfa(mfaChallengeToken, code);
      navigate('/', { replace: true });
    } catch {
      setError('Unable to verify the code. Please try again.');
      setAttempts((value) => value + 1);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Multi-factor authentication</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Enter your verification code</h1>
          <p className="mt-2 text-sm text-slate-600">
            Use a 6-digit authenticator code or a backup code (for example, ABCD-EFGH).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label htmlFor="mfa-code" className="block text-sm font-medium text-slate-900">
            Verification or backup code
          </label>
          <input
            id="mfa-code"
            type="text"
            autoComplete="one-time-code"
            inputMode="text"
            maxLength={9}
            placeholder="000000 or ABCD-EFGH"
            value={code}
            onChange={(e) => {
              const normalized = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9-]/g, '')
                .replace(/-{2,}/g, '-');
              setCode(normalized);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-xl tracking-[0.22em] text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            aria-label="MFA code"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{attempts} / 5 attempts used</span>
            <Link to="/login" className="text-teal-950 font-semibold hover:text-teal-700">
              Back to login
            </Link>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Verify code
          </Button>
        </form>
      </div>
    </main>
  );
}
