# Feature Specification: ConsumerDigest — Metadata-File Writer Consumer

**Feature Branch**: `002-consumer-digest`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: User description: "create new util class packages/blog-builder/src/utils/ConsumerDigest.ts that implements Consumer defined in Model.ts. ConsumerDigest.ts in its constructor accepts object config of type BuilderConfig saved as global variable. Implement consume method in ConsumerDigest.ts: if directory passed as method argument does not contain file which name is defined in config as value of field metadata-file, and directory contains index.html file, then invoke Digest.ts process with this directory and with stored global BuilderConfig variable. Received output must be serialized to json and saved as file defined in metadata-file in same directory. Integration test should be done by invoking Traverse.ts traverse with directory packages/blog-builder/src/__test__/sample-posts/ and single consumer ConsumerDigest.ts. When config in tests is needed use existing file packages/blog-builder/src/__test__/sample-posts/expected-full/blog-builder-config.json. For integration tests after reading config overwrite metadata-file field in config object with value blog-builder-metadata-[epoch time].json. Cleanup should remove those test files from sample-posts subdirectories."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Metadata File for a Blog Post Directory (Priority: P1)

A developer wants a consumer that, given a blog post directory path, checks whether a metadata file already exists (using the filename defined in the configuration). If the metadata file is absent and the directory contains an `index.html` file, the consumer processes the HTML to extract post metadata and writes the result as a JSON file with the configured metadata filename into that same directory. If the metadata file already exists, or no `index.html` is present, the consumer does nothing.

**Why this priority**: This is the core write behaviour — the skip conditions and the write path together define the consumer's contract. Everything else depends on this logic being correct.

**Independent Test**: Can be fully tested by invoking `consume` directly with a directory path, asserting that the metadata JSON file is created with the correct content when it is absent, and that no file is written when the metadata file already exists or when `index.html` is missing.

**Acceptance Scenarios**:

1. **Given** a directory that contains `index.html` and does not yet contain the configured metadata filename, **When** `consume` is called with that directory path, **Then** a JSON file with the configured metadata filename is created in that directory, containing the serialized post metadata extracted from `index.html`.
2. **Given** a directory that already contains the configured metadata filename, **When** `consume` is called with that directory path, **Then** the existing metadata file is left untouched and no new file is written.
3. **Given** a directory that does not contain `index.html` (regardless of whether the metadata file exists), **When** `consume` is called, **Then** no file is written and no error is raised.

---

### User Story 2 - Batch Generate Metadata Files via Traverse (Priority: P2)

A developer wants to run `ConsumerDigest` over an entire posts directory in a single call, using `traverse` to visit each qualifying subdirectory (those matching `^\d{6}-`) and writing the metadata file into each one that lacks it.

**Why this priority**: Validates the consumer in a realistic pipeline context and confirms integration with the existing `traverse` utility and `Digest` processor.

**Independent Test**: Can be fully tested by running an integration test that calls `traverse` over the `sample-posts` fixture with a `ConsumerDigest` consumer configured to write a uniquely named metadata file, then asserting that the expected files were created in the qualifying subdirectories, and cleaning them up after the test.

**Acceptance Scenarios**:

1. **Given** the `sample-posts` fixture directory containing three qualifying post directories (`251013-…`, `251014-…`, `251015-…`), each with an `index.html` but without the test metadata filename, **When** `traverse` is called with a `ConsumerDigest` configured with a unique test metadata filename (using epoch time to avoid collisions), **Then** a metadata JSON file with the test filename is created in each of the three qualifying directories.
2. **Given** the integration test has created test metadata files, **When** the test teardown runs, **Then** all test metadata files (those named `blog-builder-metadata-[epoch].json`) are removed from the qualifying subdirectories, leaving the fixture directory clean.

---

### Edge Cases

- What happens when the directory does not exist or is not readable? An error from the underlying filesystem is allowed to propagate — `consume` does not swallow system errors.
- What happens when `index.html` exists but is malformed? The existing `Digest.process` behaviour applies (it may return empty or partial metadata); `ConsumerDigest` writes whatever `Digest.process` returns.
- What happens when the metadata file already exists but is corrupt? The existing file is not overwritten — the presence check (file exists) is sufficient to skip.
- What happens when the disk write of the metadata JSON fails? The filesystem error propagates to the caller; no partial or empty file is silently left.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `ConsumerDigest` MUST implement the `Consumer` contract from `Model.ts`.
- **FR-002**: `ConsumerDigest` MUST accept a `BuilderConfig` object at construction time and retain it for use in every `consume` call.
- **FR-003**: When `consume` is called with a directory path, the system MUST check whether a file named by `config['metadata-file']` already exists in that directory.
- **FR-004**: When `consume` is called and the metadata file is absent AND an `index.html` file is present in the directory, the system MUST invoke `Digest.process` with the path to `index.html` and the stored `BuilderConfig`, then write the returned `PostMetadata` as a JSON file named `config['metadata-file']` in that directory.
- **FR-005**: When the metadata file already exists, OR when no `index.html` is present, `consume` MUST do nothing (no write, no error).
- **FR-006**: An integration test MUST call `traverse` over the `sample-posts` fixture with a single `ConsumerDigest` consumer; the test MUST use a unique metadata filename (incorporating epoch time) to avoid interfering with existing fixture files, and MUST delete all created test files during teardown.

### Key Entities

- **ConsumerDigest**: A `Consumer` implementation that reads `BuilderConfig` at construction time and conditionally generates a metadata JSON file for a given post directory.
- **BuilderConfig**: Configuration object (from `Model.ts`) that specifies, among other things, the `metadata-file` field — the filename to check for and write to.
- **PostMetadata**: The typed result of `Digest.process`, serialized to JSON and written to disk.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All automated tests pass with zero failures after the feature is implemented.
- **SC-002**: A metadata JSON file is created in a qualifying directory on the first `consume` call and not overwritten on subsequent calls — verified by unit test.
- **SC-003**: The integration test creates metadata files in all three qualifying `sample-posts` subdirectories and removes them all during teardown — fixture directory is left in its original state after the test run.
- **SC-004**: `ConsumerDigest` can be swapped in or out of any `traverse` call without modifying the `traverse` function or the `Consumer` interface — verified by the clean separation of concerns in the implementation.

## Assumptions

- The `metadata-file` field in `BuilderConfig` contains only a filename (no path separators) — it is joined with the directory path using the standard path module.
- The `index.html` path passed to `Digest.process` is constructed as `join(dirPath, 'index.html')`.
- The metadata JSON is written with `JSON.stringify` output (no pretty-printing required unless the existing pattern dictates otherwise).
- The existing `blog-builder-metadata.json` files in the `sample-posts` fixture are not modified by any test because the integration test uses a uniquely named file.
- Epoch time in the test metadata filename (`blog-builder-metadata-[epoch].json`) is obtained from `Date.now()` at the start of the test or test suite.
