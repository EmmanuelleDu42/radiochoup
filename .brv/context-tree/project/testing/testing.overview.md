### Key Points
- Unit testing is handled by Vitest, currently comprising 41 tests.
- End-to-End (E2E) testing is performed via Playwright, currently comprising 11 tests.
- Uses a custom stub for `server-only` modules to facilitate testing in Node environments.
- Configures Vitest aliases to resolve these stubs during the test execution.

### Structure / Sections Summary
- **Narrative**: Overview of the testing suite and specific workarounds for Next.js features.
- **Facts**: Quantitative data on test coverage and specific stubbing techniques.

### Notable Entities, Patterns, or Decisions
- **Entities**: Vitest, Playwright.
- **Pattern**: Module stubbing for environment-restricted code (`tests/__stubs__/server-only.ts`).
- **Decision**: Use of Vitest aliases to handle Next.js-specific module constraints.