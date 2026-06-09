---
title: Paroles (chaîne de fallback)
slug: lyrics
status: implemented
files:
  - lib/lyrics.ts
  - lib/vagalume.ts
  - lib/lrclib.ts
  - app/api/lyrics/route.ts
  - hooks/useLyrics.ts
updated: 2026-06-09
---

# Système de paroles

Les paroles sont récupérées **côté serveur** (clés protégées par `server-only`)
et exposées via `GET /api/lyrics?artist=X&song=Y`. Le hook client `useLyrics`
consomme cette route. Toutes les réponses suivent le contrat `Lyrics` :
`{ text, source, available }`.

## Chaîne de fallback (`lib/lyrics.ts`)

`getLyrics()` interroge les fournisseurs dans l'ordre et renvoie le premier
disponible :

1. **Vagalume** (`lib/vagalume.ts`, `source: "vagalume"`) - fournisseur
   historique, nécessite `VAGALUME_API_KEY`.
2. **lrclib.net** (`lib/lrclib.ts`, `source: "lrclib"`) - base communautaire
   gratuite, **sans clé**, endpoint `GET https://lrclib.net/api/search`.

Si les deux échouent : `{ text: null, source: null, available: false }`.

## Pourquoi le fallback

Depuis mi-2026, `api.vagalume.com.br` renvoie **503 sur tous ses endpoints**
(le site `www.` fonctionne, mais l'API publique est coupée). Sans fallback,
la fonctionnalité Paroles ne remontait plus jamais rien. lrclib comble ce trou.

## Détails d'implémentation

- Chaque fournisseur **échoue silencieusement** (timeout
  `EXTERNAL_FETCH_TIMEOUT_MS`, `try/catch`, validation Zod) : une panne ne
  casse pas l'app, l'orchestrateur passe simplement au suivant.
- `search()` de lrclib est flou et renvoie plusieurs candidats : on prend le
  **premier dont `plainLyrics` est non vide** (les instrumentaux reviennent
  avec un `plainLyrics` vide).
- lrclib expose aussi `syncedLyrics` (format LRC, paroles synchronisées) :
  non consommé pour l'instant, mais disponible pour un futur mode karaoké.
- Cache : `fetch({ next: { revalidate: LYRICS_CACHE_TTL_S } })`, 7 jours.
- lrclib demande un `User-Agent` identifiant l'app (nom + lien).
