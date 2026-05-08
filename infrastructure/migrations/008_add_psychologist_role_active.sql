-- Migration 008: Add role and is_active columns to psychologists
-- Idempotent: safe to re-run (uses IF NOT EXISTS guards).
-- NOTE: was planned as 007 in Sprint 7a spec, but 007 was already taken by
--       007_fix_appointment_unique_index. Renumbered to 008.

ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS role      VARCHAR(20) NOT NULL DEFAULT 'psychologist',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN     NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_psychologists_role
  ON psychologists(role);
