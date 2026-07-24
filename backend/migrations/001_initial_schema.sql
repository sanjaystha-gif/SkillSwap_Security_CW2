-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(60) NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret_enc TEXT,
  failed_login_count INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Profile table
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url TEXT,
  area_general VARCHAR(80),
  is_public BOOLEAN DEFAULT TRUE,
  credit_balance INTEGER DEFAULT 0,
  trust_score NUMERIC(4, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Password history table
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),
  direction VARCHAR(20) CHECK (direction IN ('offered', 'wanted')),
  level VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, skill_id, direction),
  INDEX idx_user_id (user_id),
  INDEX idx_skill_id (skill_id)
);

-- Swaps table
CREATE TABLE IF NOT EXISTS swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  offered_skill_id UUID NOT NULL REFERENCES skills(id),
  requested_skill_id UUID NOT NULL REFERENCES skills(id),
  credit_amount INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'in_progress', 'completed', 'disputed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  proposer_confirmed BOOLEAN DEFAULT FALSE,
  recipient_confirmed BOOLEAN DEFAULT FALSE,
  record_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_proposer_id (proposer_id),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_status (status)
);

-- Swap status history table
CREATE TABLE IF NOT EXISTS swap_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_id UUID NOT NULL REFERENCES swaps(id),
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_swap_id (swap_id)
);

-- Credit ledger table
CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swap_id UUID REFERENCES swaps(id),
  delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_swap_id (swap_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent_hash VARCHAR(64),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- MFA backup codes table
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(64) NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_id UUID NOT NULL REFERENCES swaps(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  body_enc TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_swap_id (swap_id),
  INDEX idx_sender_id (sender_id)
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_id UUID NOT NULL UNIQUE REFERENCES swaps(id),
  raised_by UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  resolved_by UUID REFERENCES users(id),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_swap_id (swap_id),
  INDEX idx_status (status)
);

-- Audit log table - append-only
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  actor_role VARCHAR(20),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address VARCHAR(45),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_actor_id (actor_id),
  INDEX idx_resource_id (resource_id),
  INDEX idx_created_at (created_at)
);

-- Rate limit events table
CREATE TABLE IF NOT EXISTS rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45),
  user_id UUID REFERENCES users(id),
  endpoint VARCHAR(255),
  occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip (ip_address),
  INDEX idx_occurred_at (occurred_at)
);

-- Data export requests
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  download_token UUID UNIQUE,
  INDEX idx_user_id (user_id)
);

-- Ensure append-only audit log - no update/delete permissions in production
-- (This should be enforced at the database role level in production)
