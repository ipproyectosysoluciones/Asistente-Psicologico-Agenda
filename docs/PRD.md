# PRD — Asistente Psicológico Agenda
**Versión:** 1.0 — MVP  
**Fecha:** Abril 2026  
**Autor:** IP Proyectos y Soluciones  
**Estado:** Piloto activo (2 psicólogos)

---

## 1. Executive Summary

### Problema
Los psicólogos y profesionales de salud mental independientes pierden entre 30 y 60 minutos diarios gestionando citas por WhatsApp de forma manual — confirmando disponibilidad, enviando recordatorios, registrando datos de pacientes y completando historias clínicas en herramientas desconectadas entre sí. Esto reduce el tiempo disponible para atención clínica real.

### Solución
Asistente Psicológico Agenda es una plataforma SaaS B2B que automatiza el ciclo completo de una consulta psicológica: desde que el paciente agenda por WhatsApp hasta que el profesional cierra la historia clínica. Combina un bot conversacional (WhatsApp), un panel de administración web y flujos de automatización integrados con Google Calendar y Google Sheets.

### Criterios de éxito del MVP

| Métrica | Objetivo |
|---|---|
| Citas agendadas vía WhatsApp en el piloto | ≥ 20 citas/mes por psicólogo |
| Tasa de confirmación de citas | ≥ 85% |
| Reducción de tiempo administrativo reportada por el psicólogo | ≥ 30% |
| No-shows marcados automáticamente sin intervención manual | 100% |
| Disponibilidad del sistema | ≥ 99% uptime mensual |

---

## 2. Usuarios y Funcionalidad

### Personas

#### Persona 1 — El Psicólogo / Profesional
- **Perfil**: Profesional independiente o consultorio pequeño (1-3 profesionales), 28-50 años.
- **Dolores**: Gestión de agenda por WhatsApp personal, notas clínicas dispersas, olvidos de recordatorios, no-shows sin aviso.
- **Objetivo**: Reducir carga administrativa y tener toda la información clínica centralizada.

#### Persona 2 — El Paciente
- **Perfil**: Persona que busca atención psicológica, familiarizada con WhatsApp.
- **Dolores**: No saber si hay disponibilidad, tener que llamar o esperar respuesta, olvidar la cita.
- **Objetivo**: Agendar, confirmar o cancelar una cita de forma rápida sin llamar.

---

### User Stories y Criterios de Aceptación

#### Módulo de Agendamiento

**US-01** — Como paciente, quiero agendar una cita por WhatsApp sin hablar con nadie, para no depender del horario de la secretaria.
- El bot guía el flujo completo: tipo de consulta → disponibilidad → confirmación.
- La cita queda registrada en la DB, en Google Calendar y en Google Sheets.
- El paciente recibe confirmación inmediata por WhatsApp.
- El psicólogo recibe notificación por Gmail.

**US-02** — Como paciente, quiero recibir un recordatorio 24h antes de mi cita, para no olvidarla.
- El sistema envía recordatorio automático 24 horas antes.
- El recordatorio incluye un link de confirmación o cancelación.

**US-03** — Como psicólogo, quiero ver todas mis citas del día en un panel web, para organizar mi jornada.
- El dashboard muestra citas con nombre del paciente, tipo, hora y estado.
- Las citas son paginadas (10 por página) con filtros de fecha.
- La vista se actualiza en tiempo real sin recargar.

**US-04** — Como psicólogo, quiero que las citas no cumplidas se marquen automáticamente como no-show, para no tener que hacerlo manualmente.
- El sistema marca como no-show las citas pasadas sin confirmación del paciente.
- El psicólogo recibe un resumen diario de no-shows por Gmail.

#### Módulo de Pacientes

**US-05** — Como psicólogo, quiero registrar un nuevo paciente desde el bot o el dashboard, para centralizar la información.
- El registro incluye: nombre, apellido, teléfono, email, fecha de nacimiento, tipo de consulta.
- El paciente queda vinculado a todas sus citas futuras.
- Se evitan duplicados por número de teléfono.

**US-06** — Como psicólogo, quiero acceder al detalle de un paciente y su historia clínica desde el dashboard, para tener contexto antes de la sesión.
- El detalle incluye datos personales, historial de citas y HC.
- La HC muestra las 5 secciones: motivo de consulta, datos demográficos, diagnóstico, historia personal, plan de tratamiento.

#### Módulo de Historia Clínica (HC)

**US-07** — Como psicólogo, quiero completar la HC de un paciente por secciones desde el dashboard, para no tener que hacerlo todo en una sola sesión.
- Cada sección se puede guardar de forma independiente.
- El sistema guarda el último estado automáticamente.
- El psicólogo puede editar secciones ya completadas.

**US-08** — Como paciente, quiero completar mi información de consentimiento informado por WhatsApp, para no tener que ir al consultorio solo para eso.
- El bot envía el formulario de consentimiento y registra la aceptación con timestamp.

---

### Non-Goals (fuera del MVP)

- ❌ Videollamadas o teleconsulta integrada.
- ❌ Facturación o cobro en línea.
- ❌ Multi-idioma (solo español).
- ❌ App móvil nativa.
- ❌ IA generativa para diagnóstico o prescripción clínica.
- ❌ Integración con EHR/EMR externos (ej. Medicloud, Happ).
- ❌ Portal de pacientes web.

---

## 3. Roadmap

### MVP — Actual (Piloto Q2 2026)
- [x] Bot WhatsApp con pairing code (Baileys)
- [x] Agendamiento completo vía bot
- [x] Registro de pacientes
- [x] Historia clínica (5 secciones)
- [x] Consentimiento informado
- [x] Dashboard con citas y pacientes (paginado)
- [x] Google Calendar sync
- [x] Google Sheets sync
- [x] Recordatorios y confirmaciones automáticas por Gmail
- [x] No-show automático
- [x] JWT auth en todos los endpoints
- [x] CI/CD con GitHub Actions + Docker Hub
- [x] Deploy en Railway

### v1.1 — Post-piloto (Q3 2026)
- [ ] Multi-psicólogo con configuración de disponibilidad por profesional
- [ ] Panel de estadísticas (citas, no-shows, pacientes nuevos)
- [ ] Exportación de HC a PDF
- [ ] Configuración de horarios desde el dashboard (sin tocar código)
- [ ] Métricas y KPIs definidos con los usuarios del piloto

### v2.0 — Mediano plazo (Q4 2026 - Q1 2027)
- [ ] Asistente IA para HC: transcripción de voz → borrador de HC complementado por IA
- [ ] Triaje inicial automatizado por WhatsApp (síntomas, urgencia)
- [ ] Firma digital del consentimiento informado
- [ ] Onboarding self-service para nuevos consultorios
- [ ] Panel de administración multi-tenant (un consultorio = N psicólogos)
- [ ] Integración con sistemas de pago (Wompi, PSE)

---

## 4. Especificaciones Técnicas

### Arquitectura

```
Paciente (WhatsApp)
    │
    ▼
[Bot — builderbot + Baileys]
    │  webhooks
    ▼
[n8n — Workflows de negocio]
    │
    ├── PostgreSQL (DB principal)
    ├── Google Calendar (agenda)
    ├── Google Sheets (reportes)
    └── Gmail (notificaciones)

Psicólogo (Web)
    │
    ▼
[Dashboard — React + Vite]
    │  REST + JWT
    ▼
[n8n — API endpoints]
    │
    └── PostgreSQL
```

### Stack tecnológico

| Capa | Tecnología |
|---|---|
| Bot WhatsApp | Node.js 20, builderbot, Baileys |
| Flujos de negocio / API | n8n (self-hosted) |
| Base de datos | PostgreSQL 15 |
| Frontend | React, Vite, TypeScript |
| Infraestructura | Docker, Railway |
| CI/CD | GitHub Actions, Docker Hub |
| Integraciones | Google Calendar, Google Sheets, Gmail |

### Puntos de integración

| Sistema | Uso | Auth |
|---|---|---|
| PostgreSQL | Datos de pacientes, citas, HC | Credencial interna |
| Google Calendar | Crear/cancelar eventos de citas | OAuth2 |
| Google Sheets | Sync de citas para reportes | OAuth2 |
| Gmail | Confirmaciones, recordatorios, no-shows | OAuth2 |
| WhatsApp (Baileys) | Canal conversacional principal | Session + pairing code |

### Seguridad y privacidad

- Todos los endpoints de n8n están protegidos con JWT (HS256, 24h de expiración).
- Las credenciales de producción se gestionan exclusivamente en Railway Secrets — nunca en el repositorio.
- Los archivos de sesión de WhatsApp se persisten en un volumen privado de Railway.
- La DB de la app (`asistente_psicologico`) y la DB de n8n (`n8n_db`) están separadas para evitar conflictos de schema.
- Datos clínicos almacenados solo en la instancia propia del consultorio — sin compartir entre tenants.
- **Restricción crítica de IA (v2.0)**: el componente de asistencia en HC opera en modo complementación, nunca en modo generación autónoma. No puede crear diagnósticos, enfermedades ni trastornos que no hayan sido introducidos explícitamente por el profesional.

---

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| WhatsApp rate limiting en Baileys (IPs de Railway bloqueadas) | Alta | Alto | Parear sesión localmente y subir archivos al volume de Railway |
| Pérdida de sesión WhatsApp en Railway (reinicio del contenedor) | Media | Alto | Volume persistente montado en `/app/AsistentePsicologico_sessions` |
| Upgrade de n8n rompe workflows (cambios de schema en nodes) | Media | Medio | Workflows exportados en JSON versionados en el repo |
| Hallucinations del modelo IA en HC (v2.0) | Alta | Crítico | Restricción arquitectural: IA solo complementa texto del profesional, no genera de cero |
| Baja adopción del bot por parte de pacientes mayores | Media | Medio | Menú simple, mensajes cortos, flujo de máximo 4 pasos para agendar |
| Fuga de datos clínicos | Baja | Crítico | Separación por tenant, sin compartir DB, Railway Secrets para credenciales |
