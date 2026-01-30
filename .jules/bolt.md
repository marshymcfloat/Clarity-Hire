## 2025-05-21 - [Missing Foreign Key Indexes]
**Learning:** Prisma schema does not automatically create indexes for foreign keys (e.g., `companyId` on `Job`, `jobId` on `Application`). This causes full table scans on common relation filters.
**Action:** Always verify `prisma/schema.prisma` relations and add `@@index([foreignKey])` where filtering occurs.

## 2025-05-21 - [No Test Suite]
**Learning:** The project lacks a test suite (no `test` script, no `*.test.ts` files).
**Action:** Rely heavily on `npm run lint`, `npx prisma validate`, and manual verification. Do not attempt to run `npm test`.

## 2025-05-21 - [Composite Indexes]
**Learning:** Single-column indexes are insufficient for queries with multiple filters (e.g., `where companyId=X and status=Y`) and sorting.
**Action:** Use composite indexes (e.g., `@@index([companyId, status, createdAt])`) to cover the full query path (filter + sort) and avoid in-memory sorting.
