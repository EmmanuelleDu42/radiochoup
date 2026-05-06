---
children_hash: d08aa6b515cf9b0651ab9093a404143a4a46716fe6da8b33b83e9d29ad9955b5
compression_ratio: 0.8417721518987342
condensation_order: 3
covers: [project/_index.md]
covers_token_total: 632
summary_level: d3
token_count: 532
type: summary
---
# RadioChoup Structural Overview (Level d3)

## Core Architecture and Strategic Transformation
RadioChoup is undergoing a strategic migration from a legacy PHP infrastructure to a modern **Next.js 15.2 (App Router)** stack. The architecture leverages **React 19**, **TypeScript 5.6**, and **Tailwind CSS v4** to improve performance, security, and developer experience. The transition follows a structured 11-phase roadmap currently focused on the `refactor/redesign` branch (see **project/_index.md**).

## Key Architectural Decisions
*   **Real-Time Data Flow**: Implementation of a **Singleton StreamSource** for Icecast/Shoutcast polling (4s intervals) and **SSE (Server-Sent Events)** for real-time "now-playing" updates, replacing legacy client-side polling.
*   **State & Buffer Management**: Use of an in-memory 20-entry ring buffer for song history to replace the legacy `player.log`.
*   **Caching Strategy**: Optimized data fetching using `unstable_cache` with specific TTLs (24h for iTunes covers; 7d for Vagalume lyrics).
*   **UI/UX Patterns**: Adoption of **Atomic Design** principles and logic encapsulation within custom hooks such as `useAudioPlayer` and `useNowPlaying`.

## Legacy Integration and Infrastructure
*   **Legacy Support**: Gradual phase-out of `api.php` and `index.php` (Phase 10), with critical logic temporarily preserved in `js/script.js` and `config/player_config.js`.
*   **Deployment & Testing**: Support for VPS/PM2, Docker, and Vercel; testing is standardized via **Vitest** (unit) and **Playwright** (E2E).
*   **PWA**: Integration of manual manifests for Progressive Web App capabilities.

## Knowledge Organization
Detailed information is partitioned across the following entries:
*   **project/context.md**: Core architectural components and global configurations.
*   **project/architecture/_index.md**: Deep-dive into technical decisions, data flows, and implementation phases.
*   **project/architecture/radiochoup_overview.md**: Mapping of legacy assets and specific project structures.
*   **project/architecture/context.md**: High-level project objectives and design philosophy.