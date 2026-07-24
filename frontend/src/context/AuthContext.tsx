import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, refreshSession, signOut } from '../usecases/authUseCases';
import { parseJwt } from '../utils/jwt';
import type { AuthResponse, JwtPayload } from '../domain/auth';

interface AuthContextType {
  accessToken: string | null;
  user: JwtPayload | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setError: (value: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const response = await refreshSession();
        if (response?.access_token) {
          setAccessToken(response.access_token);
          setUser(parseJwt(response.access_token));
        }
      } catch (err) {
        // Refresh may fail if there is no active session.
      } finally {
        setLoading(false);
      }
    }

    bootstrapAuth();
  }, []);

  async function login(email: string, password: string): Promise<AuthResponse> {
    setError(null);
    try {
      const response = await loginUser({ email, password });
      if (response?.access_token) {
        setAccessToken(response.access_token);
        setUser(parseJwt(response.access_token));
      }
      return response;
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError.message ?? 'Login failed');
      throw err;
    }
  }

  async function logout(): Promise<void> {
    try {
      await signOut();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      accessToken,
      user,
      loading,
      error,
      login,
      logout,
      setError,
      isAuthenticated: Boolean(accessToken),
    }),
    [accessToken, user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
