# Feature Specification: Directory Traverse Consumer Utility

**Feature Branch**: `001-traverse-consumer-util`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: User description: "create new util file packages/blog-builder/src/utils/Traverse.ts. It will define and export an interface Consumer which in turn will have a method consume that will accept a path to a directory. Traverse.ts will contain a method traverse that will accept a path to a directory and array of Consumers. Implementation of method traverse will take directory from input, and iterate over each direct subdirectory in alphabetical order. For each subdirectory it will iterate over array of consumers and invoke consume on each of them with value of a subdirectory. Create new util class packages/blog-builder/src/utils/ConsumerLogger.ts which implements Consumer interface and which logs last directory in path from input. Create a test where Traverse.ts is invoked with packages/blog-builder/src/__test__/sample-posts directory and array of consumers that contains only ConsumerLogger.ts. verify that ConsumerLogger.ts logged following entries: 251013-some-description, 251014-some-other-description, 251015-third-description"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Traverse Subdirectories with Consumers (Priority: P1)

A developer wants to process all direct subdirectories of a given root directory in a consistent, predictable order. They pass a list of consumer handlers to the traversal function; each handler is invoked once per subdirectory and performs its own logic (logging, collecting metadata, etc.). The developer can compose multiple consumers independently and plug them into a single traversal pass.

**Why this priority**: This is the core capability — the traversal contract and consumer interface. Everything else depends on this behaviour being correct and deterministic.

**Independent Test**: Can be fully tested by invoking the traverse function with a known directory tree containing three subdirectories and a consumer that records which directories it was called with, then asserting the recorded values match the expected alphabetical list.

**Acceptance Scenarios**:

1. **Given** a root directory that contains three subdirectories (`251013-some-description`, `251014-some-other-description`, `251015-third-description`) and no other subdirectories, **When** `traverse` is called with that root and a single consumer, **Then** the consumer's `consume` method is called exactly three times, once per subdirectory, in ascending alphabetical order.
2. **Given** a root directory with multiple subdirectories, **When** `traverse` is called with two consumers, **Then** both consumers receive every subdirectory path and in the same alphabetical order.
3. **Given** a root directory that contains files alongside subdirectories, **When** `traverse` is called, **Then** only subdirectory paths are passed to consumers — files are ignored.

---

### User Story 2 - Log the Directory Name from a Path (Priority: P2)

A developer wants a ready-made consumer that logs only the final directory name extracted from a full path (e.g. logging `251013-some-description` from `/some/root/251013-some-description`). They can include this consumer in any traversal to produce a human-readable trace of visited directories.

**Why this priority**: Provides the first concrete implementation of the Consumer interface, validating the abstraction and supplying a reusable debugging/tracing tool.

**Independent Test**: Can be fully tested by invoking the consumer directly with a path like `/root/251014-some-other-description` and asserting the logged output equals `251014-some-other-description`.

**Acceptance Scenarios**:

1. **Given** a `ConsumerLogger` instance, **When** `consume` is called with a full directory path, **Then** only the last segment of the path (the directory name) is written to the log output.
2. **Given** a `ConsumerLogger` used in a traversal of the sample-posts directory, **When** traversal completes, **Then** the log contains exactly `251013-some-description`, `251014-some-other-description`, and `251015-third-description` in that order.

---

### User Story 3 - Verified Integration Test (Priority: P3)

A developer runs the automated test suite and receives confirmation that the traversal utility, the consumer interface, and the logger consumer all work together correctly against the existing sample-posts fixture directory.

**Why this priority**: Provides regression safety for the entire feature with a real directory fixture.

**Independent Test**: Can be fully tested by running the test file that executes `traverse` over the `sample-posts` fixture and asserting the `ConsumerLogger` recorded the three expected directory names.

**Acceptance Scenarios**:

1. **Given** the `sample-posts` test fixture containing at least the three directories `251013-some-description`, `251014-some-other-description`, `251015-third-description`, **When** the integration test runs, **Then** all assertions pass and the test suite reports success.

---

### Edge Cases

- What happens when the root directory itself does not exist? The traversal must not silently succeed — the caller should receive an indication of failure.
- What happens when the root directory contains no subdirectories? The consumers are never invoked and traversal completes without error.
- What happens when the consumers array is empty? Traversal iterates subdirectories but calls no consumers; no error is raised.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The codebase MUST expose a `Consumer` contract that any handler can implement; the contract requires a single operation that accepts a directory path as input.
- **FR-002**: The traversal utility MUST accept a root directory path and an ordered list of consumers, then iterate over each direct subdirectory of that root in ascending alphabetical order.
- **FR-003**: For each discovered subdirectory the traversal utility MUST invoke every consumer in the provided list, in list order, passing the full subdirectory path.
- **FR-004**: The traversal utility MUST process only direct subdirectories of the root — it MUST NOT recurse into nested subdirectories and MUST ignore any files present in the root.
- **FR-005**: The codebase MUST include a `ConsumerLogger` component that implements the `Consumer` contract and, when invoked, writes only the final directory name (the last segment of the path) to a log output.
- **FR-006**: An automated test MUST exist that invokes the traversal utility against the `sample-posts` fixture directory using a `ConsumerLogger`, and asserts that the logger recorded exactly the entries `251013-some-description`, `251014-some-other-description`, `251015-third-description` in that order.

### Key Entities

- **Consumer**: An abstract contract (interface) that represents any handler capable of processing a directory path. It defines the `consume` operation signature.
- **Traverse utility**: The function that orchestrates discovery of direct subdirectories and delegates each path to the registered consumers.
- **ConsumerLogger**: A concrete implementation of `Consumer` that extracts and logs the directory name from the supplied path.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All automated tests related to this feature pass with zero failures.
- **SC-002**: The traversal utility visits subdirectories in strictly ascending alphabetical order in every test run — order is deterministic and reproducible.
- **SC-003**: The `ConsumerLogger` produces log output containing only the directory name (not the full path) for every directory it processes.
- **SC-004**: A developer can add a new consumer by implementing a single-method contract without modifying the traversal utility — extensibility is verified by the presence of at least one concrete consumer alongside the contract definition.

## Assumptions

- The root directory is accessible and readable at the time of traversal.
- "Alphabetical order" means standard lexicographic (byte-value) ascending sort, which is consistent with how the three sample-posts fixture directories (`251013-…`, `251014-…`, `251015-…`) are named.
- Log output from `ConsumerLogger` is written to standard console output (sufficient for test capture via spy/mock).
- The sample-posts fixture directory already contains (or will contain before the test runs) the three expected subdirectories.
