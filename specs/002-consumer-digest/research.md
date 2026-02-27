# Research: ConsumerDigest — Metadata-File Writer Consumer

**Branch**: `002-consumer-digest` | **Date**: 2026-02-27

## Decision 1: File existence check API

**Decision**: Use `existsSync(path)` from `node:fs` to check whether the metadata file and `index.html` are present.

**Rationale**: The entire `blog-builder` pipeline is synchronous (`readFileSync` in `Digest.ts`, `readdirSync` in `Traverse.ts`). Introducing an async check here would require making `consume` async, which would change the `Consumer` interface and ripple through `traverse` and all existing consumers. `existsSync` is a single, clear call with no error-handling overhead for the happy path.

**Alternatives considered**:
- `fs.promises.access` (async): would require async `Consumer` contract — interface-breaking change.
- `statSync` + catch: more verbose; `existsSync` is idiomatic for a simple boolean presence check.

---

## Decision 2: File write API

**Decision**: Use `writeFileSync(path, content, 'utf-8')` from `node:fs`.

**Rationale**: Consistent with the synchronous pattern used throughout the package. The metadata file is small (single JSON object); synchronous write is perfectly appropriate for a build-time CLI.

**Alternatives considered**:
- `fs.promises.writeFile` (async): same interface-breaking argument as Decision 1.
- `fs.createWriteStream`: overkill for writing a small JSON string once.

---

## Decision 3: JSON serialisation format

**Decision**: Use `JSON.stringify(metadata, null, 2)` — two-space-indented pretty print.

**Rationale**: The existing `blog-builder-metadata.json` fixture files in `sample-posts` are formatted with two-space indentation. Matching that format keeps the integration test output readable and ensures that if a future test does a byte-for-byte file comparison it will succeed without format normalisation.

**Alternatives considered**:
- `JSON.stringify(metadata)` (compact): produces valid JSON but differs from existing fixture files, making diff-based test assertions harder.

---

## Decision 4: `Digest` instance — construction vs injection

**Decision**: `ConsumerDigest` constructor accepts an optional second parameter `digest?: Digest` that defaults to `new Digest()`. The spec states the constructor accepts `BuilderConfig`; the optional `Digest` parameter is an implementation-level extension needed for testability.

**Rationale**: `Digest.process` performs real filesystem reads (`readFileSync`) and HTML parsing. Without injection, every unit test that calls `consume` would need real HTML files on disk. With an injected mock `Digest`, unit tests can verify the skip conditions and write path without touching the filesystem. This follows the same dependency-injection pattern already established by `Digest` itself (injectable logger and fileReader).

**Alternatives considered**:
- Always construct `new Digest()` internally: not unit-testable without real fixture files; makes the skip-condition tests fragile.
- Accept logger + fileReader separately and construct `Digest` internally: more parameters, less clear interface.

---

## Decision 5: `index.html` path construction

**Decision**: Construct the index path as `join(dirPath, 'index.html')` and pass it to `Digest.process`. The existence of `index.html` is checked with `existsSync(join(dirPath, 'index.html'))`.

**Rationale**: `Digest.process` expects a full file path; `join` handles cross-platform separators. The filename `index.html` is fixed by the spec.

---

## Decision 6: Metadata file path construction

**Decision**: Construct the metadata file path as `join(dirPath, config['metadata-file'])`.

**Rationale**: The spec states the file is saved "in the same directory" as the post. `config['metadata-file']` contains only a filename (no path separators — see spec Assumptions). `join` is used for cross-platform correctness.

---

## Decision 7: Integration test isolation and teardown

**Decision**: Compute `testMetadataFile = \`blog-builder-metadata-${Date.now()}.json\`` once at the top of the `describe` block (before `beforeAll`/`afterAll`). Pass a config copy with `'metadata-file'` overridden to `testMetadataFile` to `ConsumerDigest`. In `afterAll`, delete the test file from each qualifying subdirectory using `rmSync` (with `{ force: true }` to silently skip already-absent files).

**Rationale**: Using `Date.now()` at module evaluation time guarantees a unique filename for the test run, preventing collisions with committed `blog-builder-metadata.json` files. `force: true` in `rmSync` prevents teardown from failing if a test case didn't create a file (e.g. due to an earlier assertion failure).

**Alternatives considered**:
- Delete only files that were actually created: requires tracking created files; more complex teardown logic with no real benefit.
- Use a temp directory: would require copying fixture files; over-engineered for this scenario.
