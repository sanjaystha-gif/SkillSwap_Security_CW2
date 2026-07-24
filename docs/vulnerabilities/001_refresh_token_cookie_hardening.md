# Vulnerability 001: Insufficient Refresh Token Cookie Protection

- Category: Session Management / Authentication
- CVSS v3.1 Base Score: 6.5 (Medium)
- Affected component: `backend/src/controllers/authController.js`

## Description
Refresh tokens were previously issued directly in the API response body. This made them vulnerable to theft by malicious client-side scripts or cross-site scripting attacks when stored in browser-accessible storage.

## Impact
An attacker who can execute JavaScript in the user’s browser could extract the refresh token, obtain a new access token, and maintain a persistent session.

## Exploitation path
1. Attacker exploits an XSS vulnerability in the frontend.
2. JavaScript reads the refresh token from application storage or a response body.
3. Attacker sends it to their own server and uses it to request a new access token.

## Evidence
- Code path: `backend/src/controllers/authController.js`
- Fix: refresh token is now set with `httpOnly: true`, `secure`, `sameSite: 'lax'`, and scoped to `/api/v1/auth/refresh`.

## Remediation
- Store refresh tokens only in HTTP-only cookies.
- Avoid sending refresh tokens in JSON responses.
- Restrict cookie path and use `secure` flag in production.

## Fix confirmation
- Updated `authController.login()` to set the refresh token cookie instead of returning it in JSON.
- Updated `authController.refreshToken()` to rotate the refresh token and issue the new token as an HTTP-only cookie.

## Retest notes
- Verified the refresh token is no longer returned in the JSON payload.
- Verified the `refresh_token` cookie is set with `HttpOnly` and `SameSite=Lax` in the login flow.
