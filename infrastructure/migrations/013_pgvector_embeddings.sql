-- Migration 013: pgvector extension + knowledge embeddings table
-- Sprint W21 — AI Layer
-- Requires: pgvector 0.8.2 (available on Railway PostgreSQL)

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    source_path TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- IVFFlat index for cosine similarity search
-- lists=100 appropriate for ~800 chunks (40 PDFs × ~20 chunks avg)
CREATE INDEX IF NOT EXISTS knowledge_embeddings_embedding_idx
    ON knowledge_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Partial unique index for idempotent ingestion
CREATE UNIQUE INDEX IF NOT EXISTS knowledge_embeddings_source_chunk_idx
    ON knowledge_embeddings (source_path, chunk_index);
