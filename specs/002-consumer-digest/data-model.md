# Data Model: ConsumerDigest — Metadata-File Writer Consumer

**Branch**: `002-consumer-digest` | **Date**: 2026-02-27

## Entities

### `ConsumerDigest` (class — `ConsumerDigest.ts`)

Implements the `Consumer` contract from `Model.ts`. Conditionally writes a `PostMetadata` JSON file into a post directory.

| Member | Type | Description |
|--------|------|-------------|
| constructor | `(config: BuilderConfig, digest?: Digest)` | Stores `config`; defaults `digest` to `new Digest()` |
| `consume` | `(dirPath: string) => void` | Applies skip conditions then writes metadata JSON (see behaviour below) |

**`consume` behaviour (ordered checks)**:

```text
1. metadataPath  = join(dirPath, config['metadata-file'])
2. indexPath     = join(dirPath, 'index.html')
3. if existsSync(metadataPath)  → return   (skip: already exists)
4. if !existsSync(indexPath)    → return   (skip: no index.html)
5. metadata = digest.process(indexPath, config)
6. writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8')
```

**Return**: `void`

---

### `BuilderConfig` (interface — `Model.ts`, already defined)

Relevant field for this feature:

| Field | Type | Description |
|-------|------|-------------|
| `metadata-file` | `string` | Filename (no path separators) to check for and write to in each post directory |

All other `BuilderConfig` fields (`title-class`, `teaser-class`, `tag-class`, `posts-per-page`) are passed through to `Digest.process` unchanged.

---

### `PostMetadata` (interface — `Model.ts`, already defined)

The structured result of `Digest.process`. Serialized to JSON with `JSON.stringify(metadata, null, 2)` and written verbatim to the metadata file path.

---

## Validation Rules

- `ConsumerDigest` does not validate `config['metadata-file']` for path separators — this is a precondition documented in the spec Assumptions.
- Both existence checks (`existsSync`) are performed on every `consume` call — no caching between calls.
- Errors from `Digest.process` or `writeFileSync` propagate to the caller uncaught; no swallowing.

## Test Data Mapping

### Unit tests (isolated, no real fixture files)

| Scenario | Setup | Expected outcome |
|----------|-------|-----------------|
| Metadata file already exists | `existsSync(metadataPath) = true` | `consume` returns immediately; `digest.process` not called; no write |
| No `index.html` | `existsSync(metadataPath) = false`, `existsSync(indexPath) = false` | `consume` returns immediately; `digest.process` not called; no write |
| Both conditions met | `existsSync(metadataPath) = false`, `existsSync(indexPath) = true` | `digest.process` called; `writeFileSync` called with serialized result |

### Integration test (real fixture, epoch-named file)

| Subdirectory | Has `index.html`? | Has `testMetadataFile` before? | Expected outcome |
|---|---|---|---|
| `251013-some-description` | ✅ Yes | ❌ No | File created |
| `251014-some-other-description` | ✅ Yes | ❌ No | File created |
| `251015-third-description` | ✅ Yes | ❌ No | File created |

Teardown: `testMetadataFile` removed from all three directories via `rmSync(..., { force: true })`.
