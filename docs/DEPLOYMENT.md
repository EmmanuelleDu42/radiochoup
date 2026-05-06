# Déploiement

## Variables d'environnement requises

Voir `.env.example` à la racine. Les `NEXT_PUBLIC_*` sont exposées au client ; toutes les autres restent serveur.

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `STREAM_TYPE` | non | `icecast` | `icecast` ou `shoutcast` |
| `STREAM_URL` | oui | — | URL du flux audio |
| `STREAM_STATUS_URL` | oui | — | Endpoint de statut JSON Icecast (si applicable) |
| `NOW_PLAYING_POLL_INTERVAL_MS` | non | `4000` | Intervalle de polling côté serveur |
| `VAGALUME_API_KEY` | oui | — | Clé API Vagalume (server-only) |
| `ITUNES_CACHE_TTL_S` | non | `86400` | Cache iTunes en secondes |
| `LYRICS_CACHE_TTL_S` | non | `604800` | Cache paroles en secondes |
| `NEXT_PUBLIC_RADIO_NAME` | non | `Radio Choup` | Nom affiché |
| `NEXT_PUBLIC_DEFAULT_COVER` | non | `/img/bg-capa.jpg` | Pochette par défaut |
| `NEXT_PUBLIC_SITE_URL` | oui | — | URL canonique du site |

## Option 1 — VPS Node + PM2 (proche du legacy)

```bash
# Sur le serveur
git clone https://github.com/EmmanuelleDu42/radiochoup.git
cd radiochoup
git checkout main
pnpm install --frozen-lockfile
cp .env.example .env.local
# éditer .env.local avec les vraies valeurs
pnpm build
pm2 start ".next/standalone/server.js" --name radiochoup
pm2 save
```

Front-end : nginx/apache en proxy_pass vers `http://127.0.0.1:3000`.

## Option 2 — Docker

```bash
docker build -t radiochoup:latest .
docker run -d \
  --name radiochoup \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  radiochoup:latest
```

## Option 3 — Vercel

Connecter le dépôt GitHub via [vercel.com/new](https://vercel.com/new). Renseigner les variables d'environnement dans Project Settings → Environment Variables. Le build et le déploiement sont automatiques sur push vers `main`.

**Attention** : la Phase 10 nettoie les anciens fichiers PHP. Si vous laissez tourner l'ancien hébergement Apache en parallèle pendant la transition, prévoyez un DNS de bascule.

## Vérifications post-déploiement

```bash
# Page principale
curl -sI https://www.radiochoup.com/ | head -1   # 200

# API
curl -s https://www.radiochoup.com/api/now-playing
curl -s https://www.radiochoup.com/api/history?limit=5

# SSE (devrait commencer à streamer)
curl -N -s https://www.radiochoup.com/api/stream-events | head -c 500
```

## Rollback

`refactor/redesign` étant mergé via PR vers `dev` puis `main`, un rollback se fait par revert du merge commit.
