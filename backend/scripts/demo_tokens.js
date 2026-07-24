import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/utils/jwt.js';

async function main() {
  const devKey = process.env.JWT_SECRET || 'dev_secret_for_local_testing';
  // jwt.js falls back to JWT_SECRET when keys not provided, so ensure env is set for clarity
  if (!process.env.JWT_SECRET && !process.env.JWT_PRIVATE_KEY) {
    console.warn('No JWT_SECRET/JWT_PRIVATE_KEY found — using in-script dev secret (local only)');
    process.env.JWT_SECRET = devKey;
  }

  const userPayload = { sub: 42, uid: 42 };

  const access = signAccessToken(userPayload);
  const refresh = signRefreshToken({ sid: 'demo-session-1', uid: userPayload.uid });

  console.log('Access Token:' , access);
  console.log('\nRefresh Token:', refresh);

  // Verify tokens
  try {
    const a = verifyAccessToken(access);
    console.log('\nVerified access payload:', a);
  } catch (e) {
    console.error('Access token verify failed:', e.message);
  }

  try {
    const r = verifyRefreshToken(refresh);
    console.log('\nVerified refresh payload:', r);
  } catch (e) {
    console.error('Refresh token verify failed:', e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
