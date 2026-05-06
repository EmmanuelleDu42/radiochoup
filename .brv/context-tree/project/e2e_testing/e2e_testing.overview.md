### Key Points
- Playwright is utilized for End-to-End (E2E) testing.
- Tests require specific selector handling due to simultaneous rendering of UI components.
- CSS is used to toggle visibility between different device views rather than conditional rendering.

### Structure / Sections Summary
- **Reason & Raw Concept**: Establishes the need for documenting testing constraints.
- **Narrative**: Explains the technical quirk of the player rendering.
- **Facts**: Details the specific Playwright method required for successful tests.

### Notable Entities, Patterns, or Decisions
- **.first() Selectors**: A mandatory pattern in Playwright to handle duplicate DOM elements.
- **Simultaneous Rendering**: A design decision where both Desktop and Mobile players exist in the DOM at once.
- **CSS Toggling**: The mechanism used to switch between player views.