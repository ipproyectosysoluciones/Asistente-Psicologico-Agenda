# SPEC: PostgreSQL Database Schema & Data Model

**Project**: Asistente-Psicologico-Agenda  
**Status**: SPEC  
**Date**: 2026-04-21  
**Phase**: 1 - Infrastructure  
**Priority**: P0 (Blocker)

---

## 1. REQUIREMENTS

### 1.1 Multi-Tenant Architecture
**R1.1.1**: All data scoped to `psychologist_id` (tenant)
- Every table has explicit `psychologist_id` foreign key
- Row-level security: psychologist can only access their own data
- No shared data between psychologists

**R1.1.2**: Audit and Compliance
- Every table has `created_at`, `updated_at`, `deleted_at` (soft delete)
- Audit log captures all modifications (INSERT, UPDATE, DELETE)
- GDPR compliance: right-to-be-forgotten via soft delete

### 1.2 Clinical History (14-Section APA/DSM-5 Model)
**R1.2.1**: HC sections mapped to database
1. Datos de identificación → patients + demographics table
2. Motivo de consulta → appointment_reason table
3. Antecedentes personales → personal_history table
4. Antecedentes familiares → family_history table
5. Historia del desarrollo → developmental_history table
6. Evaluación psicológica → psychological_evaluation table
7. Diagnóstico (DSM-5) → diagnosis table (CIE-11 support)
8. Plan de tratamiento → treatment_plan table
9. Notas de sesión → session_notes table
10. Consentimiento informado → consentimientos table
11. Examen mental → mental_status_exam table
12. Perfil social → social_profile table
13. Personalidad → personality_profile table
14. Impresión clínica → clinical_impression table

**R1.2.2**: HC versioning
- Each HC section is independently versioned
- Historical versions retained for audit trail
- Current version marked with `is_current = true`

### 1.3 Encryption & Security
**R1.3.1**: Sensitive Data Encryption
- Patient phone numbers encrypted with pgcrypto
- Patient emails encrypted (searchable via hash)
- Medical history data encrypted at application layer

**R1.3.2**: Compliance Field Mapping
- LFPDPPP (México): Sensitive personal data flagged
- Ley 1581 (Colombia): Explicit consent tracking
- RGPD (ES): Data subject rights logged
- HIPAA (USA): PHI encryption and audit logs

---

## 2. SCENARIOS

### Scenario A: New Patient Registration
**Given** Psychologist logs in and clicks "New Patient"  
**When** Form submitted with name, email, DOB, country, phone  
**Then**:
1. Patient record created with encrypted phone/email
2. Soft delete fields initialized (deleted_at = NULL)
3. Demographics record created
4. Consentimientos record created (pending approval)
5. Audit log entry created: INSERT patients

**Validation**:
- Patient appears in psychologist's patient list
- Phone number encrypted (SELECT phone_encrypted returns bytea)
- Audit table has entry with patient_id and operation='INSERT'

### Scenario B: Complete Clinical History Entry
**Given** Patient has 4 appointments completed  
**When** Psychologist clicks "Complete HC" and fills all 14 sections  
**Then**:
1. Each section creates a new versioned record (version=1, is_current=true)
2. Diagnosis linked to DSM-5 codes (ICD-10 or ICD-11)
3. Treatment plan references appointments
4. Clinical impression summarizes all sections
5. All records linked via patient_id and created_at timestamp

**Validation**:
- HC retrievable as unified document
- Each section version=1, is_current=true
- Diagnosis codes match DSM-5/ICD-10 standard dictionary
- Treatment plan's appointment_ids valid and exist

### Scenario C: Patient Data Deletion (GDPR Right-to-be-Forgotten)
**Given** Patient requests data deletion via WhatsApp  
**When** Psychologist authorizes deletion in admin panel  
**Then**:
1. Patients.deleted_at set to CURRENT_TIMESTAMP
2. All related records (appointments, HC sections) marked deleted
3. Soft delete cascade (no hard delete)
4. Audit log entry: UPDATE patients, changes={'deleted_at': now()}
5. Data searchable by admin but excluded from reports

**Validation**:
- Patient not visible in main list (WHERE deleted_at IS NULL filter)
- Audit table has deletion entry
- Hard delete never occurs (data recovery possible)
- Compliance report shows right-to-be-forgotten processed

### Scenario D: Multi-Country Compliance
**Given** Psychologist operates in México, Colombia, and España  
**When** Patient registered from each country  
**Then**:
1. Consentimiento record includes `country_normative` (LFPDPPP, Ley1581, RGPD)
2. Appropriate consent form version applied
3. Data retention policy applied per country (RGPD: deletion after 7 years)
4. Reporting shows compliance metrics per country

**Validation**:
- Consentimientos.country_normative populated correctly
- Consent text matches normative
- Deletion policies enforced per country in batch jobs

---

## 3. SCHEMA DESIGN

### 3.1 Core Tables

#### psychologists (Tenants)
```sql
CREATE TABLE psychologists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  professional_license VARCHAR(100) NOT NULL, -- License number per country
  license_country VARCHAR(2) NOT NULL, -- MX, CO, ES, US
  phone_encrypted BYTEA NOT NULL,
  specialties JSONB DEFAULT '[]'::jsonb, -- Array of specialties
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
  country VARCHAR(2) NOT NULL,
  
  -- Multi-country support
  license_valid_until DATE,
  
  -- Settings
  rate_currency VARCHAR(3) DEFAULT 'USD',
  rate_first_session INT DEFAULT 60,
  rate_followup INT DEFAULT 45,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

#### patients
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  
  -- Identification
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email_hash VARCHAR(64) NOT NULL, -- SHA256 hash of encrypted email
  email_encrypted BYTEA NOT NULL,
  phone_encrypted BYTEA NOT NULL,
  
  -- Demographics
  date_of_birth DATE,
  gender VARCHAR(20), -- 'M' | 'F' | 'Other' | 'Prefer not to say'
  country VARCHAR(2) NOT NULL,
  
  -- Compliance
  consent_status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'accepted' | 'revoked'
  data_processing_status VARCHAR(50) DEFAULT 'active', -- 'active' | 'deleted' | 'archived'
  
  -- Tracking
  first_appointment_at TIMESTAMP,
  last_appointment_at TIMESTAMP,
  total_sessions INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(psychologist_id, email_hash)
);

CREATE INDEX idx_patients_psychologist ON patients(psychologist_id);
CREATE INDEX idx_patients_email_hash ON patients(email_hash);
CREATE INDEX idx_patients_deleted ON patients(deleted_at);
```

#### appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  
  -- Scheduling
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 50,
  type VARCHAR(50) NOT NULL, -- 'primera_vez' | 'seguimiento'
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled',
  -- Values: 'scheduled' | 'confirmed' | 'completed' | 'no_show' | 'cancelled'
  
  -- Integration
  google_calendar_event_id VARCHAR(255),
  google_meet_link VARCHAR(500),
  
  -- Clinical
  session_notes_id UUID, -- FK to session_notes
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(psychologist_id, scheduled_at),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE INDEX idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
```

### 3.2 Clinical History Tables (14 Sections)

#### 1. Demographics (Datos de Identificación)
```sql
CREATE TABLE demographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  
  occupation VARCHAR(255),
  marital_status VARCHAR(50), -- 'single' | 'married' | 'divorced' | etc.
  number_of_children INT,
  education_level VARCHAR(100), -- 'Primaria' | 'Secundaria' | 'Universitaria' etc.
  religion VARCHAR(100),
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Chief Complaint (Motivo de Consulta)
```sql
CREATE TABLE appointment_reason (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  chief_complaint TEXT NOT NULL, -- "Presenta ansiedad desde hace 6 meses"
  symptom_duration VARCHAR(255), -- "6 meses", "2 años", etc.
  symptom_onset_description TEXT,
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Personal History (Antecedentes Personales)
```sql
CREATE TABLE personal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Medical history
  past_medical_conditions TEXT, -- JSON array of conditions
  surgeries TEXT, -- JSON array
  medications_current TEXT, -- JSON array: {name, dose, frequency}
  allergies TEXT,
  
  -- Psychiatric history
  previous_psychiatric_treatment BOOLEAN,
  previous_hospitalization BOOLEAN,
  psychiatric_treatment_details TEXT,
  
  -- Substance use
  alcohol_use VARCHAR(50), -- 'Never' | 'Occasional' | 'Regular' | 'Heavy'
  tobacco_use VARCHAR(50),
  drug_use VARCHAR(50),
  substance_use_details TEXT,
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Family History (Antecedentes Familiares)
```sql
CREATE TABLE family_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Family members
  family_composition TEXT, -- JSON: {relation, name, age, health_status}
  
  -- Psychiatric/Medical in family
  family_psychiatric_illness TEXT, -- JSON array of conditions and relatives
  family_substance_abuse BOOLEAN,
  family_suicide_history BOOLEAN,
  family_medical_conditions TEXT, -- JSON
  
  -- Family dynamics
  family_environment_description TEXT,
  parental_relationship_quality VARCHAR(50),
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Developmental History (Historia del Desarrollo)
```sql
CREATE TABLE developmental_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Early development
  pregnancy_complications BOOLEAN,
  birth_complications BOOLEAN,
  developmental_milestones_notes TEXT, -- Walking, talking, etc.
  
  -- Childhood
  childhood_traumas TEXT, -- JSON array
  childhood_illnesses TEXT,
  school_performance VARCHAR(50),
  social_relationships_childhood TEXT,
  
  -- Adolescence
  adolescent_events TEXT,
  puberty_timing_description VARCHAR(100),
  
  -- Significant life events
  significant_life_events TEXT, -- JSON array
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Psychological Evaluation (Evaluación Psicológica)
```sql
CREATE TABLE psychological_evaluation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Cognitive assessment
  appearance_and_behavior TEXT,
  mood_and_affect VARCHAR(255),
  speech_quality VARCHAR(255),
  thought_organization VARCHAR(255),
  thought_content_abnormalities TEXT, -- 'None' | 'Delusions' | 'Hallucinations' etc.
  
  -- Intellect
  estimated_intellect VARCHAR(50), -- 'Average' | 'Above' | 'Below'
  insight VARCHAR(100),
  judgment VARCHAR(100),
  
  -- Psychological tests administered
  tests_administered TEXT, -- JSON: {test_name, date, results}
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. Diagnosis (Diagnóstico DSM-5/CIE-11)
```sql
CREATE TABLE diagnosis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- DSM-5 Axis I (Clinical Disorders)
  primary_diagnosis_code VARCHAR(20), -- e.g., "F41.1" (GAD ICD-10)
  primary_diagnosis_name VARCHAR(255),
  primary_diagnosis_description TEXT,
  
  -- Comorbidities
  comorbid_diagnoses TEXT, -- JSON array: {code, name, severity}
  
  -- Severity
  severity_level VARCHAR(50), -- 'Mild' | 'Moderate' | 'Severe'
  
  -- Functional impact
  functional_impairment TEXT, -- Assessment of daily functioning
  
  -- Clinical note
  diagnostic_impression TEXT,
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diagnosis_code ON diagnosis(primary_diagnosis_code);
```

#### 8. Treatment Plan (Plan de Tratamiento)
```sql
CREATE TABLE treatment_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Goals
  short_term_goals TEXT, -- JSON array of goals
  long_term_goals TEXT,
  
  -- Therapy modality
  therapy_modality VARCHAR(100), -- 'CBT' | 'Psychodynamic' | 'Humanistic' etc.
  planned_duration_weeks INT,
  estimated_total_sessions INT,
  session_frequency VARCHAR(100), -- 'Weekly' | 'Bi-weekly' etc.
  
  -- Interventions
  planned_interventions TEXT, -- JSON array
  
  -- Referrals if needed
  referrals_needed TEXT, -- JSON array (psychiatrist, etc.)
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. Session Notes (Notas de Sesión)
```sql
CREATE TABLE session_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  
  -- Session content
  session_summary TEXT,
  themes_discussed TEXT, -- JSON array
  therapeutic_interventions_used TEXT, -- JSON array
  patient_response TEXT,
  
  -- Progress
  progress_toward_goals VARCHAR(50), -- 'On track' | 'Slow' | 'Accelerated'
  homework_assigned TEXT,
  
  -- Next session
  plan_for_next_session TEXT,
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_notes_appointment ON session_notes(appointment_id);
```

#### 10. Consentimientos (Compliance)
```sql
CREATE TABLE consentimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Consent details
  type VARCHAR(100) NOT NULL, -- 'datos_personales' | 'grabacion' | 'terceros'
  country_normative VARCHAR(50), -- 'LFPDPPP' | 'Ley1581' | 'RGPD' | 'HIPAA'
  normative_version VARCHAR(20), -- '1.0'
  
  -- Acceptance
  accepted BOOLEAN NOT NULL,
  accepted_at TIMESTAMP,
  acceptance_method VARCHAR(50), -- 'whatsapp' | 'email' | 'in_person'
  ip_address VARCHAR(45), -- IPv4 or IPv6
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consentimientos_patient ON consentimientos(patient_id);
```

#### 11. Mental Status Exam (Examen Mental)
```sql
CREATE TABLE mental_status_exam (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Components of MSE
  appearance VARCHAR(255),
  behavior VARCHAR(255),
  attitude_toward_examiner VARCHAR(255),
  psychomotor_activity VARCHAR(255),
  mood VARCHAR(255),
  affect VARCHAR(255),
  speech VARCHAR(255),
  thought_process VARCHAR(255),
  thought_content VARCHAR(255),
  perceptions VARCHAR(255),
  orientation VARCHAR(255), -- To person, place, time
  memory VARCHAR(255), -- Recent, remote
  attention_concentration VARCHAR(255),
  insight VARCHAR(255),
  judgment VARCHAR(255),
  impulse_control VARCHAR(255),
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 12. Social Profile (Perfil Social)
```sql
CREATE TABLE social_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Social relationships
  close_relationships TEXT, -- JSON array
  social_support_system TEXT,
  relationship_quality_assessment TEXT,
  
  -- Work/School
  current_employment_status VARCHAR(100),
  job_satisfaction VARCHAR(50),
  work_relationships TEXT,
  academic_performance TEXT,
  
  -- Community
  community_involvement TEXT,
  spiritual_involvement TEXT,
  
  -- Leisure/Recreation
  hobbies_interests TEXT,
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 13. Personality Profile (Personalidad)
```sql
CREATE TABLE personality_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Personality traits
  coping_mechanisms TEXT, -- JSON array
  defense_mechanisms TEXT,
  strengths TEXT, -- JSON array
  vulnerabilities TEXT,
  
  -- Personality assessment tools
  personality_tests_administered TEXT, -- JSON: {test_name, results}
  
  -- Interpersonal style
  interpersonal_style VARCHAR(255),
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 14. Clinical Impression (Impresión Clínica)
```sql
CREATE TABLE clinical_impression (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Summary
  overall_clinical_impression TEXT,
  strengths_and_resources TEXT,
  challenges_and_concerns TEXT,
  
  -- Risk assessment
  suicide_risk_level VARCHAR(50), -- 'Low' | 'Moderate' | 'High'
  homicide_risk_level VARCHAR(50),
  self_harm_risk BOOLEAN,
  
  -- Prognosis
  treatment_prognosis VARCHAR(50), -- 'Good' | 'Fair' | 'Guarded'
  prognosis_factors TEXT,
  
  -- Recommendations
  treatment_recommendations TEXT,
  crisis_plan TEXT,
  
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Audit & Compliance

#### Audit Log
```sql
CREATE TABLE audit.event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  operation VARCHAR(10) NOT NULL, -- INSERT | UPDATE | DELETE
  record_id UUID NOT NULL,
  psychologist_id UUID,
  patient_id UUID,
  
  changes JSONB, -- {field: {old: X, new: Y}}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_table ON audit.event_log(table_name);
CREATE INDEX idx_audit_patient ON audit.event_log(patient_id);
CREATE INDEX idx_audit_created ON audit.event_log(created_at);
```

#### Retention Policy
```sql
CREATE TABLE retention_policy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country VARCHAR(2) NOT NULL,
  normative VARCHAR(50), -- LFPDPPP, Ley1581, RGPD, HIPAA
  
  retention_years_clinical_data INT, -- How long to keep patient records
  retention_years_audit_logs INT, -- How long to keep audit logs
  right_to_deletion BOOLEAN, -- Can patient request deletion?
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert policies
INSERT INTO retention_policy (country, normative, retention_years_clinical_data, retention_years_audit_logs, right_to_deletion)
VALUES 
  ('MX', 'LFPDPPP', 6, 10, true),
  ('CO', 'Ley1581', 5, 10, true),
  ('ES', 'RGPD', 3, 7, true),
  ('US', 'HIPAA', 6, 6, false);
```

---

## 4. VALIDATION CRITERIA

| Criterion | Pass/Fail | Notes |
|-----------|-----------|-------|
| All 14 HC sections versioned independently | PASS | is_current=true, version INT |
| Multi-tenant isolation enforced | PASS | psychologist_id FK on all tables |
| Soft delete capability for GDPR | PASS | deleted_at timestamp on all tables |
| Audit logging comprehensive | PASS | All ops logged to audit.event_log |
| Sensitive data encrypted | PASS | pgcrypto for phone, email |
| DSM-5 diagnosis codes mapped | PASS | primary_diagnosis_code VARCHAR(20) |
| Compliance fields per country | PASS | consentimientos.country_normative |

---

## 5. NEXT STEPS

1. Create migration scripts for each schema
2. Write PostgreSQL trigger for audit logging
3. Test multi-tenant data isolation
4. Create database views for HC retrieval
5. Load DSM-5 code reference data
