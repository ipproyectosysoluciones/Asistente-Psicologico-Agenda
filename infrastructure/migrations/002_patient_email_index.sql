-- Migration: 002_patient_email_index
-- Speeds up cancellation flow email lookup.
-- Acelera la búsqueda por email en el flujo de cancelación.
--
-- Without this index, every cancellation request performs a full table scan
-- on appointments. With ~thousands of rows this becomes noticeably slow.
-- Sin este índice, cada cancelación hace un full table scan.

CREATE INDEX IF NOT EXISTS idx_appointments_patient_email
  ON appointments (patient_email);
