-- Enable pgvector extension
-- This migration enables the pgvector extension for vector similarity search

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;
