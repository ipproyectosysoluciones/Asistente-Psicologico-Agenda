-- ============================================================
-- Knowledge Base - Insert Existing PDFs
-- ============================================================

-- Get the default psychologist ID
DO $$
DECLARE
    psych_id UUID;
BEGIN
    SELECT id INTO psych_id FROM psychologists LIMIT 1;
    
    IF psych_id IS NOT NULL THEN
        -- Depresión
        INSERT INTO knowledge_base (psychologist_id, title, category, file_path, description, tags)
        VALUES 
        (psych_id, 'Guías de autoayuda para la depresión y los trastornos de ansiedad', 'depresion', 'Libros/Depresión/01. Guías de autoayuda para la depresión y los trastornos de ansiedad autor Junta de Andalucía.pdf', 'Guías de autoayuda para la depresión y trastornos de ansiedad', ARRAY['depresión', 'ansiedad', 'autoayuda']),
        (psych_id, 'La depresión', 'depresion', 'Libros/Depresión/05. La depresión autor Agencia de Evaluación de Tecnologías Sanitarias de Galicia.pdf', 'Guía sobre la depresión', ARRAY['depresión', 'guía']),
        (psych_id, 'Superando la depresión', 'depresion', 'Libros/Depresión/15. Superando la depresión autor American Psychological Association.pdf', 'Manual APA para superar la depresión', ARRAY['depresión', 'APA', 'tratamiento']),
        (psych_id, 'Depresión en Niños y Adolescentes', 'depresion', 'Libros/Depresión/Depresión en Niños y Adolescentes, IACAPAP.pdf', 'Guía sobre depresión infantil y adolescente', ARRAY['depresión', 'niños', 'adolescentes']),
        (psych_id, 'Depresión en adolescentes', 'depresion', 'Libros/Depresión/Depresión en adolescentes, Oficina de Salud Mental del Estado de New York.pdf', 'Depresión en adolescentes', ARRAY['depresión', 'adolescentes']),
        (psych_id, 'Depresión en Personas Mayores', 'depresion', 'Libros/Depresión/Depresión en las Personas Mayores, Sociedad Española de Geriatría y Gerontología.pdf', 'Depresión en adultos mayores', ARRAY['depresión', 'mayores', 'geriátrica']),
        (psych_id, 'Manual para padres sobre depresión infantil', 'depresion', 'Libros/Depresión/Manual para padres sobre la depresión infantil y adolescente, Erika''s Lighthouse.pdf', 'Guía para padres', ARRAY['depresión', 'padres', 'infantil']),
        (psych_id, 'Depresión general', 'depresion', 'Libros/Depresión/Depresión, Oficina de Salud Mental del Estado de New York.pdf', 'Guía general sobre depresión', ARRAY['depresión']),

        -- Emociones
        (psych_id, 'Las emociones', 'emociones', 'Libros/Emociones/01. Las emociones. Comprenderlas para vivir mejor autor INTEF.pdf', 'Guía sobre las emociones', ARRAY['emociones', 'educación']),
        (psych_id, 'Psicología de la emoción', 'emociones', 'Libros/Emociones/02. Psicología de la emoción autor Mariano Chóliz Montañés.pdf', 'Proceso emocional', ARRAY['emociones', 'psicología']),
        (psych_id, 'Aprendiendo a manejar mis emociones', 'emociones', 'Libros/Emociones/04. ¡Aprendiendo a manejar mis emociones de manera inteligente! autor Universitaria Agustiniana.pdf', 'Técnicas emocionales', ARRAY['emociones', 'inteligencia emocional']),
        (psych_id, 'Aprendiendo sobre las emociones', 'emociones', 'Libros/Emociones/05. Aprendiendo sobre las emociones autor Mónica Calderón Rodríguez.pdf', 'Educación emocional', ARRAY['emociones', 'educación']),
        (psych_id, 'Cómo Controlar las Emociones', 'emociones', 'Libros/Emociones/06. Cómo Controlar las Emociones 10 Técnicas que Funcionan autor Navarro.pdf', '10 técnicas efectivas', ARRAY['emociones', 'técnicas']),
        (psych_id, 'Diccionario de las Emociones', 'emociones', 'Libros/Emociones/Diccionario de las Emociones, UNAM.pdf', 'Diccionario emocional', ARRAY['emociones', 'diccionario']),
        (psych_id, 'Regulación Emocional', 'emociones', 'Libros/Emociones/Regulación Emocional y Experiencias Positivas.pdf', 'Regulación emocional', ARRAY['emociones', 'regulación']),
        (psych_id, 'Bienestar emocional en la infancia', 'emociones', 'Libros/Emociones/El bienestar emocional en la infancia. Guía para padres.pdf', 'Bienestar infantil', ARRAY['emociones', 'infancia', 'padres']),

        -- Esquizofrenia
        (psych_id, 'Guía de Práctica Clínica sobre Esquizofrenia', 'esquizofrenia', 'Libros/Esquizofrenia/01. Guía de Práctica Clínica sobre la Esquizofrenia autor Ministerio de Sanidad.pdf', 'Guía clínica', ARRAY['esquizofrenia', 'clínica']),
        (psych_id, 'Comprender la psicosis y la esquizofrenia', 'esquizofrenia', 'Libros/Esquizofrenia/02. Comprender la psicosis y la esquizofrenia autor Sociedad Británica de Psicología.pdf', 'Introducción a la esquizofrenia', ARRAY['esquizofrenia', 'psicosis']),
        (psych_id, 'Guía para adolescentes y familias', 'esquizofrenia', 'Libros/Esquizofrenia/03. Guía para adolescentes y familias que quieren entender y afrontar la psicosis.pdf', 'Guía familiar', ARRAY['esquizofrenia', 'familia', 'adolescentes']),
        (psych_id, 'Esquizofrenia temprana', 'esquizofrenia', 'Libros/Esquizofrenia/04. Esquizofrenia temprana autor Rogelio García Jubera.pdf', 'Esquizofrenia en jóvenes', ARRAY['esquizofrenia', 'temprana']),
        (psych_id, 'Guías de práctica clínica basadas en evidencia', 'esquizofrenia', 'Libros/Esquizofrenia/05. Guías de práctica clínica basadas en la evidencia.pdf', 'Medicina basada en evidencia', ARRAY['esquizofrenia', 'evidencia']),
        (psych_id, 'Tratamiento de la esquizofrenia', 'esquizofrenia', 'Libros/Esquizofrenia/06. Guía práctica clínica para el tratamiento de la esquizofrenia.pdf', 'Tratamiento clínico', ARRAY['esquizofrenia', 'tratamiento']),
        (psych_id, 'Rehabilitación psicosocial y familia', 'esquizofrenia', 'Libros/Esquizofrenia/07. Esquizofrenia, Rehabilitación Psicosocial y Familia.pdf', 'Rehabilitación', ARRAY['esquizofrenia', 'rehabilitación', 'familia']),
        (psych_id, 'La Esquizofrenia a Través del Tiempo', 'esquizofrenia', 'Libros/Esquizofrenia/08. La Esquizofrenia a Través del Tiempo.pdf', 'Historia de la enfermedad', ARRAY['esquizofrenia', 'historia']),
        (psych_id, 'Rehabilitación psicosocial', 'esquizofrenia', 'Libros/Esquizofrenia/09. Rehabilitación psicosocial y esquizofrenia.pdf', 'Técnicas de rehabilitación', ARRAY['esquizofrenia', 'rehabilitación']),
        
        -- General
        (psych_id, 'La interpretación de los sueños', 'general', 'Libros/La interpretación de los sueños, Sigmund Freud.pdf', 'Psicoanálisis freudiano', ARRAY['sueños', 'freud', 'psicoanálisis']),
        (psych_id, 'Psicopatología General', 'general', 'Libros/Psicopatología General, Bernardo Peña Herrera.pdf', 'Manual de psicopatología', ARRAY['psicopatología', 'manual']);
        
        RAISE NOTICE 'Knowledge base populated successfully!';
    ELSE
        RAISE WARNING 'No psychologist found. Run insert for psychologists first.';
    END IF;
END $$;