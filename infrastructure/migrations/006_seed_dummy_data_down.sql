-- ============================================================
-- Migration: 006_seed_dummy_data_down
-- Removes all seed dummy data by fixed UUID sets.
-- Uses DELETE (not TRUNCATE) to avoid cascading on real data.
-- ============================================================

-- HC tables first (depend on patients)
DELETE FROM demographics
WHERE patient_id IN (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000105'
);

DELETE FROM chief_complaint
WHERE patient_id IN (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000105'
);

-- Appointments (depend on patients + psychologist)
DELETE FROM appointments
WHERE psychologist_id = '00000000-0000-0000-0000-000000000001';

-- Patients (depend on psychologist)
DELETE FROM patients
WHERE psychologist_id = '00000000-0000-0000-0000-000000000001';

-- Psychologist
DELETE FROM psychologists
WHERE id = '00000000-0000-0000-0000-000000000001';
