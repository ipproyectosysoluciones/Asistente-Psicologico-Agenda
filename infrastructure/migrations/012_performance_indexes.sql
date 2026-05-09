-- Migration 012: Composite indexes for common query patterns (Task 5.15).
-- All idempotent via CREATE INDEX IF NOT EXISTS.

-- Appointments: schedule view (most common query — psychologist agenda by date range)
CREATE INDEX IF NOT EXISTS idx_appointments_psychologist_scheduled
  ON appointments(psychologist_id, scheduled_at)
  WHERE deleted_at IS NULL;

-- Appointments: dashboard stats by status
CREATE INDEX IF NOT EXISTS idx_appointments_status_psychologist
  ON appointments(status, psychologist_id)
  WHERE deleted_at IS NULL;

-- Appointments: patient timeline (clinical history context)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_scheduled
  ON appointments(patient_id, scheduled_at)
  WHERE deleted_at IS NULL;

-- Patients: active patient list per psychologist (most common CRUD query)
CREATE INDEX IF NOT EXISTS idx_patients_psychologist_active
  ON patients(psychologist_id, last_appointment_at DESC NULLS LAST)
  WHERE deleted_at IS NULL;

-- Audit log: per-psychologist audit trail with date range filter
CREATE INDEX IF NOT EXISTS idx_audit_log_psychologist_created
  ON audit_log(psychologist_id, created_at DESC);

-- HC tables: is_current filter (retention CRON + clinical history reads)
CREATE INDEX IF NOT EXISTS idx_demographics_patient_current
  ON demographics(patient_id) WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_chief_complaint_patient_current
  ON chief_complaint(patient_id) WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_diagnosis_patient_current
  ON diagnosis(patient_id) WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_treatment_plan_patient_current
  ON treatment_plan(patient_id) WHERE is_current = TRUE;

-- Leads: active leads by psychologist (CRM queries)
CREATE INDEX IF NOT EXISTS idx_leads_psychologist_status
  ON leads(psychologist_id, status)
  WHERE deleted_at IS NULL;
