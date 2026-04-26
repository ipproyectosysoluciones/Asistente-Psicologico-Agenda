-- Sprint 5: initial Q&A content for bot service categories
-- [PENDIENTE: reemplazar con contenido real de la práctica]

INSERT INTO bot_faq (category, question, answer, lang) VALUES
  ('horarios',  '¿Cuál es el horario de atención?',
   'Atendemos de lunes a viernes de 9:00 a 18:00 h. El horario de almuerzo es de 12:00 a 13:00 h. [PENDIENTE: confirmar horario real]',
   'es'),
  ('ubicacion', '¿Dónde están ubicados?',
   'Consultorio ubicado en [PENDIENTE: dirección real]. También ofrecemos sesiones en línea por videollamada.',
   'es'),
  ('precios',   '¿Cuál es el costo de las sesiones?',
   'Primera consulta: $60 USD (90 min). Sesión de seguimiento: $45 USD (50 min). [PENDIENTE: confirmar tarifas reales]',
   'es'),
  ('modalidad', '¿Cómo son las sesiones?',
   'Ofrecemos sesiones presenciales y en línea. Trabajamos con terapia cognitivo-conductual y enfoque integrativo. [PENDIENTE: completar]',
   'es'),
  ('contacto',  '¿Cómo puedo contactarlos?',
   'Podés agendar por este chat escribiendo *agendar*, por email o por WhatsApp. [PENDIENTE: agregar datos de contacto reales]',
   'es')
ON CONFLICT DO NOTHING;
