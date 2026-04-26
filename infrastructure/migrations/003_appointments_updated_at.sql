-- Migration: 003_appointments_updated_at
-- Adds updated_at column required for soft-cancel timestamp.
-- Agrega la columna updated_at requerida para la marca de tiempo de cancelación suave.
--
-- Uses ADD COLUMN IF NOT EXISTS so the migration is idempotent and safe to re-run.
-- Usa IF NOT EXISTS para que la migración sea idempotente y segura de re-ejecutar.

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
