# Tasks: Digest Util (blog-builder)

**Input**: `specs/001-digest-util/plan.md`, `specs/001-digest-util/spec.md`

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create `package.json` at repo root with npm workspaces config
- [x] T002 Create `tsconfig.json` at repo root (base strict TypeScript config)
- [x] T003 [P] Create `packages/blog-builder/package.json` (ESM, vitest, typescript devDeps)
- [x] T004 [P] Create `packages/blog-builder/tsconfig.json` (extends root)
- [x] T005 [P] Create `packages/blog-builder/vitest.config.ts`

---

## Phase 2: User Story 1 - Digest processes a file path (Priority: P1)

**Goal**: A `Digest` class that logs the received path and returns a typed empty object.

**Independent Test**: `npm run test -w @blog/blog-builder` — logger spy assertion passes.

### Tests for User Story 1 ⚠️ Write FIRST — ensure they FAIL before implementation

- [x] T006 [US1] Write `packages/blog-builder/src/__test__/Digest.test.ts` — spy on injected logger, assert `log` called with path

### Implementation for User Story 1

- [x] T007 [US1] Define `PostMetadata` and `Logger` interfaces in `packages/blog-builder/src/utils/Digest.ts`
- [x] T008 [US1] Implement `Digest` class with constructor injection and `process` method

---

## Phase 3: Install & Verify

- [x] T009 Run `npm install` from repo root (installs all workspace devDependencies)
- [x] T010 Run `npm run verify -w @blog/blog-builder` — all tests green, typecheck passes
