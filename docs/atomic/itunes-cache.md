---
title: Cache iTunes (pochettes)
slug: itunes-cache
status: implemented
files:
  - lib/itunes.ts
updated: 2026-05-07
---

# Cache iTunes

iTunes Search API est gratuite mais soumise à un rate limit (~20 req/min/IP). On cache les résultats via `fetch({ next: { revalidate } })` de Next.js :

- 24 h pour les appels iTunes (`ITUNES_CACHE_TTL_S`, défaut 86400 s)
- 7 j pour les paroles Vagalume (`LYRICS_CACHE_TTL_S`, défaut 604800 s)

Le cache HTTP natif de Next.js est utilisé — pas de `MemoryCache` maison.

## Quand le cache rate

- Premier passage d'un morceau : 1 appel iTunes
- Re-passage dans les 24 h : 0 appel (réponse servée depuis le cache fetch)
- Morceau introuvable sur iTunes : la pochette par défaut est servie

## Tailles

iTunes ne renvoie que `100x100bb`. Les autres tailles (96, 128, 192, 256, 384, 512) sont dérivées par substitution du pattern `NxNbb` dans l'URL via `buildArtworkSizes()`.
