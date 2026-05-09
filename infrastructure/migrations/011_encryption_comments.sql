-- Migration 011: Document PII fields and encryption status via column comments.
-- This is a review/documentation migration. No schema changes.
-- See infrastructure/runbooks/encryption-review.md for full analysis.

COMMENT ON COLUMN patients.first_name IS 'PII — plaintext; anonimizado a REDACTED por CRON de retención. Candidato a cifrado Phase 6.';
COMMENT ON COLUMN patients.last_name  IS 'PII — plaintext; anonimizado a REDACTED por CRON de retención. Candidato a cifrado Phase 6.';
COMMENT ON COLUMN patients.email      IS 'PII — plaintext; seteado a NULL por CRON de retención. UNIQUE constraint impide cifrado determinístico.';
COMMENT ON COLUMN patients.phone      IS 'PII — plaintext; seteado a NULL por CRON de retención.';
COMMENT ON COLUMN patients.date_of_birth IS 'PII — plaintext. Candidato a cifrado Phase 6.';

COMMENT ON COLUMN psychologists.password_hash IS 'Cifrado: bcrypt via pgcrypto gen_salt(bf). No reversible.';

COMMENT ON COLUMN audit_log.old_data IS 'JSONB — puede contener PII de rows auditadas. Brecha conocida: persiste después de anonimización. Remediar en Phase 6.';
COMMENT ON COLUMN audit_log.new_data IS 'JSONB — puede contener PII de rows auditadas. Brecha conocida: persiste después de anonimización. Remediar en Phase 6.';
