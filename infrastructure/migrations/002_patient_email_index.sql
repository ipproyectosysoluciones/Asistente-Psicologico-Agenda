-- Migration: 002_patient_email_index
-- Speeds up cancellation flow email lookup (getUpcomingAppointmentsByEmail).
-- The query joins appointments → patients via patient_id and filters on patients.email,
-- so the index belongs on patients, not appointments.

CREATE INDEX IF NOT EXISTS idx_patients_email
  ON patients (email)
  WHERE deleted_at IS NULL;
