# pgvector Setup and Verification Guide

## Overview

This guide helps you verify and enable the pgvector extension for PostgreSQL, which is required for vector similarity search in the RAG pipeline.

---

## Step 1: Check if pgvector is Installed

### Option A: Using psql (Recommended)

```bash
# Connect to your database
psql "postgres://b60caf63e4e208b954a5bf23d1b32e15f1c87ac29914317a9589eed895f33fd7:sk_uXNCs0NvxpZwu-vLiGZPW@db.prisma.io:5432/postgres?sslmode=require"

# Check for pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

# If it returns a row, pgvector is installed ✅
# If it returns empty, you need to install it ❌
```

### Option B: Using Prisma Studio

```bash
npx prisma studio
# Navigate to the database connection
# Check if you can see vector columns working
```

### Option C: Query via Node.js

Create a test file `check-pgvector.ts`:

```typescript
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

async function checkPgvector() {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `;
    console.log("✅ pgvector extension check:", result);

    if (Array.isArray(result) && result.length > 0) {
      console.log("✅ pgvector is INSTALLED");
    } else {
      console.log("❌ pgvector is NOT installed");
    }
  } catch (error) {
    console.error("❌ Error checking pgvector:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPgvector();
```

Run it:

```bash
tsx check-pgvector.ts
```

---

## Step 2: Enable pgvector Extension

If pgvector is **not installed**, you have two options:

### Option A: Enable via Migration (Recommended)

The migration file has already been created at:
`prisma/migrations/20260209190627_enable_pgvector/migration.sql`

Just run:

```bash
npx prisma migrate deploy
```

Or manually execute the SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Option B: Enable Manually via psql

```bash
psql "postgres://YOUR_DATABASE_URL"
```

Then in the psql prompt:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
\dx vector

-- Should show:
-- Name   | Version | Schema | Description
-- -------+---------+--------+-------------
-- vector | 0.x.x   | public | vector data type...
```

---

## Step 3: Verify Vector Column Type

After enabling pgvector, verify the `Embedding` table has the correct vector column:

```bash
psql "postgres://YOUR_DATABASE_URL"
```

```sql
-- Check the column type
SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'Embedding' AND column_name = 'vector';

-- Should return:
-- column_name | data_type | udt_name
-- ------------+-----------+----------
-- vector      | USER-DEFINED | vector
```

If it shows `ARRAY` or `_float4` instead of `vector`, you need to run the new migration:

```bash
npx prisma migrate dev --name fix_vector_type
```

---

## Step 4: Test Vector Operations

Create a test file `test-vector.ts`:

```typescript
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

async function testVectorOps() {
  try {
    // Test creating a vector
    const testVector = new Array(768).fill(0).map(() => Math.random());

    // Create test data (you'll need actual resumeId, chunkId first)
    console.log("✅ Test vector generated:", testVector.length, "dimensions");

    // Test vector similarity search (cosine similarity)
    const similarityTest = await prisma.$queryRaw`
      SELECT 
        1 - (vector <=> '[${testVector.join(",")}]'::vector) as similarity
      FROM "Embedding"
      LIMIT 1;
    `;

    console.log("✅ Vector similarity search works:", similarityTest);
  } catch (error) {
    console.error("❌ Vector operations failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testVectorOps();
```

---

## Common Issues & Solutions

### Issue 1: "extension 'vector' is not available"

**Cause**: pgvector is not installed on your PostgreSQL server.

**Solution**:

- For Prisma.io managed database: Contact support to enable pgvector
- For self-hosted PostgreSQL:

  ```bash
  # Ubuntu/Debian
  sudo apt install postgresql-16-pgvector

  # macOS
  brew install pgvector

  # Then restart PostgreSQL
  sudo systemctl restart postgresql
  ```

### Issue 2: "Column 'vector' has type 'ARRAY' instead of 'vector'"

**Cause**: Migration ran before pgvector extension was enabled.

**Solution**:

```bash
# Reset and re-run migrations
npx prisma migrate reset
npx prisma migrate dev
```

### Issue 3: "Permission denied to create extension"

**Cause**: Database user doesn't have SUPERUSER privileges.

**Solution**: Ask database admin to enable pgvector, or grant privileges:

```sql
ALTER USER your_user WITH SUPERUSER;
CREATE EXTENSION vector;
ALTER USER your_user WITH NOSUPERUSER; -- Remove superuser after
```

---

## Prisma Configuration Checklist

Make sure your `schema.prisma` has:

```prisma
generator client {
  provider        = "prisma-client"
  output          = "../lib/generated/prisma"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  extensions = [pgvector(map: "vector")]
}

model Embedding {
  id             String        @id @default(cuid())
  chunkId        String        @unique
  vector         Unsupported("vector(768)") // ← This is correct
  contentHash    String
  modelVersionId String
  createdAt      DateTime      @default(now())
  DocumentChunk  DocumentChunk @relation(fields: [chunkId], references: [id], onDelete: Cascade)

  @@index([contentHash, modelVersionId])
}
```

---

## Next Steps After Verification

Once pgvector is confirmed working:

1. ✅ Run all migrations: `npx prisma migrate deploy`
2. ✅ Regenerate client: `npx prisma generate`
3. ✅ Start workers: `tsx lib/queue/init-workers.ts`
4. ✅ Test resume upload

---

## References

- [Prisma PostgreSQL Extensions Docs](https://www.prisma.io/docs/postgres/database/postgres-extensions)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [pgvector Installation Guide](https://github.com/pgvector/pgvector#installation)
