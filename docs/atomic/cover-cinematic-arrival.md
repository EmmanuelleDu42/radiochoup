---
title: Cover Cinematic Arrival
slug: cover-cinematic-arrival
status: implemented
files:
  - components/CoverArrivalAnimation.tsx
  - components/VinylDisc.tsx
  - components/Header.tsx
  - components/PlayerShell.tsx
  - lib/cover-animation-context.tsx
  - hooks/useTargetRect.ts
updated: 2026-05-08
---

# Cover Cinematic Arrival

À chaque changement de morceau (et donc de `cover.url`), une chorégraphie de ~3 s se joue par-dessus la page :

1. **0 → 0.81 s** — la nouvelle pochette tombe depuis le haut du viewport, atterrit centrée à l'écran et grossit (`scale 0.6 → 1.15`).
2. **1.2 → 3.0 s** — un disque vinyle SVG (avec la pochette comme label central) émerge derrière la pochette, dérive vers la gauche puis accélère vers le poste radio en tournant 3 tours, en s'estompant et en se réduisant pour donner l'illusion qu'il glisse derrière le châssis.
3. **1.8 → 3.0 s (chevauchant)** — la pochette continue sa trajectoire en diagonale vers le tableau cuisine en haut à droite et atterrit sur son emplacement (`#header-cover-art`), remplaçant la pochette précédente.

## Mécanique

- **Trigger** : `useEffect` dans `CoverArrivalAnimation` détecte un changement de `cover.url` après le premier mount (un `hasMountedRef` distinct du `previousUrlRef` pour ne pas confondre « jamais monté » avec « cover null »). Le premier mount ne joue jamais l'animation pour ne pas hijacker la page d'accueil.
- **Annulation/restart** : si une nouvelle URL arrive en plein vol, les `<motion.div>` ré-clavées sur `activeUrl` se démontent/remontent → l'animation repart à zéro.
- **Cibles dynamiques** : `useTargetRect("#header-cover-art")` et `useTargetRect("#radio-frame-bg")` recalculent les positions au runtime (resize/scroll). Pas de coordonnées hardcodées.
- **Synchronisation avec la pochette épinglée** : le contexte `CoverAnimationContext` expose `isAnimating`. Le `<Header>` masque sa pochette (`opacity 0`) pendant la séquence, puis la fait réapparaître en fondu (250 ms) à la fin — la pochette animée « devient » la pochette épinglée sans coupure visuelle.
- **Z-index** : l'overlay est en `position: fixed` z-index 9000, `pointer-events: none` (n'intercepte aucun clic).

## Couplage cover ↔ vinyle

Les durées sont couplées : la pochette s'anime sur 3 s, le vinyle démarre à `delay: 1.2` avec `duration: 1.8` et finit donc aussi à t = 3 s. `onAnimationComplete` est posé sur la pochette uniquement (callback unique pour `endAnimation()` + `setActiveUrl(null)`).

## Architecture data-flow

Avant ce travail, le `<Header>` recevait `cover` en prop SSR depuis `app/page.tsx` (Server Component) — figé au load initial. Désormais il consomme directement `useStreamEvents()` (singleton SSE refcounté) + `useCover(initialCover)`, exactement comme `PlayerShell`. Source unique → deux abonnés → une seule connexion SSE.

## Points d'attention

- L'overlay est monté dans `PlayerShell` (un seul endroit). Le `CoverAnimationProvider` enveloppe l'arbre dans `app/page.tsx` pour que Header et PlayerShell partagent l'état `isAnimating`.
- Le hook `useCoverAnimation()` **throw** s'il est utilisé hors du provider — convention React stricte. Les tests unitaires wrappent toujours dans le provider.
- Vitest utilise `jsx: "preserve"` sans `@vitejs/plugin-react` → tout fichier `.tsx` testé doit `import React from "react"` explicitement.
