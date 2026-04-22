# Flujo de Automatización: Sistema de Gestión de Citas

## 1. Estructura de Google Sheets

### Hoja: "Agenda_Pacientes"
```
Columnas:
A: Fecha
B: Hora
C: Nombre
D: Tipo (Primera vez/Seguimiento)
E: Email
F: Teléfono
G: Estado (Confirmada/Pendiente/Cancelada)
H: Link de Meet
I: Notas
J: Último contacto
K: Próximo seguimiento
```

### Hoja: "Configuración"
```
Columnas:
A: Parámetro
B: Valor

Filas:
1: Duración default primera cita
2: Duración default seguimiento
3: Horario inicio
4: Horario fin
5: Días laborables
6: Email psicólogo
7: Plantilla mensaje confirmación
8: Plantilla recordatorio
```

## 2. Flujo en Make

### A. Módulo de Creación de Citas

```javascript
// 1. Trigger: Nuevo Formulario de Contacto
{
  type: "form",
  fields: {
    nombre: "string",
    email: "email",
    telefono: "string",
    tipo: ["Primera vez", "Seguimiento"],
    preferencia_horario: "string"
  }
}

// 2. Verificar Disponibilidad Calendar
{
  module: "Google Calendar",
  action: "Search Events",
  params: {
    calendarId: "primary",
    timeMin: "{{preferencia_horario}}",
    timeMax: "{{add(preferencia_horario, 1, 'day')}}"
  }
}

// 3. Crear Evento Calendar
{
  module: "Google Calendar",
  action: "Create Event",
  params: {
    summary: `Consulta ${tipo} - ${nombre}`,
    description: `Paciente: ${nombre}\nTipo: ${tipo}\nTeléfono: ${telefono}`,
    start: {
      dateTime: "{{hora_seleccionada}}",
      timeZone: "America/Mexico_City"
    },
    end: {
      dateTime: "{{add(hora_seleccionada, duracion, 'minutes')}}",
      timeZone: "America/Mexico_City"
    },
    conferenceData: {
      createRequest: {
        requestId: "{{generateUUID()}}"
      }
    }
  }
}

// 4. Registrar en Google Sheets
{
  module: "Google Sheets",
  action: "Add Row",
  params: {
    spreadsheetId: "{{CONFIG.SHEET_ID}}",
    range: "Agenda_Pacientes!A:K",
    values: [
      [
        "{{formatDate(hora_seleccionada, 'YYYY-MM-DD')}}",
        "{{formatDate(hora_seleccionada, 'HH:mm')}}",
        nombre,
        tipo,
        email,
        telefono,
        "Confirmada",
        "{{event.conferenceData.entryPoints[0].uri}}",
        "",
        "{{now()}}",
        "{{if(tipo == 'Primera vez', add(now(), 7, 'days'), '')}}"
      ]
    ]
  }
}
```

### B. Módulo de Recordatorios

```javascript
// 1. Trigger: Scheduler (Cada hora)
{
  module: "Schedule",
  action: "Every Hour"
}

// 2. Buscar Citas Próximas
{
  module: "Google Sheets",
  action: "Search Rows",
  params: {
    spreadsheetId: "{{CONFIG.SHEET_ID}}",
    range: "Agenda_Pacientes!A:K",
    conditions: {
      fecha: "{{formatDate(tomorrow(), 'YYYY-MM-DD')}}"
    }
  }
}

// 3. Enviar Recordatorio
{
  module: "Email",
  action: "Send",
  params: {
    to: "{{row.email}}",
    subject: "Recordatorio: Cita mañana",
    body: `
Estimado/a {{row.nombre}},

Le recordamos su cita programada para mañana:
Fecha: {{formatDate(row.fecha, 'DD/MM/YYYY')}}
Hora: {{row.hora}}

Link de Meet: {{row.link_meet}}

Por favor confirme su asistencia respondiendo este correo.

Saludos cordiales,
[Nombre del Psicólogo]
    `
  }
}
```

## 3. Configuración de Webhooks

### Endpoint para Nuevo Paciente
```javascript
{
  method: "POST",
  path: "/nueva-cita",
  handler: async (req, res) => {
    const {
      nombre,
      email,
      telefono,
      tipo,
      preferencia_horario
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !tipo) {
      return res.status(400).json({
        error: "Faltan campos requeridos"
      });
    }

    // Iniciar flujo en Make
    await make.startFlow("calendario_citas", {
      trigger: {
        type: "webhook",
        payload: req.body
      }
    });

    res.json({
      status: "success",
      message: "Solicitud de cita recibida"
    });
  }
}
```

## 4. Reglas de Negocio

```javascript
const REGLAS = {
  DURACION_PRIMERA_VEZ: 90, // minutos
  DURACION_SEGUIMIENTO: 60, // minutos
  HORARIO_INICIO: "09:00",
  HORARIO_FIN: "18:00",
  DIAS_LABORABLES: ["1", "2", "3", "4", "5"], // Lun-Vie
  TIEMPO_MINIMO_ANTICIPACION: 24, // horas
  TIEMPO_RECORDATORIO: 24, // horas antes
  MAX_CITAS_DIA: 8
};

// Verificar disponibilidad
function verificarDisponibilidad(fecha, hora) {
  // 1. Validar horario laboral
  if (!esDentroHorario(hora)) return false;
  
  // 2. Validar día laborable
  if (!esDiaLaborable(fecha)) return false;
  
  // 3. Validar cupo disponible
  return verificarCupoDisponible(fecha);
}
```
