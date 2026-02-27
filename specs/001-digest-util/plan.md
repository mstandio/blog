# Implementation Plan: Digest Util (blog-builder)

**Branch**: `001-digest-util` | **Date**: 2026-02-27 | **Spec**: `specs/001-digest-util/spec.md`

## Summary

Bootstrap the blog monorepo project infrastructure (package.json, tsconfig.json, vitest config) and implement a `Digest` utility class in `packages/blog-builder` that accepts a file path, logs it, and returns a typed `Partial<PostMetadata>` object.

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: vitest 4.0.18, typescript 5.9.3  
**Storage**: N/A (file path is received as string; no I/O yet)  
**Testing**: vitest (unit tests with `vi.fn()` spies)  
**Target Platform**: Node.js 24.x  
**Project Type**: Library / CLI module  
**Performance Goals**: N/A  
**Constraints**: strict TypeScript, ESM modules, NodeNext resolution, `.ts` import extensions  
**Scale/Scope**: Single utility class with one method

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Monorepo & Package Layout | ✅ | `packages/blog-builder` under `packages/`; npm workspaces in root `package.json` |
| II. TypeScript Everywhere | ✅ | `strict: true`, `NodeNext` module, `allowImportingTsExtensions`, `.ts` extensions in imports |
| III. Test-First (TDD) | ✅ | `Digest.test.ts` written before/alongside `Digest.ts`; `given/when/then` structure; vitest |
| IV. Builder–Viewer Contract | ✅ | `PostMetadata` type defined and exported; contract is stable and typed |
| V. Modular CLI & Static Pipeline | ✅ | `Digest` is a composable, testable module with no side-effects beyond logging |

## Project Structure

### Documentation (this feature)

```text
specs/001-digest-util/
├── spec.md      ✅
├── plan.md      ✅ (this file)
└── tasks.md     ✅
```

### Source Code

```text
packages/blog-builder/
├── package.json                        (new)
├── tsconfig.json                       (new)
├── vitest.config.ts                    (new)
└── src/
    ├── utils/
    │   ├── digester.ts                 (existing, empty — do NOT modify)
    │   └── Digest.ts                   (new)
    └── __test__/
        ├── Digest.test.ts              (new)
        └── sample-posts/              (existing — do NOT modify)
```

Root-level files:

```text
package.json      (new — workspace root)
tsconfig.json     (new — base TypeScript config)
```
