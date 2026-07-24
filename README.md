# SkillSwap — Community Skill Exchange Platform

A full-stack security-focused application for trading skills using a credit-based system instead of money.

## Project Structure

```
skillswap/
├── backend/           # Express.js API server
├── frontend/          # React + Vite frontend
├── docs/             # Documentation and reports
├── docker-compose.yml # Docker orchestration
├── .github/          # GitHub Actions CI/CD
└── .env.example      # Environment template
```

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Auth**: JWT (RS256) + TOTP MFA
- **Password Hashing**: Argon2id
- **Validation**: Zod

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Quick Start with Docker

```bash
# Copy environment template
cp .env.example .env

# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up

# In another terminal, run migrations
docker-compose exec backend npm run migrate
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api/v1
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Local Development Setup

```bash
# Backend setup
cd backend
npm install
cp ../.env.example .env

# Frontend setup
cd ../frontend
npm install
cp ../.env.example .env

# In backend directory, start dev server
npm run dev

# In frontend directory (new terminal), start dev server
npm run dev
```

## Key Features

### Security Controls
- ✅ JWT authentication with refresh token rotation
- ✅ TOTP-based MFA
- ✅ Argon2id password hashing
- ✅ Rate limiting + account lockout + CAPTCHA
- ✅ RBAC with ownership checks (prevents IDOR)
- ✅ Input validation & sanitization
- ✅ CSRF protection via custom headers
- ✅ Encrypted session management
- ✅ Append-only audit logging
- ✅ At-rest & in-transit encryption

### Core Pages

**Public**
- Landing page
- Browse skills
- Skill detail
- Login / MFA / Registration
- Email verification / Password recovery

**Authenticated**
- Dashboard
- My profile
- My skills
- Browse & book flow
- My bookings (as member / provider)
- Wallet & credit ledger
- Notifications
- Account security

**Admin**
- User management
- Dispute resolution
- Audit log viewer

## Development Workflow

### Commits
Minimum 50 commits required, structured as:
1. Setup & scaffolding (6 commits)
2. Core features (14 commits)
3. Security hardening (16 commits)
4. Bug & vulnerability fixes (10 commits)
5. Testing, docs & CI (6 commits)

Commit format: plain, imperative, no prefixes
```
✓ good: add password strength meter
✗ bad: feat: add password validation
```

### Running Tests

```bash
# Backend
cd backend
npm run test
npm run test:unit
npm run test:integration

# Frontend
cd frontend
npm run lint
```

### Linting & Formatting

```bash
# Backend
npm run lint
npm run lint:fix
npm run format

# Frontend
npm run lint
npm run lint:fix
npm run format
```

## Database

### Migrations
```bash
npm run migrate
```

### Seeding (optional)
```bash
npm run seed
```

## API Documentation

Full endpoint documentation available in the spec files:
- Backend: See `backend/migrations/001_initial_schema.sql`
- Endpoints: Check code comments in `backend/src/routes/`

Base URL: `/api/v1`

### Authentication Headers
```
Authorization: Bearer <access_token>
X-Requested-With: XMLHttpRequest  (for CSRF on state-changing requests)
```

## Security Testing

Run internal penetration test:
```bash
npm run test
```

Pentest report: `docs/pentest-report.md`

## Accessibility

Tested against WCAG 2.1 AA standards:
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus indicators
- Motion preferences

See `ACCESSIBILITY.md` for testing details.

## Contributing

- Follow the commit message format (no prefixes)
- Each commit should be a single, reviewable change
- Write tests for new features
- Update documentation

## License

MIT

## Support

For issues and questions, refer to the documentation in `/docs`.
