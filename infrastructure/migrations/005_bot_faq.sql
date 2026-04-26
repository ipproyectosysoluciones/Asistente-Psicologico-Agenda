-- Sprint 5: Q&A table for bot service information (schedule, prices, location, etc.)
-- Separate from knowledge_base which stores clinical documents

CREATE TABLE IF NOT EXISTS bot_faq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    lang VARCHAR(5) NOT NULL DEFAULT 'es',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bot_faq_category_lang
  ON bot_faq (category, lang) WHERE is_active = true;

CREATE TRIGGER bot_faq_updated_at
    BEFORE UPDATE ON bot_faq
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
