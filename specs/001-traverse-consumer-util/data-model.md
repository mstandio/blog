# Data Model: Directory Traverse Consumer Utility

**Branch**: `001-traverse-consumer-util` | **Date**: 2026-02-27

## Entities

### `Consumer` (interface — `Traverse.ts`)

Represents any handler that can process a single directory path.

| Member | Type | Description |
|--------|------|-------------|
| `consume` | `(dirPath: string) => void` | Called once per visited subdirectory with the full absolute path |

No state, no return value. Purely a callback contract.

---

### `traverse` (exported function — `Traverse.ts`)

Orchestrates subdirectory discovery and consumer dispatch.

| Parameter | Type | Description |
|-----------|------|-------------|
| `rootDir` | `string` | Absolute path to the root directory to scan |
| `consumers` | `Consumer[]` | Ordered list of handlers invoked for each subdirectory |

**Behaviour**:
1. Read direct children of `rootDir` using `readdirSync` with `withFileTypes: true`.
2. Filter to entries where `isDirectory()` is `true` **and** `name` matches `^\d{6}-` (6 digits followed by a hyphen). Entries failing either condition are silently skipped.
3. Sort filtered entries by `name` ascending (lexicographic).
4. For each sorted entry, construct `fullPath = join(rootDir, entry.name)`.
5. For each consumer in `consumers` (in list order), call `consumer.consume(fullPath)`.

**Return**: `void`

---

### `ConsumerLogger` (class — `ConsumerLogger.ts`)

Concrete `Consumer` implementation that logs the directory name only.

| Member | Type | Description |
|--------|------|-------------|
| constructor | `(logger?: Logger)` | Accepts optional logger; defaults to `console` |
| `consume` | `(dirPath: string) => void` | Calls `logger.log(basename(dirPath))` |

**`Logger`** (inline interface in `ConsumerLogger.ts`):

| Member | Type |
|--------|------|
| `log` | `(message: string) => void` |

Structurally compatible with `console` and with the `Logger` interface in `Digest.ts` (no import dependency required).

---

## State Transitions

Not applicable — all entities are stateless. `ConsumerLogger` holds a logger reference but carries no mutable state between `consume` calls.

## Validation Rules

- `traverse` does not validate that `rootDir` exists; `readdirSync` will throw a native `ENOENT` error if it does not. No custom wrapping is added (keep it simple; callers are responsible for passing a valid path).
- `consumers` may be an empty array — traversal proceeds, no consumers are called.
- Files inside `rootDir` are silently ignored (filtered out by `isDirectory()`).

## Test Data Mapping

The integration test uses the existing `sample-posts` fixture:

| Subdirectory | Qualifies (`^\d{6}-`)? | Expected `basename` logged |
|---|---|---|
| `251013-some-description` | ✅ Yes | `251013-some-description` |
| `251014-some-other-description` | ✅ Yes | `251014-some-other-description` |
| `251015-third-description` | ✅ Yes | `251015-third-description` |
| `expected-full` | ❌ No — silently skipped | — |

Full expected call list (alphabetical order): `['251013-some-description', '251014-some-other-description', '251015-third-description']`
