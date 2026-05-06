### Key Points
- Implements server-side polling for external audio sources.
- Supports both Icecast and Shoutcast protocols.
- Delivers real-time data to the client using Server-Sent Events (SSE).
- Utilizes a singleton pattern for managing the stream-source.

### Structure / Sections Summary
- **Narrative**: High-level description of the data flow from source to client.
- **Facts**: Specific protocols and communication patterns used for streaming metadata.

### Notable Entities, Patterns, or Decisions
- **Pattern**: Singleton stream-source management.
- **Pattern**: Server-Sent Events (SSE) for real-time updates.
- **Entities**: Icecast, Shoutcast.