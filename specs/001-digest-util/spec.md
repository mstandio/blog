# Feature Specification: Digest Util (blog-builder)

**Feature Branch**: `001-digest-util`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: User description: "create a simple util class named Digest.ts with method named process which accepts a path to a file and returns an object which fields are exemplified in blog-builder-metadata.json; method process returns empty object for now, but logs a path received from input and we need a test that verifies logger is invoked"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Digest processes a file path (Priority: P1)

As a blog-builder CLI user, I want a `Digest` utility that accepts a file path and returns structured post metadata, so that static blog post files can be parsed into JSON summaries consumed by blog-viewer.

**Why this priority**: This is the foundational building block of the blog-builder pipeline. Without a digest step, no post metadata can be extracted or published.

**Independent Test**: Can be fully tested by calling `digest.process('/path/to/file')` and asserting the logger is invoked with that path, and the return value matches the PostMetadata shape.

**Acceptance Scenarios**:

1. **Given** a `Digest` instance with an injected logger, **When** `process` is called with a file path, **Then** the logger logs the received path.
2. **Given** a `Digest` instance, **When** `process` is called with a file path, **Then** the returned object conforms to the `PostMetadata` shape (currently empty).

---

### Edge Cases

- What happens when the path is an empty string?
- How does the system handle a path to a non-existent file?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `Digest` MUST expose a `process(filePath: string)` method.
- **FR-002**: `process` MUST log the received file path via an injected logger.
- **FR-003**: `process` MUST return an object conforming to the `PostMetadata` type (currently `{}`).
- **FR-004**: `Digest` MUST accept a logger via constructor injection with `console` as the default.
- **FR-005**: The `PostMetadata` type MUST match the shape exemplified in `blog-builder-metadata.json`.

### Key Entities

- **PostMetadata**: Represents a parsed blog post, with fields `post.title`, `post.teaser`, `post.date`, `post.url`, `post.tags`.
- **Logger**: Injectable interface `{ log: (message: string) => void }` to allow test doubles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Unit test passes asserting logger is invoked with the file path when `process` is called.
- **SC-002**: `process` return type satisfies `Partial<PostMetadata>` without TypeScript errors.
- **SC-003**: `npm run verify -w @blog/blog-builder` exits with code 0 (typecheck + tests green).
