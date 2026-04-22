# Google Sheets Setup / Configuración de Google Sheets

## 🇬🇧 English

### 1. Create Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Rename to "Citas - [Tu Nombre]"
4. Copy the Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/1YOUR_SHEET_ID_HERE/edit#gid=0
                              ^^^^^^^^^^^^^^^^^ this part
   ```

### 2. Add Headers (Row 1)

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Fecha | Hora | Tipo | Estado | Duración | Nombre | Apellido | Email | Teléfono | Meet Link | Notas | Sync |

### 3. Configure in n8n

In Railway, add these environment variables to n8n:

```
GOOGLE_SHEET_ID=1YOUR_SHEET_ID_HERE
NOTIFICATION_EMAIL=tu@email.com
```

### 4. Activate Workflow

1. Open n8n → Workflows
2. Import `google-sheets-sync.json`
3. Activate the workflow

---

## 🇪🇸 Español

### 1. Crear Google Sheet

1. Ve a https://sheets.google.com
2. Crea una nueva hoja de cálculo
3. Renombrala a "Citas - [Tu Nombre]"
4. Copia el Sheet ID de la URL:
   ```
   https://docs.google.com/spreadsheets/d/1YOUR_SHEET_ID_HERE/edit#gid=0
                              ^^^^^^^^^^^^^^^^^ esta parte
   ```

### 2. Agregar Encabezados (Fila 1)

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Fecha | Hora | Tipo | Estado | Duración | Nombre | Apellido | Email | Teléfono | Meet Link | Notas | Sync |

### 3. Configurar en n8n

En Railway, agregá estas variables de entorno al n8n:

```
GOOGLE_SHEET_ID=1YOUR_SHEET_ID_HERE
NOTIFICATION_EMAIL=tu@email.com
```

### 4. Activar Workflow

1. Abrí n8n → Workflows
2. Importá `google-sheets-sync.json`
3. Activá el workflow

---

## 📊 Column Mapping / Mapeo de Columnas

| Column | DB Field |
|--------|-----------|
| A - ID | a.id |
| B - Fecha | scheduled_at (date) |
| C - Hora | scheduled_at (time) |
| D - Tipo | appointment_type |
| E - Estado | status |
| F - Duración | duration_minutes |
| G - Nombre | first_name |
| H - Apellido | last_name |
| I - Email | email |
| J - Teléfono | phone |
| K - Meet Link | google_meet_link |
| L - Notas | session_notes |
| M - Sync | sync_at |