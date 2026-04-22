# SPEC: Implementation Roadmap & Phased Delivery

**Project**: Asistente-Psicologico-Agenda  
**Status**: SPEC  
**Date**: 2026-04-21  
**Duration**: 5 phases, ~16-20 weeks  
**Priority**: P0

---

## 1. PHASE OVERVIEW

| Phase | Duration | Goal | Deliverables |
|-------|----------|------|--------------|
| 1 | Weeks 1-3 | Infrastructure & Database | Docker, PostgreSQL, n8n setup |
| 2 | Weeks 4-7 | BuilderBot Flows | WhatsApp registration, booking |
| 3 | Weeks 8-11 | Calendar/Sheets Integration | Google Calendar, automated reporting |
| 4 | Weeks 12-15 | Clinical History Module | 14-section HC with versioning |
| 5 | Weeks 16-20 | Multi-Therapist & Polish | RBAC, multi-tenant, production hardening |

---

## 2. PHASE 1: INFRASTRUCTURE (Weeks 1-3)

### 2.1 Goals
- Containerized development environment
- PostgreSQL with audit logging
- n8n workflow engine running
- Multi-tenant foundation

### 2.2 Tasks

**Week 1:**
- [ ] Task 1.1: Create `docker-compose.yml` with n8n, PostgreSQL, backup services
- [ ] Task 1.2: Write PostgreSQL initialization script (`init-db.sql`)
- [ ] Task 1.3: Create `.env.template` with all required variables
- [ ] Task 1.4: Write backup automation script
- [ ] Task 1.5: Document deployment procedure

**Week 2:**
- [ ] Task 1.6: Test `docker-compose up` → all services healthy
- [ ] Task 1.7: Verify PostgreSQL data persistence across restarts
- [ ] Task 1.8: Test backup creation and restore process
- [ ] Task 1.9: Configure n8n persistence and OAuth for Google
- [ ] Task 1.10: Create health check endpoints

**Week 3:**
- [ ] Task 1.11: Load DSM-5 reference data into diagnosis table
- [ ] Task 1.12: Create database views for HC retrieval
- [ ] Task 1.13: Write audit logging trigger function
- [ ] Task 1.14: Test multi-tenant isolation (write tests)
- [ ] Task 1.15: Staging environment setup

### 2.3 Deliverables
- ✅ `docker-compose.yml` (dev, staging, prod variants)
- ✅ PostgreSQL schema with 14 HC sections + audit
- ✅ Backup automation working
- ✅ Test suite for schema integrity
- ✅ Documentation: Setup & Deploy guides

### 2.4 Success Criteria
- `docker-compose up -d` → all services healthy in < 60s
- Data persists across container restarts
- Backup integrity verified
- PostgreSQL audit log captures all DML operations

---

## 3. PHASE 2: BUILDERBOT FLOWS (Weeks 4-7)

### 3.1 Goals
- WhatsApp integration live
- Patient registration flow working
- Appointment booking functional
- Consent management integrated

### 3.2 Tasks

**Week 4:**
- [ ] Task 2.1: Set up Baileys (WhatsApp) or commercial provider
- [ ] Task 2.2: Create BuilderBot project structure
- [ ] Task 2.3: Design & implement "Menu Principal" flow
- [ ] Task 2.4: Design & implement "Registration" flow
- [ ] Task 2.5: Create webhook endpoints for BuilderBot callbacks

**Week 5:**
- [ ] Task 2.6: Implement patient creation webhook (`POST /api/patients`)
- [ ] Task 2.7: Create consentimientos record on registration
- [ ] Task 2.8: Test registration flow end-to-end
- [ ] Task 2.9: Implement error handling and retry logic
- [ ] Task 2.10: Create unit tests for flow logic

**Week 6:**
- [ ] Task 2.11: Design & implement "Appointment Booking" flow
- [ ] Task 2.12: Create appointment creation webhook
- [ ] Task 2.13: Test appointment booking with sample data
- [ ] Task 2.14: Implement flow context persistence
- [ ] Task 2.15: Add navigation (back, menu, restart)

**Week 7:**
- [ ] Task 2.16: End-to-end testing (registration → booking)
- [ ] Task 2.17: Performance testing (response times < 2s)
- [ ] Task 2.18: Create user testing guide
- [ ] Task 2.19: Deploy to staging WhatsApp number
- [ ] Task 2.20: Gather feedback and iterate

### 3.3 Deliverables
- ✅ BuilderBot flows (YAML definitions)
- ✅ Webhook endpoints for flow callbacks
- ✅ Baileys/WhatsApp integration configured
- ✅ Flow simulator tests
- ✅ User manual for testers

### 3.4 Success Criteria
- Patient can register via WhatsApp (name, email, phone, country)
- Patient can book appointment (sees available slots, confirms)
- Confirmation sent via WhatsApp + email
- No data loss on flow restart or error

---

## 4. PHASE 3: CALENDAR & SHEETS (Weeks 8-11)

### 4.1 Goals
- Google Calendar integration fully working
- Automated appointment scheduling
- Daily sync to Google Sheets
- Reporting metrics calculated

### 4.2 Tasks

**Week 8:**
- [ ] Task 3.1: Set up Google Calendar API authentication
- [ ] Task 3.2: Implement slot availability checker (check calendar conflicts)
- [ ] Task 3.3: Create n8n `agendamiento-flow` workflow
- [ ] Task 3.4: Test Google Calendar event creation
- [ ] Task 3.5: Test Meet link generation

**Week 9:**
- [ ] Task 3.6: Implement appointment confirmation via email
- [ ] Task 3.7: Set up Google Sheets API authentication
- [ ] Task 3.8: Create `google-sheets-sync` workflow (daily 22:00)
- [ ] Task 3.9: Map appointments → Agenda_Pacientes sheet
- [ ] Task 3.10: Calculate session counts and revenue

**Week 10:**
- [ ] Task 3.11: Implement `recordatorios` workflow (24h + 1h reminders)
- [ ] Task 3.12: Test reminder delivery (WhatsApp + email)
- [ ] Task 3.13: Create retention policy enforcement (GDPR compliance)
- [ ] Task 3.14: Test multi-psychologist isolation (separate calendars)
- [ ] Task 3.15: Performance tune: calendar queries

**Week 11:**
- [ ] Task 3.16: End-to-end testing (book → calendar → reminder → email)
- [ ] Task 3.17: Load testing (100 concurrent bookings)
- [ ] Task 3.18: Document API integrations
- [ ] Task 3.19: Deploy to staging
- [ ] Task 3.20: Gather feedback

### 4.3 Deliverables
- ✅ n8n workflows (agendamiento-flow, recordatorios, google-sheets-sync)
- ✅ Google Calendar integration
- ✅ Google Sheets sync script
- ✅ Email template library
- ✅ Integration test suite

### 4.4 Success Criteria
- Appointment booked → Google Calendar event created instantly
- Meet link generated and included in confirmation
- Daily sync to Google Sheets runs without errors
- Reminders sent at 24h and 1h before appointment
- No calendar conflicts

---

## 5. PHASE 4: CLINICAL HISTORY (Weeks 12-15)

### 5.1 Goals
- 14-section clinical history form complete
- Versioning and history tracking
- DSM-5 diagnosis selection
- PDF generation capability

### 5.2 Tasks

**Week 12:**
- [ ] Task 4.1: Design & implement "HC Entry" BuilderBot flow
- [ ] Task 4.2: Implement all 14 sections as flow branches
- [ ] Task 4.3: Create HC form submission webhook
- [ ] Task 4.4: Implement section versioning (is_current logic)
- [ ] Task 4.5: Test HC form submission end-to-end

**Week 13:**
- [ ] Task 4.6: Create HC retrieval API (view full HC for psychologist)
- [ ] Task 4.7: Implement PDF generation from HC data
- [ ] Task 4.8: Add DSM-5 code search/autocomplete
- [ ] Task 4.9: Create HC history viewer (show version timeline)
- [ ] Task 4.10: Test version tracking

**Week 14:**
- [ ] Task 4.11: Implement HC data validation per section
- [ ] Task 4.12: Create HC summary generation
- [ ] Task 4.13: Test multi-language support (Spanish/English)
- [ ] Task 4.14: Performance tune: HC retrieval
- [ ] Task 4.15: Create HC export to PDF

**Week 15:**
- [ ] Task 4.16: End-to-end testing (appointment → HC entry → retrieval)
- [ ] Task 4.17: Compliance review (14 sections per APA/DSM-5)
- [ ] Task 4.18: Create user guide for HC completion
- [ ] Task 4.19: Deploy to staging
- [ ] Task 4.20: Gather feedback

### 5.3 Deliverables
- ✅ HC flow definitions (all 14 sections)
- ✅ HC submission webhook
- ✅ HC retrieval & viewing UI
- ✅ PDF generation capability
- ✅ DSM-5 reference data loaded

### 5.4 Success Criteria
- Patient can complete all 14 HC sections via BuilderBot
- HC sections versioned and retrievable
- Psychologist can view full HC with history
- PDF exports correctly formatted
- DSM-5 codes validated on submission

---

## 6. PHASE 5: MULTI-THERAPIST & PRODUCTION (Weeks 16-20)

### 6.1 Goals
- Full multi-tenant support (multiple psychologists)
- Role-based access control (RBAC)
- Admin dashboard
- Production hardening

### 6.2 Tasks

**Week 16:**
- [ ] Task 5.1: Implement psychologist authentication & login
- [ ] Task 5.2: Create psychologist management endpoints (CRUD)
- [ ] Task 5.3: Implement multi-tenant data isolation tests
- [ ] Task 5.4: Create psychologist admin dashboard
- [ ] Task 5.5: Set up rate limiting on all endpoints

**Week 17:**
- [ ] Task 5.6: Implement RBAC (roles: admin, psychologist, patient, assistant)
- [ ] Task 5.7: Add audit logging for all user actions
- [ ] Task 5.8: Implement data export functionality (GDPR compliance)
- [ ] Task 5.9: Create backup verification test
- [ ] Task 5.10: Set up monitoring & alerting

**Week 18:**
- [ ] Task 5.11: Implement compliance dashboard (LFPDPPP, Ley1581, RGPD, HIPAA)
- [ ] Task 5.12: Create retention policy enforcement (automatic deletion)
- [ ] Task 5.13: Add encryption for sensitive fields review
- [ ] Task 5.14: Create disaster recovery runbook
- [ ] Task 5.15: Performance optimize database queries

**Week 19:**
- [ ] Task 5.16: Load testing (1000 concurrent users)
- [ ] Task 5.17: Security audit (OWASP top 10)
- [ ] Task 5.18: Penetration testing
- [ ] Task 5.19: Create production deployment checklist
- [ ] Task 5.20: Document runbooks (ops, troubleshooting)

**Week 20:**
- [ ] Task 5.21: Final QA and testing
- [ ] Task 5.22: Create user onboarding documentation
- [ ] Task 5.23: Set up production monitoring & logging
- [ ] Task 5.24: Train psychologists on system usage
- [ ] Task 5.25: Launch to production

### 6.3 Deliverables
- ✅ Psychologist authentication & login
- ✅ Admin dashboard
- ✅ RBAC implementation
- ✅ Compliance reporting dashboard
- ✅ Monitoring & alerting setup
- ✅ Production deployment runbook

### 6.4 Success Criteria
- Multiple psychologists can operate independently
- No cross-tenant data leakage
- Admin dashboard shows system health
- Compliance metrics automated
- System can handle 1000 concurrent users

---

## 7. MILESTONES & GATES

### 7.1 Phase 1 Gate (End of Week 3)
**Entry Criteria**: All Phase 1 tasks complete  
**Exit Criteria**:
- ✅ All Docker containers healthy
- ✅ PostgreSQL persists data
- ✅ Backup/restore works
- ✅ Schema tests pass
- ✅ Code merged to main branch

**Gate Decision**: Go/No-go to Phase 2

### 7.2 Phase 2 Gate (End of Week 7)
**Entry Criteria**: Phase 1 complete + Phase 2 tasks done  
**Exit Criteria**:
- ✅ Patient can register via WhatsApp
- ✅ Patient can book appointment
- ✅ Confirmation emails received
- ✅ Flow tests pass
- ✅ Staging environment live

**Gate Decision**: Go/No-go to Phase 3

### 7.3 Phase 3 Gate (End of Week 11)
**Entry Criteria**: Phase 1-2 complete + Phase 3 tasks done  
**Exit Criteria**:
- ✅ Appointments sync to Google Calendar
- ✅ Meet links generated
- ✅ Reminders sent reliably
- ✅ Google Sheets updated daily
- ✅ No calendar conflicts

**Gate Decision**: Go/No-go to Phase 4

### 7.4 Phase 4 Gate (End of Week 15)
**Entry Criteria**: Phase 1-3 complete + Phase 4 tasks done  
**Exit Criteria**:
- ✅ All 14 HC sections complete
- ✅ HC versioning working
- ✅ PDF export works
- ✅ DSM-5 codes validated
- ✅ Compliance review passed

**Gate Decision**: Go/No-go to Phase 5

### 7.5 Phase 5 Gate (End of Week 20)
**Entry Criteria**: Phase 1-4 complete + Phase 5 tasks done  
**Exit Criteria**:
- ✅ Multi-tenant isolation verified
- ✅ RBAC working
- ✅ Load test passed (1000 users)
- ✅ Security audit passed
- ✅ Production runbook approved

**Gate Decision**: Go-live to production

---

## 8. DEPENDENCIES & RISKS

### 8.1 External Dependencies
- Google Calendar API availability
- Google Sheets API availability
- WhatsApp/Baileys stability
- Email delivery service (SendGrid, etc.)

### 8.2 Key Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Google Calendar API rate limits | Medium | High | Implement caching, queue system |
| Baileys WhatsApp instability | High | High | Fallback to commercial WhatsApp Business API |
| Data encryption performance | Low | Medium | Pre-test with large datasets |
| Multi-tenant data leakage | Low | Critical | Extensive testing, security audit |
| Compliance gaps (GDPR/HIPAA) | Medium | Critical | Legal review, documentation |

### 8.3 Contingency Plans
- **Google Calendar unavailable**: Queue appointments, retry with exponential backoff
- **WhatsApp integration fails**: Switch to SMS or email fallback
- **Data leakage discovered**: Immediate audit, notification, rollback capability
- **Performance bottleneck**: Database query optimization, caching layer (Redis)

---

## 9. RESOURCE ALLOCATION

### 9.1 Team Structure (Recommended)

| Role | Count | Weeks 1-3 | Weeks 4-7 | Weeks 8-11 | Weeks 12-15 | Weeks 16-20 |
|------|-------|----------|----------|----------|-----------|-----------|
| Backend Engineer | 1 | 100% | 50% | 50% | 50% | 100% |
| BuilderBot Dev | 1 | 0% | 100% | 50% | 50% | 0% |
| QA/Test Engineer | 1 | 50% | 50% | 100% | 100% | 100% |
| DevOps/Infrastructure | 1 | 100% | 25% | 25% | 0% | 50% |
| Tech Lead/Architect | 1 | 100% | 100% | 100% | 100% | 100% |

### 9.2 Tools & Services Required
- Docker & Docker Compose
- n8n Cloud or Self-hosted
- PostgreSQL (managed or self-hosted)
- Google Cloud Project (Calendar, Sheets APIs)
- WhatsApp Business API account
- SendGrid or similar for email
- GitHub (version control)
- Slack (team communication)

---

## 10. SUCCESS METRICS

### 10.1 Technical Metrics
- **Uptime**: > 99.5% (Phase 5 onwards)
- **Response Time**: < 500ms (p95)
- **Appointment Booking Time**: < 2 minutes (end-to-end)
- **Error Rate**: < 0.1%
- **Backup Success Rate**: 100%

### 10.2 Business Metrics
- **Patient Onboarding**: < 5 minutes via WhatsApp
- **Appointment Confirmation Rate**: > 95%
- **No-show Rate**: < 10% (with reminders)
- **Patient Satisfaction**: > 4.5/5 (NPS)
- **Revenue Visibility**: Real-time in Google Sheets

---

## 11. NEXT STEPS

1. **Immediate** (Today):
   - Approve roadmap
   - Allocate team resources
   - Set up GitHub repo with branch strategy

2. **Week 1**:
   - Kick off Phase 1
   - Create Docker infrastructure
   - Begin PostgreSQL schema implementation

3. **Ongoing**:
   - Weekly status updates
   - Phase gates review
   - Risk monitoring & mitigation

---

## APPENDIX: Template Artifacts

### A. Weekly Status Report Template
```
Week: [X]
Phase: [Y]
Status: 🟢 On Track | 🟡 At Risk | 🔴 Off Track

Completed Tasks:
- Task [X.Y]: [Description] ✅

In Progress:
- Task [X.Z]: [Description] (80% complete)

Blockers:
- [Description] → Mitigation: [Action]

Metrics:
- Velocity: [Tasks/week]
- Quality: [Test pass rate]
```

### B. Phase Gate Checklist Template
```
Phase: [X]
Gate Review Date: [Date]
Reviewer: [Name]

✅ All tasks complete
✅ All tests passing
✅ Documentation updated
✅ Code reviewed
✅ Staging environment live
✅ No critical blockers

Decision: ✅ APPROVED | ❌ HOLD (reason)
Next Phase Start: [Date]
```
