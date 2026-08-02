import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components';
import { verifyEmailToken } from '../services/authService';

export default function VerifyEmail(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading');
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current) {
      return;
    }
    hasVerifiedRef.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmailToken(token);
        setStatus('success');
      } catch (err) {
        const apiError = err as { status?: number };
        if (apiError.status === 410) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
      }
    };

    verify();
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center" aria-live="polite" role="status">
        {status === 'loading' && (
          <>
            <p className="text-sm text-slate-600">Verifying your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-3xl font-semibold text-slate-950">Email verified</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Your account is fully verified and ready to use.
            </p>
            <div className="mt-8">
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to login
              </Button>
            </div>
          </>
        )}

        {status === 'expired' && (
          <>
            <h1 className="text-3xl font-semibold text-rose-600">Link expired</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              This verification link is no longer valid. Request a new link from the login page.
            </p>
            <div className="mt-8 space-y-3">
              <Button onClick={() => navigate('/login')} className="w-full">
                Back to login
              </Button>
              <Link to="/register" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
                Create a new account
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-3xl font-semibold text-rose-600">Verification failed</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              We could not verify your email. Try again from the login page.
            </p>
            <div className="mt-8">
              <Button onClick={() => navigate('/login')} className="w-full">
                Back to login
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
