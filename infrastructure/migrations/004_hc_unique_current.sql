-- Sprint 5: enforce at most one is_current=true record per patient on HC tables
-- Safe to run multiple times (CREATE UNIQUE INDEX IF NOT EXISTS)

CREATE UNIQUE INDEX IF NOT EXISTS uniq_demographics_patient_current
  ON demographics (patient_id) WHERE is_current = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_chief_complaint_patient_current
  ON chief_complaint (patient_id) WHERE is_current = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_personal_history_patient_current
  ON personal_history (patient_id) WHERE is_current = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_diagnosis_patient_current
  ON diagnosis (patient_id) WHERE is_current = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_treatment_plan_patient_current
  ON treatment_plan (patient_id) WHERE is_current = true;
