# API Reference

Toutes les routes sont sous `/api/`. Réponses : `application/json` sauf `stream-events` (`text/event-stream`).

## GET /api/now-playing

Retourne le morceau en cours.

**200 OK**
```json
{
  "song": "Crazy",
  "artist": "Patsy Cline",
  "listeners": 7,
  "bitrate": 128,
  "fetchedAt": "2026-05-06T12:00:00.000Z"
}
```

**503 Service Unavailable** : pas encore initialisé (le serveur vient de démarrer, le premier poll n'a pas encore eu lieu).

## GET /api/history?limit=5

Retourne les N derniers morceaux distincts joués (max 20, défaut 5).

**200 OK**
```json
{
  "history": [
    { "song": "Crazy", "artist": "Patsy Cline", "playedAt": "2026-05-06T12:00:00Z" }
  ]
}
```

## GET /api/lyrics?artist=X&song=Y

Récupère les paroles via Vagalume (cachées 7 jours côté serveur).

**200 OK**
```json
{ "text": "...", "source": "vagalume", "available": true }
```

**400 Bad Request** : paramètres manquants.

## GET /api/stream-events

Server-Sent Events. Émet :

- `event: now-playing` à chaque changement de morceau
- `event: history-updated` après chaque mise à jour
- `: heartbeat` toutes les 25s pour empêcher la fermeture

**Exemple** :
```
event: now-playing
data: {"song":"Crazy","artist":"Patsy Cline",...}

: heartbeat
```
