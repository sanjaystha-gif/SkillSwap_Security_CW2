import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/v1/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setStatus('success');
        } else if (res.status === 410) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surf">
      <div className="max-w-sm w-full px-4 text-center">
        {status === 'loading' && (
          <p className="text-ink2">Verifying email...</p>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-ink mb-4">Email verified</h1>
            <p className="text-ink2 mb-6">Your account is ready. Log in to continue.</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to login
            </Button>
          </>
        )}
        {status === 'expired' && (
          <>
            <h1 className="text-2xl font-bold text-red-500 mb-4">Link expired</h1>
            <p className="text-ink2 mb-6">Request a new verification email.</p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded"
              />
              <Button className="w-full">Resend verification</Button>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-red-500 mb-4">Verification failed</h1>
            <Button onClick={() => navigate('/login')} className="w-full">
              Back to login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
