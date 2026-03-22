-- Migration: Add performance and security indexes
-- These indexes are required for efficient session lookups and prevent
-- full-table scans that could degrade under load (potential DoS vector).

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"("userId");

-- Account indexes
CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"("userId");

-- Verification index (for fast forgot-password token lookups)
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"("identifier");
