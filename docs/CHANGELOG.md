# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Unreleased]

### Paroles

- **Added** : fallback **lrclib.net** (gratuit, sans clé) quand Vagalume ne
  renvoie rien. Orchestrateur `lib/lyrics.ts` (Vagalume puis lrclib).
- **Fixed** : la fonctionnalité Paroles ne remontait plus rien depuis que
  l'API publique Vagalume renvoie 503 sur tous ses endpoints.

### Refonte complète (Next.js)

- **Added** : Next.js 15 App Router, React 19, TypeScript, Tailwind v4
- **Added** : SSE pour le push temps réel (`/api/stream-events`)
- **Added** : Cache iTunes (24h) et paroles Vagalume (7j) côté serveur
- **Added** : PWA installable (manifest + service worker)
- **Added** : SEO temps réel (titre/OG dynamique selon le morceau)
- **Added** : Tests Vitest + Playwright + GitHub Actions CI
- **Removed** : `api.php`, `index.php`, `js/`, `css/`, `player2/`, `js/old/`, `*.swf`, jQuery, Bootstrap 4, animate.css, Font Awesome, jPlayer
- **Changed** : historique stocké en mémoire (ring buffer 20) au lieu de `player.log`
- **Security** : clé API Vagalume déplacée côté serveur uniquement
- **Security** : vérification TLS réactivée (suppression de `CURLOPT_SSL_VERIFYPEER => false`)

## [1.0.0] — Legacy

État initial du dépôt : PHP + jQuery + Bootstrap 4.
