### Key Points
- Modernization of a legacy radio player using a tech stack of Next.js 15.2, React 19, TypeScript 5.6, and Tailwind CSS v4.
- Implements a singleton server-side polling strategy for Icecast/Shoutcast metadata with SSE broadcasting to clients every 4 seconds.
- Replaces legacy file-based logging with an in-memory ring buffer for song history (20-entry capacity).
- Features a robust caching policy for external metadata: 24 hours for iTunes covers and 7 days for lyrics.
- Comprehensive 11-phase execution strategy covering 48 tasks and 189 atomic steps, including a transition from legacy PHP files.

### Structure / Sections Summary
- **Reason & Raw Concept**: Outlines the initial project motivation and the basic flow from configuration to audio streaming.
- **Narrative**: Describes the project organization (css/, js/, img/, fonts/) and legacy dependencies like jQuery and Bootstrap.
- **Facts**: A detailed technical specification covering the modern tech stack, polling mechanisms, security headers, PWA implementation, and testing frameworks.

### Notable Entities, Patterns, or Decisions
- **Entities**: Icecast/Shoutcast (metadata sources), Vagalume API (lyrics), iTunes (image hosting), Vitest/Playwright (testing).
- **Patterns**: Atomic Design for UI components, Server-Sent Events (SSE) for state broadcasting, and custom React hooks (`useAudioPlayer`, `useNowPlaying`).
- **Decisions**: Use of `server-only` imports for API security, manual PWA service worker implementation, and standalone output configuration for flexible deployment (VPS, Docker, Vercel).