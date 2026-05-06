# Architecture

## Vue d'ensemble

Application Next.js 15 (App Router) en mode `standalone`. Aucune base de données : l'état temps réel ("now playing", historique) vit en mémoire serveur dans des singletons globaux.

```
┌──────────────┐     SSE      ┌─────────────────────┐
│   Client     │◀────────────▶│  Next.js (Node)     │
│ (React SPA)  │              │                     │
└──────────────┘              │  StreamSource       │
                              │  ├ poll Icecast 4s  │
                              │  └ broadcast        │
                              │                     │
                              │  HistoryStore       │
                              │  └ ring buffer 20   │
                              │                     │
                              │  MemoryCache        │
                              │  └ TTL key-value    │
                              └──────┬──────────────┘
                                     │
                              ┌──────▼──────┐
                              │  Icecast /  │
                              │  Shoutcast  │
                              └─────────────┘
```

## Décisions clés

- **Polling unique côté serveur** : un seul fetch Icecast toutes les 4 s, broadcast aux clients via SSE. Réduit la charge sur Icecast indépendamment du nombre d'auditeurs.
- **Historique en mémoire** : pour une radio web, 20 derniers morceaux suffisent largement. Pas de DB → simplicité opérationnelle.
- **Clés API privées côté serveur** : la clé Vagalume n'est jamais exposée au client.
- **App Router + Server Components** : la metadata SSR (titre, OG) suit le morceau en cours, ce qui améliore le SEO et le partage social.

## Couches

| Couche | Responsabilité | Localisation |
|---|---|---|
| Lib | Logique pure, parsers, clients HTTP | `lib/` |
| API routes | Endpoints HTTP / SSE | `app/api/` |
| Hooks | État client, audio, raccourcis | `hooks/` |
| Composants | UI atomique | `components/` |
| Pages | Composition + metadata SSR | `app/` |

Voir `docs/atomic/` pour les concepts détaillés.
