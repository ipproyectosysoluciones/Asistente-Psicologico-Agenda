-- ============================================================
-- Asistente Psicológico - PostgreSQL Schema
-- Historia Clínica según APA/DSM-5 (14 secciones)
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: psychologists (Multi-tenant)
-- ============================================================
CREATE TABLE psychologists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    professional_license VARCHAR(100),
    license_country VARCHAR(2) DEFAULT 'MX',
    specialties TEXT[] DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    
    -- Rates
    rate_currency VARCHAR(3) DEFAULT 'USD',
    rate_first_session INT DEFAULT 60,
    rate_followup INT DEFAULT 45,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: patients
-- ============================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    
    -- Identification
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Demographics
    date_of_birth DATE,
    gender VARCHAR(20),
    country VARCHAR(2) DEFAULT 'MX',
    occupation VARCHAR(255),
    marital_status VARCHAR(50),
    education_level VARCHAR(100),
    
    -- Compliance
    consent_status VARCHAR(50) DEFAULT 'pending',
    data_retention_country VARCHAR(2) DEFAULT 'MX',
    
    -- Tracking
    first_appointment_at TIMESTAMP,
    last_appointment_at TIMESTAMP,
    total_sessions INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_patient_per_psychologist UNIQUE (psychologist_id, email)
);

CREATE INDEX idx_patients_psychologist ON patients(psychologist_id);
CREATE INDEX idx_patients_deleted ON patients(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: appointments
-- ============================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Scheduling
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 50,
    appointment_type VARCHAR(50) NOT NULL DEFAULT 'seguimiento',
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',
    -- Values: 'scheduled' | 'confirmed' | 'completed' | 'no_show' | 'cancelled'
    
    -- Google Calendar integration
    google_calendar_event_id VARCHAR(255),
    google_meet_link VARCHAR(500),
    
    -- Notes reference
    session_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);

-- ============================================================
-- CLINICAL HISTORY TABLES (14 Sections - APA/DSM-5)
-- ============================================================

-- Section 1: Demographics (Datos de Identificación)
CREATE TABLE demographics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    occupation VARCHAR(255),
    marital_status VARCHAR(50),
    number_of_children INT,
    education_level VARCHAR(100),
    religion VARCHAR(100),
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 2: Chief Complaint (Motivo de Consulta)
CREATE TABLE chief_complaint (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    complaint_text TEXT NOT NULL,
    symptom_duration VARCHAR(255),
    symptom_onset TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 3: Personal History (Antecedentes Personales)
CREATE TABLE personal_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Medical
    medical_conditions TEXT,
    surgeries TEXT,
    current_medications TEXT,
    allergies TEXT,
    
    -- Psychiatric
    previous_psychiatric_treatment BOOLEAN,
    previous_hospitalization BOOLEAN,
    psychiatric_treatment_details TEXT,
    
    -- Substance use
    alcohol_use VARCHAR(50),
    tobacco_use VARCHAR(50),
    drug_use VARCHAR(50),
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 4: Family History (Antecedentes Familiares)
CREATE TABLE family_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    family_composition TEXT,
    family_psychiatric_illness TEXT,
    family_medical_conditions TEXT,
    family_substance_abuse BOOLEAN,
    family_suicide_history BOOLEAN,
    parental_relationship TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 5: Developmental History (Historia del Desarrollo)
CREATE TABLE developmental_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    pregnancy_complications BOOLEAN,
    birth_complications BOOLEAN,
    developmental_milestones TEXT,
    childhood_traumas TEXT,
    school_performance TEXT,
    significant_life_events TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 6: Psychological Evaluation (Evaluación Psicológica)
CREATE TABLE psychological_evaluation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    appearance TEXT,
    mood TEXT,
    speech TEXT,
    thought_process TEXT,
    thought_content TEXT,
    
    intellect_level VARCHAR(50),
    insight VARCHAR(100),
    judgment VARCHAR(100),
    tests_administered TEXT,
    evaluation_results TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 7: Diagnosis (Diagnóstico DSM-5/CIE-11)
CREATE TABLE diagnosis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    primary_diagnosis_code VARCHAR(20),
    primary_diagnosis_name VARCHAR(255),
    diagnosis_description TEXT,
    comorbid_diagnoses TEXT,
    severity VARCHAR(50),
    diagnostic_impression TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 8: Treatment Plan (Plan de Tratamiento)
CREATE TABLE treatment_plan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    short_term_goals TEXT,
    long_term_goals TEXT,
    therapy_modality VARCHAR(100),
    planned_duration_weeks INT,
    estimated_sessions INT,
    session_frequency VARCHAR(100),
    interventions TEXT,
    referrals TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 9: Session Notes (Notas de Sesión) - stored in appointments already

-- Section 10: Consent (Consentimiento Informado)
CREATE TABLE consentimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    country_normative VARCHAR(10),
    consent_type VARCHAR(50),
    consent_text TEXT,
    signed_at TIMESTAMP,
    ip_address VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 11: Mental Status Exam (Examen Mental)
CREATE TABLE mental_status_exam (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    appearance TEXT,
    behavior TEXT,
    speech TEXT,
    mood TEXT,
    affect TEXT,
    thought_process TEXT,
    thought_content TEXT,
    perception TEXT,
    cognition TEXT,
    insight TEXT,
    judgment TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 12: Social Profile (Perfil Social)
CREATE TABLE social_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    living_situation TEXT,
    employment_status VARCHAR(100),
    social_support TEXT,
    relationships TEXT,
    hobbies TEXT,
    stressors TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 13: Personality (Personalidad)
CREATE TABLE personality_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    temperament TEXT,
    character_traits TEXT,
    coping_mechanisms TEXT,
    defense_mechanisms TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section 14: Clinical Impression (Impresión Clínica)
CREATE TABLE clinical_impression (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    summary TEXT,
    formulation TEXT,
    Prognosis TEXT,
    recommendations TEXT,
    
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: audit_log
-- ============================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    psychologist_id UUID REFERENCES psychologists(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- TABLE: settings (Configuración)
-- ============================================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID UNIQUE REFERENCES psychologists(id) ON DELETE CASCADE,
    
    -- Schedule
    working_days TEXT[] DEFAULT ARRAY['2','3','4','5','6','7'],
    start_time TIME DEFAULT '09:00',
    end_time TIME DEFAULT '18:00',
    lunch_start TIME DEFAULT '12:00',
    lunch_end TIME DEFAULT '13:00',
    
    -- Durations
    first_session_duration INT DEFAULT 90,
    followup_duration INT DEFAULT 50,
    
    -- Reminders
    reminder_24h_enabled BOOLEAN DEFAULT true,
    reminder_1h_enabled BOOLEAN DEFAULT true,
    
    -- Google
    google_calendar_id VARCHAR(255),
    google_sheet_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for psychologists
CREATE TRIGGER trigger_psychologists_updated
    BEFORE UPDATE ON psychologists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for patients
CREATE TRIGGER trigger_patients_updated
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for appointments
CREATE TRIGGER trigger_appointments_updated
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DEFAULT PSYCHOLOGIST (change password!)
-- ============================================================
INSERT INTO psychologists (email, password_hash, full_name, professional_license, license_country)
VALUES (
    'admin@localhost',
    crypt('admin123', gen_salt('bf')),
    'Dr. Administrador',
    'PSY-001',
    'MX'
);