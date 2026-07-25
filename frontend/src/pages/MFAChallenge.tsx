import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function MFAChallenge() {
  const navigate = useNavigate();
  const { mfaChallengeToken } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!mfaChallengeToken) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (attempts >= 5) {
      setError('Too many attempts. Go back to login.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_token: mfaChallengeToken, code }),
        credentials: 'include',
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        setAttempts(attempts + 1);
        setError('Invalid code. Try again.');
        setCode('');
      }
    } catch (err) {
      setError('Error verifying code');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surf">
      <div className="max-w-sm w-full px-4">
        <h1 className="text-2xl font-bold text-ink mb-4">Enter your code</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-line rounded text-center text-2xl tracking-widest"
            aria-label="MFA code"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
}
