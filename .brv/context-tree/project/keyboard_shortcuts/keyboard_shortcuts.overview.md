### Key Points
- Keyboard shortcuts are managed via a custom `useKeyboardShortcuts` hook.
- The system prevents shortcut triggers when the user is interacting with text inputs.
- Focus management is prioritized to ensure shortcuts don't interfere with standard browser/user behavior.

### Structure / Sections Summary
- **Reason & Raw Concept**: Documentation of the keyboard interaction logic.
- **Narrative**: Highlights the configuration of the shortcut hook.
- **Facts**: Specifies the HTML tags excluded from shortcut triggers.

### Notable Entities, Patterns, or Decisions
- **useKeyboardShortcuts**: The primary React hook for handling global key events.
- **Target Filtering**: A decision to ignore `INPUT` and `TEXTAREA` elements to protect user input.