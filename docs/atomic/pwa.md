---
title: Progressive Web App
slug: pwa
status: implemented
files:
  - public/manifest.webmanifest
  - public/sw.js
  - components/ServiceWorkerRegister.tsx
updated: 2026-05-06
---

# PWA

Manifest + service worker minimal pour installation native.

## Cache strategy

- **Cache-first** : pages, manifest, icônes
- **Network only** : `/api/*` et le flux audio (`/stream`)

## Installation

Sur Chrome/Android, le navigateur propose "Ajouter à l'écran d'accueil" automatiquement après quelques secondes. Sur iOS, l'utilisateur doit passer par le menu de partage.
