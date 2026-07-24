import type { JwtPayload } from '../domain/auth';

export function parseJwt(token: string | null): JwtPayload | null {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(
      decodeURIComponent(
        decodedPayload
          .split('')
          .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join(''),
      ),
    ) as JwtPayload;
  } catch {
    return null;
  }
}
