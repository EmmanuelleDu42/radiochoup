### Key Points
- Strict separation between server-side and client-side environment variables.
- `env.server.ts` handles sensitive data using `server-only` imports.
- Implements lazy loading for server variables to optimize performance.
- `env.client.ts` ensures only non-sensitive variables are exposed to the browser.

### Structure / Sections Summary
- **Narrative**: Explains the logic behind splitting environment variables.
- **Facts**: Technical implementation details regarding file naming and security.

### Notable Entities, Patterns, or Decisions
- **Pattern**: Data leakage prevention via file-based separation.
- **Decision**: Use of `server-only` package to enforce environment boundaries.
- **Entities**: `env.server.ts`, `env.client.ts`.