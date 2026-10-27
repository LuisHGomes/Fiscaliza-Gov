-- Migration: Add sessions table and MFA fields to usuarios table
-- Date: 2026-10-27

-- 1. Add new columns to usuarios table
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS mfa_ativo TEXT DEFAULT 'false';

-- 2. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_em TIMESTAMP NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    ativo TEXT DEFAULT 'true'
);

-- 3. Create index for session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_usuario ON sessions(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expiracao ON sessions(expires_em);

-- 4. Create function to update session timestamp
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create trigger for sessions table
DROP TRIGGER IF EXISTS trg_update_sessions_updated_at ON sessions;
CREATE TRIGGER trg_update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_updated_at();
