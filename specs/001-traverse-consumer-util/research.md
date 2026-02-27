# Research: Directory Traverse Consumer Utility

**Branch**: `001-traverse-consumer-util` | **Date**: 2026-02-27

## Decision 1: Node.js API for listing subdirectories

**Decision**: Use `readdirSync(dir, { withFileTypes: true })` from `node:fs`, then filter entries where `entry.isDirectory()` is `true` **and** `entry.name` matches `^\d{6}-` (6 digits followed by a hyphen). Both conditions must be met for a directory to be included.

**Addendum (from clarification 2026-02-27)**: The qualifying pattern `^\d{6}-` was confirmed by the developer as the intended filter. This means `expected-full` and any other non-matching directories are excluded before sorting and before consumers are called.

**Rationale**: Already used in the project's runtime environment (Node.js). `withFileTypes: true` returns `Dirent` objects, allowing a single `isDirectory()` call without a second `stat()` syscall per entry. Synchronous API is appropriate — `blog-builder` is a build-time CLI, not a server handling concurrent requests.

**Alternatives considered**:
- `readdirSync` + `statSync` per entry: extra syscall, no benefit here.
- `fs.promises.readdir` (async): would require making `traverse` `async`, adding complexity for no runtime gain in a sequential build pipeline.
- `glob` / third-party directory walker: unnecessary dependency for listing one level of directories.

---

## Decision 2: Alphabetical sort

**Decision**: Sort the filtered `Dirent` array by `entry.name` using `Array.prototype.sort()` with the default comparator (lexicographic ascending by Unicode code point).

**Rationale**: The three fixture directories (`251013-…`, `251014-…`, `251015-…`) are named with zero-padded numeric prefixes, so lexicographic sort produces the same result as numeric sort. Default `sort()` without a locale comparator is deterministic, fast, and has no external dependency.

**Alternatives considered**:
- `localeCompare` with a locale: unnecessary — folder names are ASCII strings with no locale-sensitive characters in this project.
- No sorting (rely on OS order): OS directory enumeration order is not guaranteed (varies between ext4, APFS, NTFS); sorting is required for determinism.

---

## Decision 3: What to pass to `consume` — full path or name only

**Decision**: Pass the **full absolute path** of each subdirectory to `consume`. `ConsumerLogger` extracts and logs only the `basename` of the received path.

**Rationale**: The `Consumer` contract must be maximally useful — callers may need to open files inside subdirectories. Passing only the name would force every consumer to reconstruct the full path, coupling them to the root. The logger scenario shows the opposite direction: consumers that only need the name can derive it from the full path using `basename`.

**Alternatives considered**:
- Pass only directory name: consumers that need to read files inside the directory cannot work without the root context.
- Pass both root + name as separate arguments: complicates the contract signature with no advantage over passing the full joined path.

---

## Decision 4: Test assertion strategy — `expected-full` directory in fixture

**Decision**: Use `toEqual` on an exact list of three entries: `['251013-some-description', '251014-some-other-description', '251015-third-description']`.

**Rationale**: The subdirectory filter `^\d{6}-` (see Decision 1 addendum below) means `expected-full` is silently skipped before consumers are invoked. The `sample-posts` fixture therefore produces exactly the three expected entries and no more. Exact `toEqual` assertion provides the strongest regression safety.

**Note (resolved)**: An earlier open question about whether `expected-full` would appear in test output is resolved by the filter: `expected-full` does not start with 6 digits and a hyphen, so it is excluded at the filtering step and never passed to consumers.

---

## Decision 5: `ConsumerLogger` logging target

**Decision**: `ConsumerLogger` receives a `logger` dependency (defaulting to `console`) conforming to a `{ log: (msg: string) => void }` shape — consistent with the pattern already used in `Digest.ts`.

**Rationale**: Injecting the logger makes `ConsumerLogger` unit-testable without global side effects (spy on the injected mock). Consistent with the existing `Logger` interface in `Digest.ts`.

**Alternatives considered**:
- Hard-code `console.log`: not testable without patching globals.
- Reuse the `Logger` interface exported from `Digest.ts`: this would create a cross-dependency between two util files. Better to re-declare a structurally compatible inline interface in `Traverse.ts` and let TypeScript's structural typing ensure compatibility.
