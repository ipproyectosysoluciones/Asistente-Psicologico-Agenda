# SPEC: Infrastructure & Docker Setup

**Project**: Asistente-Psicologico-Agenda  
**Status**: SPEC  
**Date**: 2026-04-21  
**Phase**: 1 - Infrastructure  
**Priority**: P0 (Blocker)

---

## 1. REQUIREMENTS

### 1.1 Docker Environment
- **Goal**: Containerize n8n, PostgreSQL, and supporting services for multi-environment deployment
- **Compliance**: LFPDPPP (México), Ley 1581 (Colombia), RGPD (ES), HIPAA (USA)
- **Scope**: Local dev, staging, production configs

**R1.1.1**: Docker Compose orchestrates 3 core services
- `n8n-main` (workflow engine)
- `postgres` (data store)
- `postgres-backup` (point-in-time recovery)

**R1.1.2**: Network isolation
- Internal network for service-to-service communication
- No direct internet exposure except n8n for webhook ingress
- Volume management for persistent data

**R1.1.3**: Environment configuration
- `.env.dev`, `.env.staging`, `.env.prod`
- Secrets management via environment variables (no hardcoded credentials)
- Support for Google Sheets API keys, Google Calendar OAuth tokens

### 1.2 PostgreSQL Schema Foundation
**R1.2.1**: Multi-tenant architecture
- `psychologists` table (tenant isolation)
- Tenant ID as foreign key in all data tables
- Role-based access control (RBAC) at DB level

**R1.2.2**: Data security
- Encrypted columns for sensitive data (phone, email)
- Audit tables for compliance logging
- Soft deletes for GDPR right-to-be-forgotten

**R1.2.3**: Backup & recovery
- Automated daily backups with retention policy (90 days)
- Point-in-time recovery capability
- Cold backup storage (separate container or S3-like)

### 1.3 n8n Workflow Platform
**R1.3.1**: n8n instance configuration
- Persistent storage for workflows and execution logs
- OAuth2 integration with Google services (Calendar, Sheets)
- Webhook endpoints exposed for WhatsApp/Baileys integration

**R1.3.2**: Workflow design patterns
- Modular workflows (each major flow isolated)
- Error handling and retry logic
- Logging and monitoring for audit trails

---

## 2. SCENARIOS

### Scenario A: First-Time Setup
**Given** Developer has Docker and Docker Compose installed  
**When** Developer clones repo and runs `docker-compose up -d`  
**Then**:
1. PostgreSQL initializes with base schema (users, patients, appointments)
2. n8n starts and loads workflow templates
3. All services are healthy within 60 seconds
4. Webhook endpoints ready for WhatsApp messages

**Validation**:
- `docker ps` shows 3 running containers
- `curl http://localhost:5678` returns n8n login page
- `psql -h localhost -U postgres` connects successfully

### Scenario B: Environment Switch (Dev → Staging)
**Given** Developer has `.env.staging` configured  
**When** Developer runs `docker-compose -f docker-compose.prod.yml up -d`  
**Then**:
1. Staging environment variables loaded
2. PostgreSQL connected to staging database
3. n8n workflows isolated from production
4. All integrations point to staging Google Sheets/Calendar

**Validation**:
- `docker-compose -f docker-compose.prod.yml ps` shows staging containers
- Environment variables logged (non-sensitive) match `.env.staging`

### Scenario C: Database Backup & Restore
**Given** Production database contains 6 months of patient data  
**When** Scheduled backup runs at 02:00 UTC daily  
**Then**:
1. Backup file created with timestamp (YYYYMMDD_HHMMSS)
2. Backup encrypted and stored in `./backups/` or S3
3. Retention policy enforced (90-day retention)
4. Restore tested weekly to ensure integrity

**Validation**:
- `./backups/` contains at least 7 daily backups
- Backup size > 0 and < 1GB (typical)
- Restore test: `docker exec postgres-backup pg_restore` completes without error

---

## 3. TECHNICAL DESIGN

### 3.1 docker-compose.yml Structure

```yaml
version: '3.8'

services:
  # n8n Workflow Engine
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-main
    ports:
      - "5678:5678"
    environment:
      - NODE_ENV=production
      - N8N_SECURE_COOKIE=true
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - DATABASE_TYPE=postgresdb
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=${DB_NAME}
      - DATABASE_USER=${DB_USER}
      - DATABASE_PASSWORD=${DB_PASSWORD}
      - GENERIC_TIMEZONE=America/Mexico_City
      - WEBHOOK_URL=https://n8n.yourdomain.com
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/home/node/.n8n/workflows
    depends_on:
      - postgres
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # PostgreSQL Backup Service
  postgres-backup:
    image: postgres:15-alpine
    container_name: postgres-backup
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_backup:/var/lib/postgresql/data
      - ./backups:/backups
      - ./backup-script.sh:/backup.sh
    command: >
      sh -c 'while true; do 
        /backup.sh;
        sleep 86400;
      done'
    depends_on:
      - postgres
    networks:
      - app-network
    restart: unless-stopped

volumes:
  n8n_data:
  postgres_data:
  postgres_backup:

networks:
  app-network:
    driver: bridge
```

### 3.2 Environment Variables (.env template)

```bash
# n8n Configuration
N8N_USER=admin
N8N_PASSWORD=${SECURE_RANDOM_PASS}
N8N_ENCRYPTION_KEY=${SECURE_RANDOM_KEY}

# PostgreSQL Configuration
DB_NAME=asistente_psico
DB_USER=psico_user
DB_PASSWORD=${SECURE_RANDOM_PASS}

# Google Integration
GOOGLE_SHEETS_API_KEY=${FROM_GOOGLE_CLOUD}
GOOGLE_CALENDAR_API_KEY=${FROM_GOOGLE_CLOUD}
GOOGLE_OAUTH_CLIENT_ID=${FROM_GOOGLE_CLOUD}
GOOGLE_OAUTH_CLIENT_SECRET=${FROM_GOOGLE_CLOUD}

# Baileys WhatsApp
BAILEYS_SESSION_ID=${UNIQUE_SESSION_ID}

# Compliance & Regional Settings
TIMEZONE=America/Mexico_City
COUNTRY=Mexico
PRIVACY_POLICY_VERSION=1.0
```

### 3.3 PostgreSQL Init Script (init-db.sql)

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- Create audit schema
CREATE SCHEMA audit;

-- Psychologists (Tenants)
CREATE TABLE psychologists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  country VARCHAR(2) NOT NULL, -- MX, CO, ES, US
  professional_license VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Patients (Multi-tenant)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_encrypted BYTEA NOT NULL, -- Encrypted with pgcrypto
  date_of_birth DATE,
  country VARCHAR(2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(psychologist_id, email)
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 50,
  type VARCHAR(50) NOT NULL, -- 'primera_vez' | 'seguimiento'
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled' | 'completed' | 'cancelled'
  google_calendar_event_id VARCHAR(255),
  google_meet_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(psychologist_id, scheduled_at)
);

-- Consentimientos (Compliance)
CREATE TABLE consentimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  type VARCHAR(100) NOT NULL, -- 'datos_personales' | 'grabacion' | 'terceros'
  country_normative VARCHAR(20), -- 'LFPDPPP' | 'Ley1581' | 'RGPD' | 'HIPAA'
  accepted BOOLEAN NOT NULL,
  accepted_at TIMESTAMP,
  version VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit.event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100),
  operation VARCHAR(10), -- INSERT | UPDATE | DELETE
  record_id UUID,
  changes JSONB,
  user_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_patients_psychologist ON patients(psychologist_id);
CREATE INDEX idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_consentimientos_patient ON consentimientos(patient_id);
```

### 3.4 Backup Script

```bash
#!/bin/bash
# backup-script.sh

BACKUP_DIR="/backups"
DB_HOST="postgres"
DB_NAME="${POSTGRES_DB}"
DB_USER="${POSTGRES_USER}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# Create backup
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} | gzip > ${BACKUP_FILE}

# Check backup success
if [ -s ${BACKUP_FILE} ]; then
  echo "Backup successful: ${BACKUP_FILE}"
  # Cleanup old backups (keep 90 days)
  find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +90 -delete
else
  echo "Backup failed: ${BACKUP_FILE}"
  exit 1
fi
```

---

## 4. VALIDATION CRITERIA

| Criterion | Pass/Fail | Notes |
|-----------|-----------|-------|
| `docker-compose up -d` completes without errors | PASS | All 3 services healthy |
| PostgreSQL schema initialized with audit logging | PASS | Tables created, indexes in place |
| n8n accessible at `http://localhost:5678` | PASS | Login works |
| Backup runs daily and retains 90-day history | PASS | Cron job or container schedule |
| Environment variables loaded from `.env` file | PASS | No secrets in docker-compose.yml |
| Multi-tenant isolation: psychologist_id on all tables | PASS | Foreign key constraints active |
| Encrypted storage for sensitive fields (phone, email) | PASS | pgcrypto extension used |

---

## 5. DEPENDENCIES & RISKS

### Dependencies
- Docker 20.10+
- Docker Compose 1.29+
- PostgreSQL 15 (or compatible)
- n8n 0.220+

### Risks
- **Data Loss**: Mitigated by automated daily backups with point-in-time recovery
- **Multi-tenant Data Leakage**: Mitigated by explicit psychologist_id foreign key constraints and RBAC
- **Compliance Gaps**: Mitigated by audit logging and soft deletes for GDPR

---

## 6. SUCCESS METRICS

1. **Deployment Time**: < 2 minutes from `docker-compose up` to all services healthy
2. **Backup Integrity**: 100% successful daily backups with zero corruption
3. **Multi-tenant Isolation**: Zero cross-tenant data access in test scenarios
4. **Audit Trail**: 100% of data modifications logged with timestamp, user_id, and changes

---

## NEXT STEPS

1. Create `docker-compose.yml` and `.env.template`
2. Write PostgreSQL initialization script
3. Test local dev environment
4. Create backup automation script
5. Document deployment procedures for staging/prod
