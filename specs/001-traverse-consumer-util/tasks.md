# Tasks: Directory Traverse Consumer Utility

**Input**: `specs/001-traverse-consumer-util/plan.md`, `specs/001-traverse-consumer-util/spec.md`, `specs/001-traverse-consumer-util/data-model.md`, `specs/001-traverse-consumer-util/research.md`

**Tests**: Included — required by Constitution (III. Test-First / TDD) and explicitly requested in spec FR-006.

**Organization**: Tasks grouped by user story. The package `packages/blog-builder` is already set up (TypeScript, Vitest, ESM); no new tooling setup is required.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Define the `Consumer` interface — required by `traverse` (US1) and `ConsumerLogger` (US2) and needed to write tests for either story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Define and export the `Consumer` interface (with `consume(dirPath: string): void`) in `packages/blog-builder/src/utils/Traverse.ts`

**Checkpoint**: `Consumer` interface exists — both US1 and US2 can now proceed in parallel.

---

## Phase 2: User Story 1 — Traverse Subdirectories with Consumers (Priority: P1) 🎯 MVP

**Goal**: A `traverse` function that reads qualifying direct subdirectories (names matching `^\d{6}-`) from a root path, sorts them alphabetically, and invokes each registered consumer once per subdirectory with the full path.

**Independent Test**: `npm run test -w @blog/blog-builder` — all `traverse` unit tests green; non-qualifying dirs and files produce zero consumer calls.

### Tests for User Story 1 ⚠️ Write FIRST — ensure they FAIL before implementation

- [x] T002 [US1] Write failing unit tests for `traverse` in `packages/blog-builder/src/__test__/Traverse.test.ts`:
  - `given` 3 qualifying subdirs, `when` traverse called, `then` consumer invoked 3× in alphabetical order
  - `given` qualifying + non-qualifying subdirs (e.g. `expected-full`), `when` traverse called, `then` non-qualifying dirs are not passed to consumers
  - `given` root with files alongside subdirs, `when` traverse called, `then` files are not passed to consumers
  - `given` empty consumers array, `when` traverse called, `then` no error is raised

### Implementation for User Story 1

- [x] T003 [US1] Implement `traverse(rootDir: string, consumers: Consumer[]): void` in `packages/blog-builder/src/utils/Traverse.ts` using `readdirSync` with `withFileTypes: true`, filtering by `isDirectory() && /^\d{6}-.+`, sorting ascending, and calling each consumer with the full joined path (depends on T002 tests being red)

**Checkpoint**: User Story 1 fully functional — run `npm run test -w @blog/blog-builder` to verify all T002 cases are green.

---

## Phase 3: User Story 2 — Log the Directory Name from a Path (Priority: P2)

**Goal**: A `ConsumerLogger` class that implements `Consumer` and logs only the `basename` of the received path via an injected logger (defaulting to `console`).

**Independent Test**: `npm run test -w @blog/blog-builder` — `ConsumerLogger` unit test green; only directory name (not full path) appears in log output.

### Tests for User Story 2 ⚠️ Write FIRST — ensure they FAIL before implementation

- [x] T004 [P] [US2] Write failing unit test for `ConsumerLogger` in `packages/blog-builder/src/__test__/Traverse.test.ts`:
  - `given` a `ConsumerLogger` with a mock logger, `when` `consume` called with a full path, `then` only the `basename` is passed to `logger.log`

### Implementation for User Story 2

- [x] T005 [P] [US2] Implement `ConsumerLogger` class in `packages/blog-builder/src/utils/ConsumerLogger.ts` — constructor accepts optional `{ log: (msg: string) => void }` (defaults to `console`); `consume` calls `logger.log(basename(dirPath))` (depends on T004 test being red)

**Checkpoint**: User Story 2 fully functional — both US1 and US2 tests green.

---

## Phase 4: User Story 3 — Verified Integration Test (Priority: P3)

**Goal**: An integration test that runs `traverse` against the real `sample-posts` fixture with a `ConsumerLogger` and asserts exactly the three expected directory names, confirming end-to-end correctness and that `expected-full` is excluded.

**Independent Test**: `npm run test -w @blog/blog-builder` — integration test asserts logger received exactly `['251013-some-description', '251014-some-other-description', '251015-third-description']`.

- [x] T006 [US3] Write integration test in `packages/blog-builder/src/__test__/Traverse.test.ts` — `given` the `sample-posts` fixture, `when` `traverse` is called with a `ConsumerLogger`, `then` `logger.log` was called exactly 3 times with values `['251013-some-description', '251014-some-other-description', '251015-third-description']` in that order (use `dirname` + `fileURLToPath` for `__dirname`; assert with `toEqual` on the full recorded call list)

**Checkpoint**: All three user stories independently verified. Full test suite green.

---

## Phase 5: Verify

- [x] T007 Run `npm run verify -w @blog/blog-builder` from repo root — `typecheck` and `test` both pass with zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on T001 (Consumer interface) — BLOCKS nothing else once T001 done
- **US2 (Phase 3)**: Depends on T001 (Consumer interface) — can run in parallel with US1 after T001
- **US3 (Phase 4)**: Depends on US1 (T003) and US2 (T005) complete — integration test requires both
- **Verify (Phase 5)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Requires T001 only
- **US2 (P2)**: Requires T001 only — independent of US1, can start in parallel
- **US3 (P3)**: Requires US1 + US2 complete

### TDD Order Within Each Story

1. Write test (red) → confirm it fails
2. Implement production code (green) → confirm test passes
3. Refactor if needed → confirm still green

### Parallel Opportunities

- T004 [P] and T005 [P] (US2 tests + implementation) can be worked alongside US1 work after T001 is done
- US1 and US2 are in separate files and have no cross-dependency after T001

---

## Parallel Example: After T001 complete

```text
Developer A: T002 → T003  (US1 — traverse function)
Developer B: T004 → T005  (US2 — ConsumerLogger)
→ Both complete → T006 → T007
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. T001 — define `Consumer` interface
2. T002 — write failing traverse tests
3. T003 — implement traverse
4. **STOP & VALIDATE**: `npm run test -w @blog/blog-builder`

### Full Delivery (All Stories)

1. T001 — foundation
2. T002 → T003 — traverse (US1)
3. T004 → T005 — ConsumerLogger (US2)
4. T006 — integration test (US3)
5. T007 — full verify

---

## Notes

- All files use `.ts` extension in imports (enforced by `allowImportingTsExtensions`)
- `given / when / then` comment structure required in every test case (Constitution III)
- No new `npm install` needed — `node:fs` and `node:path` are Node.js stdlib
- `Consumer` is defined in `Traverse.ts` (not a separate file) to keep the contract co-located with the function that uses it
- `ConsumerLogger` imports `Consumer` from `../utils/Traverse.ts`
