-- Migration 014: triage assessments table for PHQ-9 results
-- Sprint W21 — AI Layer

CREATE TABLE IF NOT EXISTS triage_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    psychologist_id UUID REFERENCES psychologists(id) ON DELETE SET NULL,
    phone VARCHAR(50) NOT NULL,
    phq9_responses JSONB NOT NULL DEFAULT '[]',
    phq9_score INT NOT NULL CHECK (phq9_score >= 0 AND phq9_score <= 27),
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('minimal', 'mild', 'moderate', 'severe')),
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS triage_assessments_patient_idx
    ON triage_assessments (patient_id);

CREATE INDEX IF NOT EXISTS triage_assessments_phone_idx
    ON triage_assessments (phone);

CREATE INDEX IF NOT EXISTS triage_assessments_created_at_idx
    ON triage_assessments (created_at DESC);
