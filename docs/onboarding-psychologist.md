# Guía de Inicio — Psicólogo

Bienvenido al **Asistente Psicológico**. Esta guía cubre los primeros pasos para que empieces a usar el sistema.

---

## 1. Primer acceso

1. Abrí el link del dashboard que te compartieron (ej: `https://tu-app.railway.app`)
2. Ingresá con tu email y contraseña
3. **Cambiá tu contraseña** en: `Configuración → Cuenta → Cambiar contraseña`

> Tu sesión se cierra automáticamente después de 60 minutos de inactividad. Esto protege los datos de tus pacientes.

---

## 2. Configurar tu agenda

Antes de crear citas, configurá tu horario:

1. Ir a **Configuración**
2. Ajustar:
   - Días hábiles
   - Hora de inicio y fin
   - Horario de almuerzo
   - Duración de primera consulta y seguimiento
3. Guardar cambios

---

## 3. Crear tu primer paciente

1. Ir a **Pacientes → Nuevo Paciente**
2. Completar datos de identificación (nombre, email, teléfono)
3. El sistema genera automáticamente un registro de Historia Clínica en blanco

---

## 4. Registrar una cita

1. Ir al **Calendario** o **Citas → Nueva Cita**
2. Seleccionar el paciente
3. Elegir fecha, hora y tipo de sesión
4. Guardar — el sistema envía un recordatorio automático 24h y 1h antes

---

## 5. Historia Clínica

La historia clínica sigue el formato APA/DSM-5 con 14 secciones:

| Sección | Contenido |
|---------|-----------|
| Datos de Identificación | Información demográfica |
| Motivo de Consulta | Queja principal y síntomas |
| Antecedentes Personales | Historial médico y psiquiátrico |
| Antecedentes Familiares | Historia familiar relevante |
| Historia del Desarrollo | Desarrollo psicomotor, infancia |
| Evaluación Psicológica | Apariencia, ánimo, cognición |
| Diagnóstico | Códigos DSM-5 / CIE-11 |
| Plan de Tratamiento | Objetivos, modalidad, duración |
| Notas de Sesión | Notas por cita |
| Consentimiento Informado | Firma y estado del consentimiento |
| Examen Mental | Estado mental detallado |
| Perfil Social | Entorno, relaciones, estresores |
| Personalidad | Temperamento, mecanismos de defensa |
| Impresión Clínica | Formulación y pronóstico |

Para editar una sección: **Pacientes → [Paciente] → Historia Clínica → [Sección]**

---

## 6. Exportar datos de un paciente (GDPR)

Si un paciente solicita sus datos:

1. Ir a **Pacientes → [Paciente]**
2. Click en **Exportar datos**
3. El sistema genera un JSON con todas las secciones de su HC

---

## 7. Preguntas frecuentes

**¿Qué pasa si olvido mi contraseña?**  
Contactá al administrador del sistema para que resetee tu contraseña.

**¿Los datos de mis pacientes están seguros?**  
Sí. Los datos se almacenan en una base de datos PostgreSQL cifrada en tránsito (TLS). Cada psicólogo solo ve sus propios pacientes. Hay un registro de auditoría de todas las operaciones.

**¿Cuánto tiempo se guardan los datos?**  
Según tu configuración de retención (por defecto: 5 años desde la última cita). Después de ese período, los datos se anonimizan automáticamente.

**¿Puedo usar el sistema desde el teléfono?**  
El dashboard es responsive y funciona en dispositivos móviles, aunque la experiencia óptima es en desktop.

---

## 8. Contacto de soporte

Para problemas técnicos: bladyparra@gmail.com
