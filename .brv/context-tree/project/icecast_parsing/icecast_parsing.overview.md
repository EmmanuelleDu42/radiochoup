### Key Points
- Focuses on the extraction and mapping of artist and song data from Icecast streams.
- Requires an explicit fallback mechanism for scenarios where the `songRaw` field is empty.
- Ensures data integrity in the mapping process to prevent missing metadata in the UI.

### Structure / Sections Summary
- **Reason &amp; Raw Concept**: Contextualizes the documentation within the RLM project.
- **Narrative**: Highlights the necessity of robust parsing logic for stream metadata.
- **Facts**: Specifies the technical requirement for handling empty fields.

### Notable Entities &amp; Patterns
- **Entities**: Icecast.
- **Patterns**: Fallback logic for empty fields (`songRaw`).