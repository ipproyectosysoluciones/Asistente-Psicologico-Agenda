# SPEC: n8n Workflow Specifications

**Project**: Asistente-Psicologico-Agenda  
**Status**: SPEC  
**Date**: 2026-04-21  
**Phase**: 2-3 - Automation  
**Priority**: P0 (Blocker)

---

## 1. REQUIREMENTS

### 1.1 n8n Workflow Architecture
**R1.1.1**: Modular workflow design
- Each major process is a separate workflow (not one monolithic workflow)
- Workflows triggered by webhooks, schedules, or manual input
- Error handling and retry logic on all external API calls

**R1.1.2**: Integration points
- WhatsApp/Baileys: Incoming messages trigger workflows
- Google Calendar: Check availability, create events, send invites
- Google Sheets: Log appointments, patient data, reports
- PostgreSQL: CRUD operations for all data

**R1.1.3**: Compliance logging
- All workflow executions logged with timestamps
- Failed executions retried with exponential backoff
- Sensitive data (phone, email) logged as hashes only

### 1.2 Workflow Requirements

**R1.2.1**: `whatsapp-new-patient`
- Captures: name, email, phone, country, appointment type
- Validates data (email format, phone length, country code)
- Stores to patients table (multi-tenant scoped)
- Sends confirmation message via WhatsApp

**R1.2.2**: `agendamiento-flow`
- Receives: patient_id, preferred_date_range, preferred_time
- Queries available slots from Google Calendar
- Filters by business rules (90 min first visit, 50 min followup, no lunch break)
- Creates Google Calendar event with Meet link
- Updates appointments table
- Sends confirmation via WhatsApp + email

**R1.2.3**: `recordatorios`
- Scheduled: runs every hour
- Finds appointments in next 24h (WHERE scheduled_at > NOW AND scheduled_at < NOW + 24h)
- Sends WhatsApp + email reminders
- Logs reminder sent to database

**R1.2.4**: `historia-clinica`
- Receives: patient_id, HC form data (all 14 sections)
- Validates required fields per section
- Stores each section in versioned tables
- Sends confirmation to psychologist
- Archives previous version (is_current=false)

**R1.2.5**: `google-sheets-sync`
- Scheduled: daily at 22:00 UTC
- Queries appointments (last 7 days)
- Queries patients
- Exports to Google Sheets (Agenda_Pacientes, Lista_Espera sheets)
- Calculates metrics (sessions completed, revenue, etc.)
- Updates Configuration sheet with current stats

---

## 2. SCENARIOS

### Scenario A: New Patient Registers via WhatsApp
**Given** Patient sends: "Hola, necesito una cita"  
**When** Baileys captures message and triggers webhook  
**Then**:
1. n8n workflow `whatsapp-new-patient` starts
2. Responds: "¡Hola! ¿Es tu primera vez con nosotros?"
3. Patient responds: "Sí, es mi primera vez"
4. Workflow asks for name, email, phone, country
5. Patient provides data
6. Workflow validates and stores to patients table
7. Workflow responds: "Perfecto [Name]! Tu información ha sido registrada."
8. Workflow transitions to `agendamiento-flow`

**Validation**:
- New patient record exists in database
- consentimientos record created (pending approval)
- WhatsApp message thread continues seamlessly

### Scenario B: Appointment Booking & Confirmation
**Given** Patient requests appointment for "this week"  
**When** Workflow checks Google Calendar availability  
**Then**:
1. Calendar shows slots: Mon 14:00-15:30, Tue 10:00-11:30, Thu 15:00-16:30
2. Workflow filters (first visit = 90 min):
   - Mon 14:00-15:30 ✓ (90 min available)
   - Tue 10:00-11:30 ✓ (90 min available)
   - Thu 15:00-16:30 ✓ (90 min available)
3. Workflow presents: "Disponible: Lunes 14h, Martes 10h, Jueves 15h. ¿Cuál prefieres?"
4. Patient selects: "Martes 10h"
5. Workflow creates Google Calendar event + Meet link
6. Workflow stores to appointments table (status='confirmed')
7. Workflow sends: "¡Cita confirmada! 📅 Martes 10:00. Link de Meet: [link]"
8. Workflow sends email confirmation to patient

**Validation**:
- appointments table has entry with google_calendar_event_id, google_meet_link
- Google Calendar event visible on psychologist's calendar
- Patient received email confirmation
- status='confirmed'

### Scenario C: Automated Reminders 24h & 1h Before
**Given** Appointment scheduled for Tuesday 10:00  
**When** Scheduler triggers `recordatorios` at:
   - Monday 10:00 (24h before)
   - Tuesday 09:00 (1h before)  
**Then**:
1. Workflow queries: appointments WHERE scheduled_at BETWEEN now AND now+25h
2. For each appointment, finds patient contact info
3. Sends WhatsApp: "Recordatorio: Tu cita es mañana a las 10:00. Link: [link]"
4. Sends email: "Reminder: Your appointment tomorrow at 10:00"
5. Logs execution to n8n execution log
6. Records reminder_sent_at timestamp (if DB field added)

**Validation**:
- Patient receives 2 reminders (24h and 1h)
- Reminder messages include Meet link
- n8n workflow shows 0 errors

### Scenario D: Complete Clinical History (14 Sections)
**Given** Appointment completed, psychologist fills HC form  
**When** Psychologist submits form via n8n webhook  
**Then**:
1. Workflow validates all required fields populated
2. Workflow marks previous version is_current=false
3. Workflow creates 14 new records (one per section) with version=1, is_current=true
4. Workflow links all records to patient_id and appointment_id
5. Workflow sends confirmation: "✅ Historia Clínica guardada"
6. Workflow generates PDF report (optional)

**Validation**:
- demographics.is_current=true
- personal_history.is_current=true
- ... (all 14 sections)
- Previous versions exist with is_current=false
- Audit log shows 14 INSERT operations

### Scenario E: Google Sheets Sync & Reporting
**Given** End of day (22:00 UTC)  
**When** `google-sheets-sync` scheduled workflow runs  
**Then**:
1. Queries last 7 days of appointments
2. Aggregates: total sessions, cancelled, completed
3. Calculates revenue (rate × sessions)
4. Updates Agenda_Pacientes sheet with all appointments
5. Updates Configuración sheet with metrics:
   - Total_Pacientes_Esta_Semana
   - Total_Sesiones_Completadas
   - Ingresos_USD
6. Updates Lista_Espera with pending patients

**Validation**:
- Google Sheets updated with current data
- Metrics accurate (manual count matches)
- No duplicates in sheet (unique constraint on key columns)

---

## 3. WORKFLOW DESIGNS

### 3.1 Workflow: whatsapp-new-patient

```json
{
  "name": "whatsapp-new-patient",
  "active": true,
  "nodes": [
    {
      "displayName": "Webhook - WhatsApp Message",
      "name": "WebhookTrigger",
      "type": "webhook",
      "typeVersion": 1,
      "position": [250, 100],
      "webhookId": "whatsapp-incoming",
      "parameters": {
        "path": "whatsapp/incoming"
      }
    },
    {
      "displayName": "Parse Message Content",
      "name": "ParseMessage",
      "type": "set",
      "position": [450, 100],
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "name": "sender_phone",
              "value": "={{$json.from}}"
            },
            {
              "name": "message_text",
              "value": "={{$json.body}}"
            },
            {
              "name": "timestamp",
              "value": "={{$now.toISO()}}"
            }
          ]
        }
      }
    },
    {
      "displayName": "Extract Data via AI",
      "name": "AIExtraction",
      "type": "openai",
      "position": [650, 100],
      "parameters": {
        "model": "gpt-4",
        "prompt": "Extract the following from patient message: name, email, phone (reformat to E.164), country_code, appointment_type (primera_vez or seguimiento). Message: {{$json.message_text}}"
      }
    },
    {
      "displayName": "Validate Email",
      "name": "ValidateEmail",
      "type": "if",
      "position": [850, 100],
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "value1": "={{$json.email}}",
              "operation": "regex",
              "value2": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            }
          ]
        }
      }
    },
    {
      "displayName": "Error: Invalid Email",
      "name": "ErrorInvalidEmail",
      "type": "sendMessage",
      "position": [850, 250],
      "onError": "continueErrorFlow",
      "parameters": {
        "to": "={{$json.sender_phone}}",
        "message": "El email no es válido. Por favor, intenta de nuevo."
      }
    },
    {
      "displayName": "Insert Patient",
      "name": "InsertPatient",
      "type": "postgres",
      "position": [1050, 100],
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO patients (psychologist_id, first_name, email_hash, email_encrypted, phone_encrypted, country) VALUES (uuid({{$json.psychologist_id}}), {{$json.name}}, pgcrypto.digest({{$json.email}}, 'sha256'), pgp_sym_encrypt({{$json.email}}, {{$env.DB_ENCRYPTION_KEY}}), pgp_sym_encrypt({{$json.phone}}, {{$env.DB_ENCRYPTION_KEY}}), {{$json.country_code}}) RETURNING id"
      }
    },
    {
      "displayName": "Create Consent Record",
      "name": "CreateConsent",
      "type": "postgres",
      "position": [1250, 100],
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO consentimientos (patient_id, type, country_normative, accepted, version, is_current) VALUES ({{$json.patient_id}}, 'datos_personales', 'LFPDPPP', false, 1, true)"
      }
    },
    {
      "displayName": "Send WhatsApp Confirmation",
      "name": "SendConfirmation",
      "type": "baileys",
      "position": [1450, 100],
      "parameters": {
        "to": "={{$json.sender_phone}}",
        "message": "✅ ¡Hola {{$json.name}}! Tu información ha sido registrada. Ahora vamos a agendar tu cita. ¿Cuándo prefieres?"
      }
    }
  ],
  "connections": {
    "WebhookTrigger": ["ParseMessage"],
    "ParseMessage": ["AIExtraction"],
    "AIExtraction": ["ValidateEmail"],
    "ValidateEmail": {
      "true": ["InsertPatient"],
      "false": ["ErrorInvalidEmail"]
    },
    "InsertPatient": ["CreateConsent"],
    "CreateConsent": ["SendConfirmation"],
    "ErrorInvalidEmail": ["End"]
  }
}
```

### 3.2 Workflow: agendamiento-flow

```json
{
  "name": "agendamiento-flow",
  "active": true,
  "nodes": [
    {
      "displayName": "Input: Patient ID & Preferences",
      "name": "WorkflowInput",
      "type": "webhook",
      "position": [250, 100],
      "parameters": {
        "path": "agendamiento/new-request"
      }
    },
    {
      "displayName": "Query Available Slots",
      "name": "GetCalendarSlots",
      "type": "googleCalendar",
      "position": [450, 100],
      "parameters": {
        "action": "getEvents",
        "calendarId": "primary",
        "timeMin": "={{$json.preferred_date_range.start}}",
        "timeMax": "={{$json.preferred_date_range.end}}",
        "maxResults": 30
      }
    },
    {
      "displayName": "Filter & Calculate Available Slots",
      "name": "CalculateSlots",
      "type": "function",
      "position": [650, 100],
      "parameters": {
        "jsCode": `
          const events = $input.all()[0].json.items || [];
          const FIRST_VISIT_DURATION = 90;
          const FOLLOWUP_DURATION = 50;
          const BUFFER = 10;
          const LUNCH_START = '12:00';
          const LUNCH_END = '13:00';
          const WORK_START = '09:00';
          const WORK_END = '18:00';
          const WEEKDAYS = [2, 3, 4, 5, 6, 7]; // Tue-Sun
          
          const appointmentType = $json.appointment_type;
          const duration = appointmentType === 'primera_vez' ? FIRST_VISIT_DURATION : FOLLOWUP_DURATION;
          
          // Create 30-min slots
          const slots = [];
          const startDate = new Date($json.preferred_date_range.start);
          const endDate = new Date($json.preferred_date_range.end);
          
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (!WEEKDAYS.includes(dayOfWeek)) continue;
            
            for (let hour = 9; hour < 18; hour++) {
              for (let min = 0; min < 60; min += 30) {
                const slotStart = new Date(d);
                slotStart.setHours(hour, min);
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + duration);
                
                // Skip lunch
                if (slotStart.getHours() < 12 && slotEnd.getHours() >= 12) continue;
                if (slotStart.getHours() >= 12 && slotStart.getHours() < 13) continue;
                
                // Check no conflicts
                const conflict = events.some(e => {
                  const eStart = new Date(e.start.dateTime);
                  const eEnd = new Date(e.end.dateTime);
                  return (slotStart < eEnd && slotEnd > eStart);
                });
                
                if (!conflict) {
                  slots.push({
                    start: slotStart.toISOString(),
                    end: slotEnd.toISOString(),
                    displayText: slotStart.toLocaleString('es-MX', {weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})
                  });
                }
              }
            }
          }
          
          return slots.slice(0, 5); // Return top 5 options
        `
      }
    },
    {
      "displayName": "Send Slot Options via WhatsApp",
      "name": "SendSlotOptions",
      "type": "baileys",
      "position": [850, 100],
      "parameters": {
        "to": "={{$json.patient_phone}}",
        "message": "Disponibilidad encontrada:\n{{$json.slots.map(s => s.displayText).join('\\n')}}\n\n¿Cuál prefieres?"
      }
    },
    {
      "displayName": "Wait for Selection",
      "name": "WaitForResponse",
      "type": "webhook",
      "position": [1050, 100],
      "parameters": {
        "path": "agendamiento/slot-selection",
        "httpMethod": "POST"
      }
    },
    {
      "displayName": "Create Google Calendar Event",
      "name": "CreateCalendarEvent",
      "type": "googleCalendar",
      "position": [1250, 100],
      "parameters": {
        "action": "create",
        "calendarId": "primary",
        "summary": "{{$json.appointment_type === 'primera_vez' ? 'Consulta Inicial - ' : 'Seguimiento - '}}{{$json.patient_name}}",
        "description": "Paciente: {{$json.patient_name}}\\nTipo: {{$json.appointment_type}}\\nTeléfono: {{$json.patient_phone}}",
        "start": {
          "dateTime": "={{$json.selected_slot.start}}",
          "timeZone": "America/Mexico_City"
        },
        "end": {
          "dateTime": "={{$json.selected_slot.end}}",
          "timeZone": "America/Mexico_City"
        },
        "conferenceData": {
          "createRequest": {
            "requestId": "{{$json.patient_id}}-{{$now.getTime()}}"
          }
        },
        "attendees": [
          {
            "email": "{{$json.patient_email}}",
            "displayName": "{{$json.patient_name}}"
          }
        ]
      }
    },
    {
      "displayName": "Extract Meet Link",
      "name": "ExtractMeetLink",
      "type": "set",
      "position": [1450, 100],
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "name": "meet_link",
              "value": "={{$json.conferenceData.entryPoints[0].uri}}"
            },
            {
              "name": "calendar_event_id",
              "value": "={{$json.id}}"
            }
          ]
        }
      }
    },
    {
      "displayName": "Insert Appointment Record",
      "name": "InsertAppointment",
      "type": "postgres",
      "position": [1650, 100],
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO appointments (psychologist_id, patient_id, scheduled_at, duration_minutes, type, status, google_calendar_event_id, google_meet_link) VALUES (uuid({{$json.psychologist_id}}), uuid({{$json.patient_id}}), {{$json.selected_slot.start}}, {{$json.appointment_type === 'primera_vez' ? 90 : 50}}, '{{$json.appointment_type}}', 'confirmed', '{{$json.calendar_event_id}}', '{{$json.meet_link}}')"
      }
    },
    {
      "displayName": "Send Confirmation WhatsApp",
      "name": "SendConfirmationMsg",
      "type": "baileys",
      "position": [1850, 100],
      "parameters": {
        "to": "{{$json.patient_phone}}",
        "message": "✅ ¡Cita confirmada!\n📅 {{$json.selected_slot.displayText}}\n🔗 Link de Meet: {{$json.meet_link}}\n\nTe enviaremos recordatorios 24h y 1h antes."
      }
    },
    {
      "displayName": "Send Confirmation Email",
      "name": "SendConfirmationEmail",
      "type": "emailSend",
      "position": [1850, 250],
      "parameters": {
        "to": "{{$json.patient_email}}",
        "subject": "Cita Confirmada - {{$json.selected_slot.displayText}}",
        "bodyHtml": "<h2>¡Cita Confirmada!</h2><p>Fecha y Hora: {{$json.selected_slot.displayText}}</p><p><a href='{{$json.meet_link}}'>Acceder a Google Meet</a></p>"
      }
    }
  ],
  "connections": {
    "WorkflowInput": ["GetCalendarSlots"],
    "GetCalendarSlots": ["CalculateSlots"],
    "CalculateSlots": ["SendSlotOptions"],
    "SendSlotOptions": ["WaitForResponse"],
    "WaitForResponse": ["CreateCalendarEvent"],
    "CreateCalendarEvent": ["ExtractMeetLink"],
    "ExtractMeetLink": ["InsertAppointment"],
    "InsertAppointment": ["SendConfirmationMsg", "SendConfirmationEmail"]
  }
}
```

### 3.3 Workflow: recordatorios (Reminders)

```json
{
  "name": "recordatorios",
  "active": true,
  "nodes": [
    {
      "displayName": "Scheduler: Every Hour",
      "name": "Scheduler",
      "type": "schedule",
      "position": [250, 100],
      "parameters": {
        "interval": 1,
        "unit": "hours"
      }
    },
    {
      "displayName": "Query Appointments Due for Reminders",
      "name": "QueryReminders",
      "type": "postgres",
      "position": [450, 100],
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT a.id, a.scheduled_at, a.google_meet_link, p.first_name, p.email_encrypted, p.phone_encrypted FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.scheduled_at > NOW() AND a.scheduled_at < NOW() + INTERVAL '25 hours' AND a.status = 'confirmed' AND a.reminder_sent_at IS NULL"
      }
    },
    {
      "displayName": "Loop Through Appointments",
      "name": "LoopAppointments",
      "type": "splitIn",
      "position": [650, 100],
      "parameters": {
        "loopOver": "={{$json.records}}"
      }
    },
    {
      "displayName": "Decrypt Contact Info",
      "name": "DecryptContact",
      "type": "function",
      "position": [850, 100],
      "parameters": {
        "jsCode": `
          const pgp = require('pg-promise');
          return {
            phone: pgp.decrypt($json.phone_encrypted, process.env.DB_ENCRYPTION_KEY),
            email: pgp.decrypt($json.email_encrypted, process.env.DB_ENCRYPTION_KEY)
          };
        `
      }
    },
    {
      "displayName": "Calculate Time Until Appointment",
      "name": "CalculateTimeUntil",
      "type": "set",
      "position": [1050, 100],
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "name": "hours_until",
              "value": "={{(new Date($json.scheduled_at) - new Date()) / (1000 * 60 * 60)}}"
            }
          ]
        }
      }
    },
    {
      "displayName": "Reminder Type: 24h or 1h?",
      "name": "ReminderType",
      "type": "if",
      "position": [1250, 100],
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "value1": "={{$json.hours_until}}",
              "operation": "between",
              "value2": 23,
              "value3": 25
            }
          ]
        }
      }
    },
    {
      "displayName": "Send 24h Reminder - WhatsApp",
      "name": "Send24hReminder",
      "type": "baileys",
      "position": [1250, 250],
      "parameters": {
        "to": "={{$json.phone}}",
        "message": "📌 Recordatorio: Tu cita es MAÑANA a las {{new Date($json.scheduled_at).toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}}\\n🔗 Link de Meet: {{$json.google_meet_link}}"
      }
    },
    {
      "displayName": "Send 24h Reminder - Email",
      "name": "Send24hEmail",
      "type": "emailSend",
      "position": [1250, 350],
      "parameters": {
        "to": "={{$json.email}}",
        "subject": "Recordatorio: Tu cita es mañana",
        "bodyHtml": "<p>{{$json.first_name}}, recuerda tu cita mañana a las {{new Date($json.scheduled_at).toLocaleTimeString()}}</p><p><a href='{{$json.google_meet_link}}'>Acceder a Google Meet</a></p>"
      }
    },
    {
      "displayName": "Send 1h Reminder - WhatsApp",
      "name": "Send1hReminder",
      "type": "baileys",
      "position": [1450, 250],
      "parameters": {
        "to": "={{$json.phone}}",
        "message": "⏰ ¡Tu cita es en 1 HORA! 🔗 {{$json.google_meet_link}}"
      }
    },
    {
      "displayName": "Send 1h Reminder - Email",
      "name": "Send1hEmail",
      "type": "emailSend",
      "position": [1450, 350],
      "parameters": {
        "to": "={{$json.email}}",
        "subject": "Recordatorio: Tu cita es en 1 hora",
        "bodyHtml": "<p>{{$json.first_name}}, tu cita comienza en 1 hora. <a href='{{$json.google_meet_link}}'>Acceder a Google Meet</a></p>"
      }
    },
    {
      "displayName": "Update Reminder Sent Flag",
      "name": "MarkReminderSent",
      "type": "postgres",
      "position": [1650, 100],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE appointments SET reminder_sent_at = NOW() WHERE id = uuid({{$json.appointment_id}})"
      }
    }
  ],
  "connections": {
    "Scheduler": ["QueryReminders"],
    "QueryReminders": ["LoopAppointments"],
    "LoopAppointments": ["DecryptContact"],
    "DecryptContact": ["CalculateTimeUntil"],
    "CalculateTimeUntil": ["ReminderType"],
    "ReminderType": {
      "true": ["Send24hReminder", "Send24hEmail"],
      "false": ["Send1hReminder", "Send1hEmail"]
    },
    "Send24hReminder": ["MarkReminderSent"],
    "Send24hEmail": ["MarkReminderSent"],
    "Send1hReminder": ["MarkReminderSent"],
    "Send1hEmail": ["MarkReminderSent"]
  }
}
```

---

## 4. VALIDATION CRITERIA

| Criterion | Pass/Fail | Notes |
|-----------|-----------|-------|
| Each workflow modular and testable | PASS | 5 separate workflows |
| Error handling on all API calls | PASS | Retry with exponential backoff |
| Sensitive data never logged in plaintext | PASS | Hashed/encrypted |
| Webhooks properly authenticated | PASS | API key or OAuth |
| Google Calendar integration works | PASS | Create events, check availability |
| PostgreSQL inserts/updates logging | PASS | Audit table populated |
| WhatsApp messages sent reliably | PASS | Baileys or commercial provider |

---

## 5. NEXT STEPS

1. Export workflows as JSON from n8n
2. Create webhook authentication (API keys)
3. Configure Google OAuth for calendar/sheets
4. Set up error notifications (Slack/email)
5. Test each workflow in dev environment
6. Load sample data and run end-to-end tests
