---
title: Server-Sent Events (push temps réel)
slug: server-sent-events
status: implemented
files:
  - app/api/stream-events/route.ts
  - hooks/useNowPlaying.ts
  - hooks/useHistory.ts
updated: 2026-05-06
---

# Server-Sent Events

Le serveur expose `/api/stream-events` qui retourne un `ReadableStream` au format `text/event-stream`. Les événements émis :

- `now-playing` (objet `NowPlaying`)
- `history-updated` (tableau d'`HistoryEntry`)
- ligne `: heartbeat` toutes les 25 s pour empêcher la fermeture par les proxies

## Pourquoi SSE et pas WebSocket ?

Le besoin est unidirectionnel (serveur → client). SSE marche over HTTP/1.1, sans handshake spécial, sans dépendance, et reconnecte automatiquement côté navigateur via `EventSource`.

## Points d'attention

- L'unsubscribe doit être nettoyé sinon les listeners s'accumulent
- En reverse proxy nginx, ajouter `proxy_buffering off` sur ce path
