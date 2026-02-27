# Implementation Plan: ConsumerDigest — Metadata-File Writer Consumer

**Branch**: `002-consumer-digest` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/002-consumer-digest/spec.md`

## Summary

Add `ConsumerDigest` to `packages/blog-builder` — a `Consumer` implementation that accepts a `BuilderConfig` at construction time and, for each qualifying post directory, conditionally invokes `Digest.process` and writes the resulting `PostMetadata` JSON to disk. Cover it with unit tests (skip conditions + write path) and an integration test using `traverse` over `sample-posts`, with epoch-based filename isolation and teardown cleanup.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict, NodeNext modules, `allowImportingTsExtensions`)  
**Primary Dependencies**: `node:fs` (`existsSync`, `writeFileSync`), `node:path` (`join`) — all stdlib; `Digest` class from `./Digest.ts`  
**Storage**: Local filesystem — synchronous reads/writes (consistent with existing `Digest` pattern)  
**Testing**: Vitest 4 — `vitest run`; given/when/then comment structure required; `afterAll` for teardown  
**Target Platform**: Node.js (build-time CLI, same runtime as all existing utilities)  
**Project Type**: Library / modular CLI utility inside `packages/blog-builder`  
**Performance Goals**: Build-time only — no latency targets  
**Constraints**: `strict: true`; no `any`; `noUnused*`; all imports use `.ts` extension  
**Scale/Scope**: One new source file, one new test describe block added to existing `ConsumerDigest.test.ts`

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Monorepo & Package Layout** | ✅ PASS | New file inside `packages/blog-builder/src/utils/` — no new package, no duplication |
| **II. TypeScript Everywhere** | ✅ PASS | `.ts` files; strict config inherited from root `tsconfig.json`; `Model.ts` types reused |
| **III. Test-First (TDD)** | ✅ PASS | Tests written before production code; given/when/then; `afterAll` teardown for integration test |
| **IV. Builder–Viewer Contract** | ✅ PASS | No change to JSON output schema; `PostMetadata` shape is unchanged |
| **V. Modular CLI & Static Pipeline** | ✅ PASS | `ConsumerDigest` is composable and testable in isolation; `traverse` is not modified |

## Project Structure

### Documentation (this feature)

```text
specs/002-consumer-digest/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
packages/blog-builder/src/
├── utils/
│   ├── Model.ts                   # existing — Consumer, BuilderConfig, PostMetadata, Logger
│   ├── Digest.ts                  # existing — Digest class
│   ├── Traverse.ts                # existing — traverse function
│   ├── ConsumerLogger.ts          # existing
│   └── ConsumerDigest.ts          # NEW — ConsumerDigest class
└── __test__/
    ├── Digest.test.ts             # existing
    ├── Traverse.test.ts           # existing
    ├── ConsumerDigest.test.ts     # NEW — unit + integration tests
    └── sample-posts/              # existing fixture (no changes to committed files)
        ├── 251013-some-description/
        ├── 251014-some-other-description/
        ├── 251015-third-description/
        └── expected-full/
```

**Structure Decision**: Single-package layout. All new files slot into the existing `src/utils/` and `src/__test__/` directories.

## Complexity Tracking

> No constitution violations — this section is intentionally empty.
