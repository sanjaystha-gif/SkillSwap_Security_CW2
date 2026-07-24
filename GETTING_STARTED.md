# SkillSwap Project — Getting Started Guide

## Project Setup Complete ✅

Your SkillSwap project structure is fully scaffolded. Here's how to proceed systematically.

---

## Step 1: Initialize Git & First Commits

```bash
# Navigate to project root
cd c:\Users\nitro v16\Desktop\SkillSwap_Security_CW2

# Initialize git
git init
git remote add origin https://github.com/sanjaystha-gif/SkillSwap_Security_CW2.git

# Configure git (if needed)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Make your first commits (Commits 1-6 - Setup Phase)
Each commit should be atomic and reviewable:

```bash
# Commit 1: Initialize project structure and dependencies
git add -A
git commit -m "init project structure"

# Commit 2: Add Docker dependencies
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile
git commit -m "add docker compose for local dev"

# Commit 3: Add database schema
git add backend/migrations/
git commit -m "add postgres schema migration"

# Commit 4: Create Express server skeleton
git add backend/src/server.js backend/src/config/
git commit -m "add express server skeleton"

# Commit 5: Add environment configuration
git add .env.example backend/.env backend/.prettierrc.json
git commit -m "add environment config loading"

# Commit 6: Add linting and formatting
git add backend/.eslintrc.json frontend/.eslintrc.json .prettierrc.json
git commit -m "add eslint and prettier config"

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## Step 3: Set Up Local Environment

```bash
# Copy environment template (and modify if needed for local dev)
cp .env.example .env

# Backend only - set JWT keys (generate or use test keys)
# For development, you can generate with:
# node backend/scripts/generate-keys.js (if created later)
```

---

## Step 4: Verify Docker Setup Works

```bash
# From project root
docker-compose up

# Should start: PostgreSQL, Redis, placeholder services
# Press Ctrl+C to stop
```

---

## Step 5: Start Building Features

Follow the commit structure below. **Each commit is one small change.**

### Phase 2: Core Features (Commits 7-20) 

#### Authentication & Auth Routes (Commits 7-10)

**Commit 7: Register route + email verification**
- Create `backend/src/routes/auth.js`
- POST `/auth/register` endpoint
- Email uniqueness validation
- Response: `{ user_id, message }`
- Commit: `git commit -m "add user registration route"`

**Commit 8: Login route (step 1)**
- POST `/auth/login` endpoint
- Email + password validation
- Response: either `{ access_token, refresh_token }` or `{ mfa_required, challenge_id }`
- Commit: `git commit -m "add login route"`

**Commit 9: MFA verification route**
- POST `/auth/login/mfa` endpoint
- TOTP code verification against challenge token
- Commit: `git commit -m "add mfa verify route"`

**Commit 10: Logout + refresh token route**
- POST `/auth/logout` - revoke session
- POST `/auth/refresh` - refresh access token
- Commit: `git commit -m "add logout and refresh routes"`

#### Users/Profiles (Commits 11-14)

**Commit 11: GET /users/me - own profile**
```bash
git commit -m "add get own profile endpoint"
```

**Commit 12: PATCH /users/me - update profile**
- Allow-listed fields only: display_name, bio, avatar_url, area_general, is_public
- Commit: `git commit -m "add profile update endpoint"`

**Commit 13: GET /users/:id - public profile view**
- Read-only view, respects is_public flag
- Commit: `git commit -m "add public profile view"`

**Commit 14: Delete account + data export**
- POST /users/me/export and DELETE /users/me
- Commit: `git commit -m "add profile export and delete routes"`

#### Skills (Commits 15-17)

**Commit 15: Browse skills (GET /skills)**
- Paginated, filterable by category
- Commit: `git commit -m "add browse skills endpoint"`

**Commit 16: Skill detail (GET /skills/:id)**
- Commit: `git commit -m "add skill detail endpoint"`

**Commit 17: Create/Edit/Delete skills (user's own)**
- POST / PATCH / DELETE
- Commit: `git commit -m "add create edit delete skill routes"`

#### Swaps & Credits (Commits 18-20)

**Commit 18: Create swap (POST /swaps)**
- Propose a skill swap
- Commit: `git commit -m "add swap creation route"`

**Commit 19: Swap status transitions**
- PATCH /swaps/:id/{accept,start,confirm,cancel}
- Commit: `git commit -m "add swap status transition routes"`

**Commit 20: Credits ledger endpoint**
- GET /credits/me/balance
- GET /credits/me/history
- Commit: `git commit -m "add credits ledger endpoints"`

### Phase 3: Security Hardening (Commits 21-36)

After core features work, layer in security controls:

**Commit 21: Hash passwords with Argon2id**
- Implement in registration and password change
- Commit: `git commit -m "hash passwords with argon2"`

**Commit 22: Add password strength validation**
- Use zxcvbn for real-time strength meter
- Deny weak passwords on registration
- Commit: `git commit -m "add password strength validation"`

**Commit 23-24: MFA setup/disable routes**
```bash
git commit -m "add mfa setup route"
git commit -m "add mfa disable route"
```

**Commit 25: Add login rate limiting**
- Use `express-rate-limit` with Redis store
- 10 requests/min per IP, 5 fails/account per 15 min
- Commit: `git commit -m "add login rate limiting"`

**Commit 26: Add account lockout**
- Track failed login attempts
- Lock account after N failures for 15 minutes
- Commit: `git commit -m "add account lockout after failed attempts"`

**Commit 27: Add CAPTCHA gate**
- hCaptcha/Cloudflare Turnstile after 3 failures
- Commit: `git commit -m "add captcha after repeated login failures"`

**Commits 28-31: Add ownership checks & RBAC guards**
- Middleware for resource ownership validation
- Prevent IDOR by checking ownership before any resource action
- Commit messages:
  - `git commit -m "restrict profile update to allowed fields"`
  - `git commit -m "add ownership check to skill edit route"`
  - `git commit -m "add ownership check to booking routes"`
  - (one more for swaps if needed)

**Commit 32: Wrap swap confirm in transaction**
- Use PostgreSQL FOR UPDATE lock on swaps
- Atomic ledger write
- Commit: `git commit -m "wrap booking creation in db transaction"`

**Commit 33: Fix credit balance race condition**
- Denormalized balance cache with proper locking
- Commit: `git commit -m "add row lock to prevent balance race condition"`

**Commit 34: Set secure cookie flags**
- HttpOnly, Secure, SameSite=Strict on refresh token cookie
- Commit: `git commit -m "set httponly and samesite cookie flags"`

**Commit 35: Add CSRF header validation**
- Check X-Requested-With custom header on state-changing requests
- Commit: `git commit -m "add csrf header check on state changing routes"`

**Commit 36: Add audit logging**
- Log all sensitive actions to append-only audit_log table
- Commit: `git commit -m "add audit log for admin actions"`

### Phase 4: Bug & Vulnerability Fixes (Commits 37-46)

During your pentest phase, document findings and fixes:

**Commits 37-46: One fix per commit**
Format: `git commit -m "fix [vulnerability type] [location]"`

Examples:
```bash
git commit -m "fix idor on booking detail route"
git commit -m "fix mass assignment on profile update"
git commit -m "fix missing auth check on admin routes"
git commit -m "fix session not revoked on password change"
git commit -m "fix credit balance race condition"
git commit -m "fix verbose error leaking stack trace"
git commit -m "fix missing rate limit on password reset"
git commit -m "fix xss in skill description field"
git commit -m "fix open redirect on login return url"
git commit -m "fix weak session expiry on refresh token"
```

### Phase 5: Testing, Docs, CI (Commits 47-52)

```bash
git commit -m "add unit tests for auth routes"
git commit -m "add integration tests for booking flow"
git commit -m "add github actions workflow"
git commit -m "add dependency audit step to pipeline"
git commit -m "add readme with setup instructions"
git commit -m "add pentest report to docs folder"
```

---

## Development Workflow

### Working on a feature:

```bash
# You're typically on main for a coursework project
# Make your change:
# - Edit files
# - Test locally
# - Run linting

npm run lint
npm run lint:fix

# Commit atomically:
git add <changed-files>
git commit -m "description"

# Push when ready:
git push origin main
```

### Testing changes locally:

**Backend:**
```bash
cd backend
npm run dev        # Watch mode with nodemon
# In another terminal:
npm run test
```

**Frontend:**
```bash
cd frontend
npm run dev        # Vite dev server at 5173
```

Or use Docker:
```bash
docker-compose up  # All services at once
```

---

## Key Security Implementation Notes

### Authentication Flow
1. POST /auth/register → verify email
2. GET /verify-email?token=… → confirms email
3. POST /auth/login → validate credentials, initiate MFA if enabled
4. POST /auth/login/mfa → verify  code, issue tokens
5. Access token (15min) + refresh token (7 days, HttpOnly cookie)

### Token Structure (JWT RS256)
```
Header: { alg: "RS256", typ: "JWT" }
Payload: { sub: user_id, role, sess: session_id, iat, exp }
```

Only the auth service signs (private key). Resource servers only verify (public key).

### Database Integrity
- Credit ledger is **append-only** — no updates or deletes
- Swap completion inside a transaction with row lock
- Status transitions validated server-side in state machine
- Ownership checks run before any data serialization

### Rate Limiting
- Per-IP and per-account counters in Redis
- Sliding window: 60s window, max concurrent requests
- Different limits per route group (login stricter than general)
- CAPTCHA required when threshold crossed

---

## Next Immediate Steps

1. **Initialize Git** (if not done)
   ```bash
   cd c:\Users\nitro v16\Desktop\SkillSwap_Security_CW2
   git init
   git add -A
   git commit -m "init project structure"
   ```

2. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Test Docker**
   ```bash
   docker-compose up  # Should start all services
   # Ctrl+C when ready
   ```

4. **Start with Commit 7: Register Route**
   - Edit `backend/src/routes/auth.js`
   - Implement POST /auth/register
   - Connect database
   - Make commit

---

## Documentation to Keep Updated

- **README.md** — Gets current list of features
- **ACCESSIBILITY.md** — Log testing as you go
- **docs/pentest-report.md** — Fill with findings (start in Phase 4)

---

## Debugging Tips

### "Module not found" errors in backend
```bash
# Make sure ES6 imports work with package.json type: "module"
# Use .js file extensions in import statements
import express from 'express'; // ✓
import express from 'express/index'; // ✗ (missing .js)
```

### "Cannot connect to database" when using Docker
```bash
# Wait for postgres to be healthy:
docker-compose up postgres
# When "PostgreSQL init complete", Ctrl+C and bring up all:
docker-compose up
```

### Frontend not loading at 5173
```bash
# Check it's not behind another process
lsof -i :5173
# Windows:
netstat -ano | findstr :5173
```

---

## Success Criteria

- ✅ 50+ meaningful commits in git log
- ✅ All commits follow "imperative, no prefixes" format
- ✅ Project builds and runs with `docker-compose up`
- ✅ Security controls incrementally visible in commit history
- ✅ Fixes tied to identified vulnerabilities
- ✅ Tests passing in CI
- ✅ Accessibility tested and documented
- ✅ Pentest report completed with CVSS scores

---

**Start with Git initialization and the first backend controller. You've got the scaffold — now build the features!**

Questions? Check the original spec files:
- Frontend: Open the attached `SkillSwap_Full_Project_Prompt.md`
- Backend: Open the attached HTML specification

Good lucky! 🚀
