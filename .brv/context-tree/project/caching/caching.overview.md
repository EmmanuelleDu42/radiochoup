### Key Points
- Server-side caching is implemented using a Map-based store.
- Cache invalidation is handled via `expiresAt` timestamps.
- The cache is designed to survive Hot Module Replacement (HMR) during development.

### Structure / Sections Summary
- **Reason & Raw Concept**: Documentation of the server-side caching architecture.
- **Narrative**: Explains the implementation details and development environment considerations.
- **Facts**: Details the storage mechanism and singleton pattern.

### Notable Entities, Patterns, or Decisions
- **globalThis Singleton**: A pattern used to ensure the cache persists across module reloads in development.
- **Map-based Store**: The underlying data structure for the cache.
- **HMR Survival**: A specific technical requirement to maintain state during rapid development cycles.