-- Migration: 007_fix_appointment_unique_index
-- Replaces the unique index that incorrectly referenced start_time (non-existent column)
-- with one that uses the correct column: scheduled_at.

DROP INDEX IF EXISTS idx_appointments_no_double_booking;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_booking
  ON appointments (psychologist_id, scheduled_at)
  WHERE status <> 'cancelled';
