-- ============================================================
-- Migration: 006_seed_dummy_data
-- Dummy data for local development and UI testing.
-- Idempotent: safe to run multiple times.
-- ============================================================

-- ============================================================
-- PSYCHOLOGIST (fixed UUID for easy reference in dev)
-- ============================================================
INSERT INTO psychologists (
    id, email, password_hash, full_name, professional_license,
    license_country, specialties, timezone,
    rate_currency, rate_first_session, rate_followup, is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'dra.martinez@consultorio.dev',
    crypt('dev_password_123', gen_salt('bf')),
    'Dra. Laura Martínez Ruiz',
    'PSI-2019-004821',
    'CO',
    ARRAY['Terapia cognitivo-conductual', 'Ansiedad', 'Depresión', 'Parejas'],
    'America/Bogota',
    'COP', 150000, 120000, true
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PATIENTS (p01–p15, fixed UUIDs)
-- ============================================================
INSERT INTO patients (
    id, psychologist_id, first_name, last_name, email, phone,
    date_of_birth, gender, country, occupation, marital_status,
    education_level, consent_status, total_sessions
) VALUES
-- Bloque 1: consentimiento 'signed' (5 pacientes)
(
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'Camila', 'Torres Vega',
    'camila.torres@email.dev', '+573001234501',
    '1992-03-15', 'femenino', 'CO',
    'Diseñadora gráfica', 'soltera', 'universitario', 'signed', 8
),
(
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    'Andrés', 'Gómez Herrera',
    'andres.gomez@email.dev', '+573001234502',
    '1987-07-22', 'masculino', 'CO',
    'Ingeniero de sistemas', 'casado', 'posgrado', 'signed', 12
),
(
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000001',
    'Valentina', 'Ríos Castillo',
    'valentina.rios@email.dev', '+573001234503',
    '1995-11-08', 'femenino', 'CO',
    'Estudiante universitaria', 'soltera', 'universitario', 'signed', 5
),
(
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000001',
    'Santiago', 'Morales Pinto',
    'santiago.morales@email.dev', '+573001234504',
    '1980-04-30', 'masculino', 'CO',
    'Contador público', 'divorciado', 'universitario', 'signed', 20
),
(
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000001',
    'Isabella', 'Vargas Mendoza',
    'isabella.vargas@email.dev', '+573001234505',
    '1998-09-14', 'femenino', 'CO',
    'Nutricionista', 'soltera', 'universitario', 'signed', 3
),
-- Bloque 2: consentimiento 'pending' (5 pacientes)
(
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000001',
    'Mateo', 'López Bermúdez',
    'mateo.lopez@email.dev', '+573001234506',
    '1990-01-19', 'masculino', 'CO',
    'Arquitecto', 'soltero', 'universitario', 'pending', 1
),
(
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000001',
    'Sofía', 'Peña Rodríguez',
    'sofia.pena@email.dev', '+573001234507',
    '2000-06-25', 'femenino', 'CO',
    'Estudiante de secundaria', 'soltera', 'bachillerato', 'pending', 0
),
(
    '00000000-0000-0000-0000-000000000108',
    '00000000-0000-0000-0000-000000000001',
    'Nicolás', 'Cruz Salazar',
    'nicolas.cruz@email.dev', '+573001234508',
    '1975-12-03', 'masculino', 'CO',
    'Médico general', 'casado', 'posgrado', 'pending', 2
),
(
    '00000000-0000-0000-0000-000000000109',
    '00000000-0000-0000-0000-000000000001',
    'Mariana', 'Jiménez Ospina',
    'mariana.jimenez@email.dev', '+573001234509',
    '1993-08-11', 'femenino', 'CO',
    'Abogada', 'unión libre', 'universitario', 'pending', 1
),
(
    '00000000-0000-0000-0000-000000000110',
    '00000000-0000-0000-0000-000000000001',
    'Sebastián', 'Ramírez Cárdenas',
    'sebastian.ramirez@email.dev', '+573001234510',
    '1985-02-28', 'masculino', 'CO',
    'Docente universitario', 'casado', 'posgrado', 'pending', 4
),
-- Bloque 3: consentimiento 'revoked' (5 pacientes)
(
    '00000000-0000-0000-0000-000000000111',
    '00000000-0000-0000-0000-000000000001',
    'Daniela', 'Sánchez Mora',
    'daniela.sanchez@email.dev', '+573001234511',
    '1988-05-17', 'femenino', 'CO',
    'Enfermera', 'casada', 'técnico', 'revoked', 7
),
(
    '00000000-0000-0000-0000-000000000112',
    '00000000-0000-0000-0000-000000000001',
    'Felipe', 'Aguilar Torres',
    'felipe.aguilar@email.dev', '+573001234512',
    '1972-10-09', 'masculino', 'CO',
    'Empresario', 'divorciado', 'universitario', 'revoked', 15
),
(
    '00000000-0000-0000-0000-000000000113',
    '00000000-0000-0000-0000-000000000001',
    'Lucía', 'Herrera Blanco',
    'lucia.herrera@email.dev', '+573001234513',
    '1997-07-04', 'femenino', 'CO',
    'Periodista', 'soltera', 'universitario', 'revoked', 3
),
(
    '00000000-0000-0000-0000-000000000114',
    '00000000-0000-0000-0000-000000000001',
    'Tomás', 'Medina Fuentes',
    'tomas.medina@email.dev', '+573001234514',
    '1983-03-21', 'masculino', 'CO',
    'Chef', 'casado', 'técnico', 'revoked', 6
),
(
    '00000000-0000-0000-0000-000000000115',
    '00000000-0000-0000-0000-000000000001',
    'Paula', 'Reyes Gutiérrez',
    'paula.reyes@email.dev', '+573001234515',
    '1991-12-30', 'femenino', 'CO',
    'Contadora', 'soltera', 'universitario', 'revoked', 9
)
ON CONFLICT (psychologist_id, email) DO NOTHING;

-- ============================================================
-- APPOINTMENTS (30 citas, estados mixtos)
-- Base time: NOW() para que las fechas sean relativas al momento de seed
-- ============================================================
DO $$
DECLARE
    psych_id UUID := '00000000-0000-0000-0000-000000000001';
    p01 UUID := '00000000-0000-0000-0000-000000000101';
    p02 UUID := '00000000-0000-0000-0000-000000000102';
    p03 UUID := '00000000-0000-0000-0000-000000000103';
    p04 UUID := '00000000-0000-0000-0000-000000000104';
    p05 UUID := '00000000-0000-0000-0000-000000000105';
    p06 UUID := '00000000-0000-0000-0000-000000000106';
    p07 UUID := '00000000-0000-0000-0000-000000000107';
    p08 UUID := '00000000-0000-0000-0000-000000000108';
    p09 UUID := '00000000-0000-0000-0000-000000000109';
    p10 UUID := '00000000-0000-0000-0000-000000000110';
BEGIN

-- SCHEDULED (8) — futuras
INSERT INTO appointments (id, psychologist_id, patient_id, scheduled_at, duration_minutes, appointment_type, status)
VALUES
    ('00000000-0000-0000-0001-000000000001', psych_id, p01, NOW() + INTERVAL '1 day 9 hours',  50, 'seguimiento',  'scheduled'),
    ('00000000-0000-0000-0001-000000000002', psych_id, p02, NOW() + INTERVAL '2 days 10 hours', 50, 'primera vez',  'scheduled'),
    ('00000000-0000-0000-0001-000000000003', psych_id, p03, NOW() + INTERVAL '3 days 14 hours', 50, 'seguimiento',  'scheduled'),
    ('00000000-0000-0000-0001-000000000004', psych_id, p06, NOW() + INTERVAL '4 days 11 hours', 50, 'primera vez',  'scheduled'),
    ('00000000-0000-0000-0001-000000000005', psych_id, p07, NOW() + INTERVAL '5 days 15 hours', 50, 'primera vez',  'scheduled'),
    ('00000000-0000-0000-0001-000000000006', psych_id, p08, NOW() + INTERVAL '7 days 9 hours',  50, 'seguimiento',  'scheduled'),
    ('00000000-0000-0000-0001-000000000007', psych_id, p09, NOW() + INTERVAL '8 days 16 hours', 50, 'primera vez',  'scheduled'),
    ('00000000-0000-0000-0001-000000000008', psych_id, p10, NOW() + INTERVAL '10 days 10 hours',50, 'seguimiento',  'scheduled')
ON CONFLICT (id) DO NOTHING;

-- CONFIRMED (7) — próximas, ya confirmadas
INSERT INTO appointments (id, psychologist_id, patient_id, scheduled_at, duration_minutes, appointment_type, status)
VALUES
    ('00000000-0000-0000-0002-000000000001', psych_id, p04, NOW() + INTERVAL '1 day 11 hours',  50, 'seguimiento',  'confirmed'),
    ('00000000-0000-0000-0002-000000000002', psych_id, p05, NOW() + INTERVAL '2 days 14 hours', 50, 'seguimiento',  'confirmed'),
    ('00000000-0000-0000-0002-000000000003', psych_id, p01, NOW() + INTERVAL '3 days 10 hours', 50, 'seguimiento',  'confirmed'),
    ('00000000-0000-0000-0002-000000000004', psych_id, p02, NOW() + INTERVAL '6 days 15 hours', 50, 'seguimiento',  'confirmed'),
    ('00000000-0000-0000-0002-000000000005', psych_id, p03, NOW() + INTERVAL '9 days 11 hours', 50, 'primera vez',  'confirmed'),
    ('00000000-0000-0000-0002-000000000006', psych_id, p06, NOW() + INTERVAL '11 days 9 hours', 50, 'seguimiento',  'confirmed'),
    ('00000000-0000-0000-0002-000000000007', psych_id, p04, NOW() + INTERVAL '14 days 14 hours',50, 'seguimiento',  'confirmed')
ON CONFLICT (id) DO NOTHING;

-- COMPLETED (8) — pasadas
INSERT INTO appointments (id, psychologist_id, patient_id, scheduled_at, duration_minutes, appointment_type, status)
VALUES
    ('00000000-0000-0000-0003-000000000001', psych_id, p01, NOW() - INTERVAL '3 days 10 hours', 50, 'seguimiento',  'completed'),
    ('00000000-0000-0000-0003-000000000002', psych_id, p02, NOW() - INTERVAL '7 days 9 hours',  50, 'seguimiento',  'completed'),
    ('00000000-0000-0000-0003-000000000003', psych_id, p04, NOW() - INTERVAL '10 days 14 hours',50, 'seguimiento',  'completed'),
    ('00000000-0000-0000-0003-000000000004', psych_id, p05, NOW() - INTERVAL '14 days 11 hours',50, 'primera vez',  'completed'),
    ('00000000-0000-0000-0003-000000000005', psych_id, p02, NOW() - INTERVAL '21 days 10 hours',50, 'seguimiento',  'completed'),
    ('00000000-0000-0000-0003-000000000006', psych_id, p04, NOW() - INTERVAL '28 days 9 hours', 50, 'seguimiento',  'completed'),
    ('00000000-0000-0000-0003-000000000007', psych_id, p01, NOW() - INTERVAL '35 days 14 hours',50, 'seguimiento',  'completed'),
    ('00000000-0000-0000-0003-000000000008', psych_id, p05, NOW() - INTERVAL '42 days 10 hours',50, 'seguimiento',  'completed')
ON CONFLICT (id) DO NOTHING;

-- NO_SHOW (4) — pasadas sin asistencia
INSERT INTO appointments (id, psychologist_id, patient_id, scheduled_at, duration_minutes, appointment_type, status)
VALUES
    ('00000000-0000-0000-0004-000000000001', psych_id, p03, NOW() - INTERVAL '5 days 10 hours',  50, 'seguimiento', 'no_show'),
    ('00000000-0000-0000-0004-000000000002', psych_id, p07, NOW() - INTERVAL '12 days 14 hours', 50, 'primera vez', 'no_show'),
    ('00000000-0000-0000-0004-000000000003', psych_id, p08, NOW() - INTERVAL '19 days 9 hours',  50, 'primera vez', 'no_show'),
    ('00000000-0000-0000-0004-000000000004', psych_id, p09, NOW() - INTERVAL '26 days 11 hours', 50, 'seguimiento', 'no_show')
ON CONFLICT (id) DO NOTHING;

-- CANCELLED (3) — canceladas
INSERT INTO appointments (id, psychologist_id, patient_id, scheduled_at, duration_minutes, appointment_type, status)
VALUES
    ('00000000-0000-0000-0005-000000000001', psych_id, p10, NOW() - INTERVAL '2 days 10 hours',  50, 'primera vez', 'cancelled'),
    ('00000000-0000-0000-0005-000000000002', psych_id, p03, NOW() - INTERVAL '15 days 14 hours', 50, 'seguimiento', 'cancelled'),
    ('00000000-0000-0000-0005-000000000003', psych_id, p06, NOW() + INTERVAL '2 days 16 hours',  50, 'primera vez', 'cancelled')
ON CONFLICT (id) DO NOTHING;

END $$;

-- ============================================================
-- HC — chief_complaint + demographics (pacientes p01–p05)
-- ============================================================
INSERT INTO chief_complaint (id, patient_id, complaint_text, symptom_duration, symptom_onset, version, is_current)
VALUES
(
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'Ansiedad generalizada con episodios de taquicardia y dificultad para dormir. Sensación constante de preocupación por el trabajo y las relaciones interpersonales.',
    '8 meses', 'Después de cambio de trabajo', 1, true
),
(
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0000-000000000102',
    'Síntomas depresivos moderados: tristeza persistente, anhedonia, fatiga y dificultad de concentración. Pensamientos intrusivos sobre separación de pareja.',
    '1 año 3 meses', 'Gradual, exacerbado tras separación', 1, true
),
(
    '00000000-0000-0000-0010-000000000003',
    '00000000-0000-0000-0000-000000000103',
    'Ataques de pánico recurrentes. Miedo a situaciones sociales, especialmente exposición oral en universidad.',
    '6 meses', 'Primer ataque en examen oral', 1, true
),
(
    '00000000-0000-0000-0010-000000000004',
    '00000000-0000-0000-0000-000000000104',
    'Estrés laboral crónico con somatización: cefaleas tensionales, contracturas musculares y bruxismo. Dificultad para desconectarse del trabajo.',
    '2 años', 'Progresivo con aumento de responsabilidades', 1, true
),
(
    '00000000-0000-0000-0010-000000000005',
    '00000000-0000-0000-0000-000000000105',
    'Problemas de autoestima e imagen corporal. Pensamientos negativos recurrentes sobre apariencia física. Historial de restricción alimentaria leve.',
    '3 años', 'Adolescencia', 1, true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO demographics (id, patient_id, occupation, marital_status, number_of_children, education_level, religion, version, is_current)
VALUES
(
    '00000000-0000-0000-0011-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'Diseñadora gráfica freelance', 'soltera', 0, 'Universitario completo', 'Ninguna', 1, true
),
(
    '00000000-0000-0000-0011-000000000002',
    '00000000-0000-0000-0000-000000000102',
    'Ingeniero de sistemas senior', 'separado', 1, 'Posgrado / Maestría', 'Católica', 1, true
),
(
    '00000000-0000-0000-0011-000000000003',
    '00000000-0000-0000-0000-000000000103',
    'Estudiante universitaria (último año)', 'soltera', 0, 'Universitario incompleto', 'Ninguna', 1, true
),
(
    '00000000-0000-0000-0011-000000000004',
    '00000000-0000-0000-0000-000000000104',
    'Contador público – gerente de área', 'divorciado', 2, 'Universitario completo', 'Católica', 1, true
),
(
    '00000000-0000-0000-0011-000000000005',
    '00000000-0000-0000-0000-000000000105',
    'Nutricionista clínica', 'soltera', 0, 'Universitario completo', 'Ninguna', 1, true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Update patient session counters to match inserted appointments
-- ============================================================
UPDATE patients SET
    total_sessions = (
        SELECT COUNT(*) FROM appointments
        WHERE patient_id = patients.id AND status = 'completed'
    ),
    first_appointment_at = (
        SELECT MIN(scheduled_at) FROM appointments WHERE patient_id = patients.id
    ),
    last_appointment_at = (
        SELECT MAX(scheduled_at) FROM appointments
        WHERE patient_id = patients.id AND status = 'completed'
    )
WHERE psychologist_id = '00000000-0000-0000-0000-000000000001';
