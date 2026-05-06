---
title: Streaming Source (singleton serveur)
slug: streaming-source
status: implemented
files:
  - lib/stream-source.ts
  - lib/icecast.ts
  - lib/shoutcast.ts
updated: 2026-05-06
---

# Streaming Source

Singleton qui poll Icecast/Shoutcast à intervalle fixe (`NOW_PLAYING_POLL_INTERVAL_MS`, défaut 4 s) et publie les changements à un ensemble de subscribers (les connexions SSE ouvertes).

## Garanties

- Un seul timer global, peu importe le nombre de clients
- Une entrée d'historique n'est ajoutée que si elle diffère de la dernière (déduplication)
- Les subscribers reçoivent la valeur courante immédiatement à la souscription

## Points d'attention

- Le singleton vit dans `globalThis.__streamSource` pour survivre au HMR en dev
- En production sur Vercel (serverless), chaque instance lambda a son propre singleton ; pour ce mode, prévoir un store partagé (Redis) si l'on monte en charge
