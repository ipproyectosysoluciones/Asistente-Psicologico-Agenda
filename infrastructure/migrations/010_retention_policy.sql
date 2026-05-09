-- Migration 010: add retention_years to psychologists (tenant-level config)
-- Idempotent: safe to re-run via ADD COLUMN IF NOT EXISTS.
-- Default 5 years applies to all pre-existing rows automatically.
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS retention_years INTEGER NOT NULL DEFAULT 5;
