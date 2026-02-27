# Implementation Plan: Directory Traverse Consumer Utility

**Branch**: `001-traverse-consumer-util` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-traverse-consumer-util/spec.md`

## Summary

Add a `Traverse` utility to `packages/blog-builder` that discovers direct subdirectories of a root path in alphabetical order and invokes a list of `Consumer` handlers on each. Provide a `ConsumerLogger` concrete implementation that logs only the final directory name. Cover both with a Vitest integration test using the existing `sample-posts` fixture.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict, NodeNext modules, `allowImportingTsExtensions`)  
**Primary Dependencies**: `node:fs` (stdlib — `readdirSync` with `withFileTypes`), `node:path` (stdlib — `basename`, `join`)  
**Storage**: N/A  
**Testing**: Vitest 4 — `vitest run`; given/when/then comment structure required  
**Target Platform**: Node.js (same runtime as existing `blog-builder` package)  
**Project Type**: Library / modular CLI utility inside `packages/blog-builder`  
**Performance Goals**: No specific targets — this is a build-time utility traversing a small number of directories  
**Constraints**: Must compile clean under `strict: true`; no `any`; all `noUnused*` flags enabled  
**Scale/Scope**: Small utility; new files: `Traverse.ts`, `ConsumerLogger.ts`, `Traverse.test.ts`

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Monorepo & Package Layout** | ✅ PASS | All new code goes inside `packages/blog-builder/src/` — no new package or duplicate utility |
| **II. TypeScript Everywhere** | ✅ PASS | All files are `.ts`; imports use `.ts` extensions; strict options inherited from root `tsconfig.json` |
| **III. Test-First (TDD)** | ✅ PASS | Test file written before production code; given/when/then comment structure applied |
| **IV. Builder–Viewer Contract** | ✅ PASS | No changes to the JSON output contract; purely internal utilities |
| **V. Modular CLI & Static Pipeline** | ✅ PASS | `Traverse` and `ConsumerLogger` are composable, independently testable modules |

## Project Structure

### Documentation (this feature)

```text
specs/001-traverse-consumer-util/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
packages/blog-builder/src/
├── utils/
│   ├── Digest.ts                  # existing
│   ├── Traverse.ts                # NEW — Consumer interface + traverse function
│   └── ConsumerLogger.ts          # NEW — Consumer implementation that logs directory name
└── __test__/
    ├── Digest.test.ts             # existing
    ├── Traverse.test.ts           # NEW — integration test against sample-posts fixture
    └── sample-posts/              # existing fixture (no changes)
        ├── 251013-some-description/
        ├── 251014-some-other-description/
        ├── 251015-third-description/
        └── expected-full/         # existing — present during traversal; see research.md
```

**Structure Decision**: Single-package layout (Option 1). All new files slot into the existing `src/utils/` and `src/__test__/` directories with no structural changes.

## Complexity Tracking

> No constitution violations — this section is intentionally empty.
