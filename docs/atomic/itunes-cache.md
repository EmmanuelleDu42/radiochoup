---
title: Cache iTunes (pochettes)
slug: itunes-cache
status: implemented
files:
  - lib/itunes.ts
  - lib/cache.ts
updated: 2026-05-06
---

# Cache iTunes

iTunes Search API est gratuite mais soumise à un rate limit (~20 req/min/IP). On cache les résultats par couple `(artist, song)` pendant `ITUNES_CACHE_TTL_S` (24 h par défaut).

## Quand le cache rate

- Premier passage d'un morceau : 1 appel iTunes
- Re-passage dans les 24 h : 0 appel
- Morceau introuvable sur iTunes : la pochette par défaut est servie ; on cache aussi le miss pour ne pas re-fetcher

## Tailles

iTunes ne renvoie que `100x100bb`. Les autres tailles (96, 128, 192, 256, 384, 512) sont dérivées par substitution dans l'URL.
