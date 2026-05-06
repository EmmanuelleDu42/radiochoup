---
children_hash: 437f8e4b6e7e8fc74657b4e905bca399dc68f9be63df6b22f8cfcb88ef3f38e4
compression_ratio: 0.8155619596541787
condensation_order: 2
covers: [architecture/_index.md, context.md]
covers_token_total: 694
summary_level: d2
token_count: 566
type: summary
---
# Project Architecture & Structural Overview

## Overview
RadioChoup is a web-based radio player undergoing a strategic transformation from a legacy, PHP-centric asset structure to a modern Next.js 15.2 stack. The architecture prioritizes server-side efficiency, real-time synchronization via Server-Sent Events (SSE), and a centralized implementation strategy focused on performance and security.

## Architectural Decisions & Technology Stack
*   **Modern Stack**: Next.js 15.2 (App Router), React 19, TypeScript 5.6, and Tailwind CSS v4.
*   **State & Stream Management**:
    *   **Singleton StreamSource**: Centralized Icecast/Shoutcast polling (4s interval) with parser logic for artist, title, and bitrate extraction.
    *   **SSE Broadcast**: Real-time 'now-playing' distribution to clients, replacing legacy polling.
    *   **In-Memory Buffer**: 20-entry ring buffer for song history, replacing `player.log`.
*   **Caching Strategy**: Implemented via `unstable_cache` with a 24-hour TTL for iTunes covers and 7-day TTL for Vagalume lyrics.
*   **Legacy Support**: Gradual phase-out of `api.php` and `index.php` (Phase 10), with existing logic preserved in `js/script.js` and `config/player_config.js`.

## Implementation & Workflow
*   **Design Pattern**: UI organization follows Atomic Design; logic is encapsulated in custom hooks like `useAudioPlayer` and `useNowPlaying`.
*   **Infrastructure**: PWA capabilities via manual manifests; testing coverage through Vitest (unit) and Playwright (E2E).
*   **Deployment**: Flexible support for VPS/PM2 standalone output, Docker, or Vercel.
*   **Execution**: Development is focused on the `refactor/redesign` branch following a structured 11-phase roadmap.

## Structural Organization
The project knowledge is organized into two primary areas:
*   **Project Context**: Defines the broad scope of architectural information, including core components and global configurations (see **context.md**).
*   **Architectural Details**: Deep-dive into technical decisions, data flows, and implementation phases (see **architecture/_index.md**).

For detailed mapping of legacy assets and specific project structures, refer to **radiochoup_overview.md**. For high-level objectives, see **architecture/context.md**.