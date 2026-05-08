-- Migration 009: audit_log table + triggers on patients and appointments
-- Idempotent: safe to re-run (uses IF NOT EXISTS and DROP TRIGGER IF EXISTS guards).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- audit_log table
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name    VARCHAR(50)  NOT NULL,
  record_id     UUID         NOT NULL,
  operation     VARCHAR(10)  NOT NULL,
  changed_by    TEXT,
  changed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  old_data      JSONB,
  new_data      JSONB,
  psychologist_id UUID
);

-- If the table already existed (from init-db.sql which lacks changed_by/changed_at),
-- add the missing columns idempotently so the trigger function does not fail.
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS changed_by TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_audit_log_record     ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- ============================================================
-- Trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    record_id,
    operation,
    changed_by,
    old_data,
    new_data,
    psychologist_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    current_setting('app.current_user', true),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END,
    COALESCE(
      CASE WHEN TG_OP != 'DELETE' THEN
        CASE WHEN TG_TABLE_NAME = 'patients' THEN (NEW).psychologist_id ELSE NULL END
      END,
      CASE WHEN TG_TABLE_NAME = 'patients' THEN (OLD).psychologist_id ELSE NULL END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Triggers on patients
-- ============================================================
DROP TRIGGER IF EXISTS audit_patients ON patients;
CREATE TRIGGER audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- ============================================================
-- Triggers on appointments
-- ============================================================
DROP TRIGGER IF EXISTS audit_appointments ON appointments;
CREATE TRIGGER audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- ============================================================
-- Admin role seed (idempotent)
-- Ensures at least one admin row exists before RBAC endpoints
-- are exercised. Safe to re-run: only updates if role is not
-- already 'admin'.
-- ============================================================
UPDATE psychologists
  SET role = 'admin'
  WHERE email = 'admin@localhost'
    AND (role IS NULL OR role = 'psychologist');
