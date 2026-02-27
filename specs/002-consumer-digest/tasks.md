# Tasks: ConsumerDigest — Metadata-File Writer Consumer

**Input**: `specs/002-consumer-digest/plan.md`, `specs/002-consumer-digest/spec.md`, `specs/002-consumer-digest/data-model.md`, `specs/002-consumer-digest/research.md`

**Tests**: Included — required by Constitution (III. Test-First / TDD) and explicitly requested in spec FR-006.

**Organization**: Tasks grouped by user story. `packages/blog-builder` package setup is complete; no new tooling or dependencies required.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: No new foundational infrastructure needed — `Consumer`, `BuilderConfig`, `PostMetadata`, `Digest`, and `traverse` all exist. This phase is a no-op; user stories can begin immediately.

**Checkpoint**: All blocking prerequisites already satisfied — US1 can start immediately.

---

## Phase 2: User Story 1 — Generate Metadata File for a Post Directory (Priority: P1) 🎯 MVP

**Goal**: `ConsumerDigest` class that implements `Consumer`, retains `BuilderConfig`, applies the two skip conditions (metadata file already exists; no `index.html`), and on the happy path calls `Digest.process` then writes the result as JSON.

**Independent Test**: `npm run test -w @blog/blog-builder` — all US1 unit tests green; `Digest.process` is not called when skip conditions apply; `writeFileSync` is called with the correct path and JSON content on the happy path.

### Tests for User Story 1 ⚠️ Write FIRST — ensure they FAIL before implementation

- [x] T001 [US1] Write failing unit tests for `ConsumerDigest` in `packages/blog-builder/src/__test__/ConsumerDigest.test.ts`:
  - `given` metadata file already exists, `when` `consume` called, `then` `digest.process` is NOT called and nothing is written
  - `given` no `index.html` present, `when` `consume` called, `then` `digest.process` is NOT called and nothing is written
  - `given` `index.html` present and metadata file absent, `when` `consume` called, `then` `digest.process` IS called and `writeFileSync` is called with `join(dirPath, config['metadata-file'])` and the two-space-indented JSON of the returned metadata

### Implementation for User Story 1

- [x] T002 [US1] Implement `ConsumerDigest` class in `packages/blog-builder/src/utils/ConsumerDigest.ts`:
  - Constructor signature: `(config: BuilderConfig, digest: Digest = new Digest())`
  - `consume(dirPath: string): void` — ordered logic: check `existsSync(join(dirPath, config['metadata-file']))` → return if true; check `existsSync(join(dirPath, 'index.html'))` → return if false; call `this.digest.process(join(dirPath, 'index.html'), this.config)`; write result with `writeFileSync(join(dirPath, config['metadata-file']), JSON.stringify(result, null, 2), 'utf-8')`
  - Imports: `existsSync`, `writeFileSync` from `node:fs`; `join` from `node:path`; `BuilderConfig` from `./Model.ts`; `Digest` from `./Digest.ts`; `Consumer` from `./Model.ts`

**Checkpoint**: US1 fully functional — run `npm run test -w @blog/blog-builder` to verify all T001 cases are green.

---

## Phase 3: User Story 2 — Batch Generation via Traverse (Priority: P2)

**Goal**: Integration test that calls `traverse` over `sample-posts` with a single `ConsumerDigest` consumer, verifies that the three expected metadata files are created, and cleans up all test files in `afterAll`.

**Independent Test**: `npm run test -w @blog/blog-builder` — integration test creates `blog-builder-metadata-[epoch].json` in each of the three qualifying `sample-posts` subdirectories and removes them all in teardown; fixture directory is left unchanged.

### Tests for User Story 2 ⚠️ Write FIRST — ensure they FAIL before implementation

- [x] T003 [P] [US2] Add integration test describe block to `packages/blog-builder/src/__test__/ConsumerDigest.test.ts`:
  - Compute `testMetadataFile = \`blog-builder-metadata-${Date.now()}.json\`` at describe-block scope
  - Read config from `packages/blog-builder/src/__test__/sample-posts/expected-full/blog-builder-config.json`; override `'metadata-file'` with `testMetadataFile`
  - `afterAll`: call `rmSync(join(dir, testMetadataFile), { force: true })` for each of the three qualifying subdirectories
  - `given` `sample-posts` fixture with no pre-existing `testMetadataFile`, `when` `traverse(SAMPLE_POSTS, [new ConsumerDigest(config)])` is called, `then` `existsSync(join(dir, testMetadataFile))` is `true` for each of the three qualifying directories (`251013-…`, `251014-…`, `251015-…`)
  - `given` the created files, `then` parsing each file as JSON produces a valid `PostMetadata` object (has `post.title`, `post.date`, `post.url`, `post.tags` fields)

### Implementation for User Story 2

> No additional implementation required — `ConsumerDigest` (T002) and `traverse` (existing) already provide all production code. The integration test exercises the existing wiring.

**Checkpoint**: All tests green; `sample-posts` fixture is clean after the test run.

---

## Phase 4: Verify

- [x] T004 Run `npm run verify -w @blog/blog-builder` from repo root — `typecheck` and all tests pass with zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: N/A — all prerequisites already exist
- **US1 (Phase 2)**: Can start immediately — T001 (tests) → T002 (implementation)
- **US2 (Phase 3)**: Depends on T002 complete — integration test requires `ConsumerDigest` to exist; T003 can be written in parallel with T002 but will fail until T002 is done
- **Verify (Phase 4)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: No dependencies — start immediately
- **US2 (P2)**: Depends on US1 (T002) — integration test instantiates `ConsumerDigest`

### TDD Order Within Each Story

1. Write test (red) → confirm it fails
2. Implement production code (green) → confirm test passes
3. Refactor if needed → confirm still green

### Parallel Opportunities

- T003 (integration test) can be authored alongside T002 (implementation) — different concern in the same file, but the test will remain red until T002 is complete

---

## Parallel Example: After T001 tests written

```text
Developer A: T002  (ConsumerDigest implementation — makes T001 green)
Developer B: T003  (integration test authored, stays red until T002 merges)
→ Both complete → T004 verify
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. T001 — write failing unit tests
2. T002 — implement `ConsumerDigest`
3. **STOP & VALIDATE**: `npm run test -w @blog/blog-builder`

### Full Delivery

1. T001 → T002 — US1 unit tests + implementation
2. T003 — US2 integration test
3. T004 — full verify

---

## Notes

- All imports use `.ts` extension (enforced by `allowImportingTsExtensions`)
- `given / when / then` comment structure required in every test case (Constitution III)
- `Digest` default-construction (`new Digest()`) inside `ConsumerDigest` uses `console` as its default logger — acceptable for production; unit tests inject a mock `Digest`
- `rmSync` with `{ force: true }` prevents teardown failure when a test file was never created (e.g. due to earlier assertion failure)
- `Date.now()` is evaluated once at describe-block scope to give a stable filename for the entire test run
