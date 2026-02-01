## 2025-05-21 - [Missing Foreign Key Indexes]
**Learning:** Prisma schema does not automatically create indexes for foreign keys (e.g., `companyId` on `Job`, `jobId` on `Application`). This causes full table scans on common relation filters.
**Action:** Always verify `prisma/schema.prisma` relations and add `@@index([foreignKey])` where filtering occurs.

## 2025-05-21 - [No Test Suite]
**Learning:** The project lacks a test suite (no `test` script, no `*.test.ts` files).
**Action:** Rely heavily on `npm run lint`, `npx prisma validate`, and manual verification. Do not attempt to run `npm test`.

## 2025-05-21 - [Composite Indexes]
**Learning:** Single-column indexes are insufficient for queries with multiple filters (e.g., `where companyId=X and status=Y`) and sorting.
**Action:** Use composite indexes (e.g., `@@index([companyId, status, createdAt])`) to cover the full query path (filter + sort) and avoid in-memory sorting.

## 2025-05-21 - [Prisma CLI Version Pinning]
**Learning:** Running `npx prisma` uses the latest version (e.g., v7.x), which may be incompatible with the project's `schema.prisma` (e.g., deprecating `datasource url`). The project uses v5.x.
**Action:** Always use `npx prisma@<version>` matching `package.json` to ensure compatibility and avoid validation errors.

## 2025-05-21 - [Optimized Data Selection]
**Learning:** `prisma.findMany` selects all fields by default, which is wasteful for list views.
**Action:** Use `select` to fetch only necessary fields and use `Prisma.ModelGetPayload` to define strict types for the selected data.
