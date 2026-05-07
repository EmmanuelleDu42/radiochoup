# Visual Fidelity Plan — Radio Choup Refonte

> **For agentic workers:** Use ce plan pour atteindre une fidélité visuelle stricte au site de référence https://www.radiochoup.com/, avec une modernisation **uniquement sur la gestion de l'espace** (pas de changement de charte graphique ni d'image de la radio).

**Goal:** Reproduire scrupuleusement la charte graphique et l'image de la radio du site de référence, tout en améliorant l'occupation de l'espace (modernité spatiale) et avec un mobile digne de ce nom.

**Stack:** Next.js 15.2 / React 19 / Tailwind v4 + framer-motion (déjà en place).

---

## Charte graphique (à respecter SCRUPULEUSEMENT)

### Couleurs (extraites du legacy)
- **Fond page** : `#CD7784` (rose principal) avec image `bg_c.jpg` en `no-repeat top center`
- **Header** : background `background_menu.png` repeat
- **Footer** : background `background_footer.png` repeat
- **Liens menu** : `#ef929d` (rose poudré), border-top/bottom `2px dotted #ef929d`
- **Texte radio (song/artist)** : `#fff` sur la radio
- **Volume slider** : track `#fff`, accent `#71bfbb` (turquoise sur l'icône)
- **Volume bubble** : `#a992bd` (mauve)
- **Title song color** : `#a992bd`

### Typographie
- **Body** : `"Trebuchet MS", Arial, Helvetica, sans-serif`, `font-size: 11px` (legacy mais à moderniser à 14-16px pour lisibilité)
- **Info song** : `'Share', sans-serif` (Google Fonts)
- **Liens menu** : font-size `1.3em`

### Images CRITIQUES (à utiliser TELS QUELS, pas de remplacement)
- `/img/bg_c.jpg` : fond pleine page
- `/img/background_menu.png` : header bandeau
- `/img/background_footer.png` : footer bandeau
- `/img/radio_ancienne.png` : châssis radio desktop (673×475)
- `/img/radio_ancienne_gsm.jpg` : châssis radio mobile (370×600)
- `/img/Tableau.png` : tableau cuisine (cover-album frame, position fixed haut-droite)
- `/img/logo.png` : logo Radio Choup
- `/img/appstore.jpg` : bandeau pub gauche
- `/img/FaitesUnDon.png` : bandeau pub centre
- `/img/pub_polkamatik.png` : bandeau pub droite (lien Deguizland)
- `/img/lecteur/btn_pause.png` + `btn_play.png` : boutons play/pause (53px de haut)

### Layout (legacy)
- `#page` : `max-width: 964px` (page centrée)
- `#header` : `height: 146px`, `max-width: 964px`
- `#logo` : `height: 100px`, `col-3` (3/12)
- `#links_block_left` : `col-6` (6/12), `margin-top: 38px`, ul horizontale
- `#TableauCuisine` : `col-3`, `position: fixed` avec `Tableau.png` en background
- `.web-player` : `673×475` desktop, image `radio_ancienne.png`
- `.web-playerGSM` : `370×600` mobile, image `radio_ancienne_gsm.jpg`
- `#currentCoverArt` : positionné `top:61px, left:37px, width:32%, height:32%` du player (intégré dans le tableau cuisine)
- `.covert-position` (zone contrôles desktop) : `top: 280px, left: 7px`
- `.covert-position-gsm` (zone titre mobile) : `top: 242px, left: -19px`
- `.covert-position-gsm-btn` (zone bouton mobile) : `top: 185px, left: -6px`
- Bandeau `#promo` en bas, 3 colonnes : `col-4 + col-4 + col-4`

---

## Modernité spatiale (gestion de l'espace AMÉLIORÉE)

### Améliorations légitimes (pas une rupture de charte)
1. **Responsive fluide** : pas de `max-width: 964px` figé. Sur grands écrans, élargir la zone (ex: `max-w-7xl` ou viewport-aware).
2. **Mobile UX moderne** : la radio mobile actuelle (370×600 fixe) doit être remplacée par un vrai layout mobile-first :
   - Header compact en haut (logo + nav burger)
   - Cover art bien visible (pas vide comme actuellement)
   - Contrôles play/pause/volume accessibles, gros boutons tactiles (48×48 min)
   - Now-playing avec scroll horizontal si trop long
   - Modales (history, lyrics, programme) accessibles via icônes
3. **Espacement vertical** : aérer entre header / radio / pub / footer (le legacy est compact)
4. **Hover/focus états** : ajouter feedback subtil au hover des liens (transition 0.2s) — pas de couleur changée, juste opacité/decorations
5. **Animations subtiles** : framer-motion pour l'apparition des morceaux (déjà en place)
6. **Accessibilité** : aria-labels, focus visible, navigation clavier — déjà en partie en place

### Ce qui DOIT rester identique (charte)
- Couleurs exactes
- Image de la radio (`radio_ancienne.png` / `radio_ancienne_gsm.jpg`) à l'identique
- Logo
- Tableau cuisine décoratif en haut-droite
- Bandeau pub bas (3 visuels)
- Background avec motifs (`bg_c.jpg`)

---

## Sections à implémenter / corriger

### 1. Background page
- Body : `background-color: #CD7784` + image `bg_c.jpg` en `no-repeat top center` (légèrement adaptée pour viewports modernes)
- Pas de fond rose uni — RÉGRESSION ACTUELLE à corriger

### 2. Header
- Réintroduire les 3 liens (`Qui sommes nous`, `Suggestion`, `Faites un don`) — même non fonctionnels, ils font partie de la charte. On peut les transformer en `<button>` désactivés ou les pointer vers des sections placeholder.
- Background : `background_menu.png` repeat
- Logo à gauche, liens centre, **Tableau cuisine + cover album** à droite

### 3. Tableau cuisine + Cover Album
- Image `Tableau.png` en background décoratif fixe (position top-right) ou intégrée dans le header (col-3 droit)
- Cover art positionnée DANS le tableau (intégrée)
- Sur mobile : pas de tableau (espace insuffisant), mais cover bien mise en avant

### 4. Player desktop
- Image `radio_ancienne.png` en background fixe (673×475)
- Sur grand écran moderne : conteneur peut être plus large (responsive), mais l'image radio garde ses proportions (utiliser `object-contain` ou `bg-contain`)
- Contrôles SUR la radio :
  - Volume slider (gauche) avec icône turquoise `#71bfbb`
  - Now-playing (centre) en blanc avec animation flipInY
  - Bouton play `btn_play.png` / `btn_pause.png` (droite, 53px)
- Sous la radio (ou dans la zone contrôles) : 3 liens texte `Paroles | Historique | Programme`

### 5. Player mobile
- Image `radio_ancienne_gsm.jpg` en background, **portrait** (370×600 ratio mais responsive)
- Cover art DANS la radio (pas de rectangle vide rose)
- Now-playing visible en grand
- Bouton play GROS (60×60+) au-dessus
- Volume slider compact en dessous
- 3 liens (Paroles/Historique/Programme) accessibles soit en boutons soit en footer fixe
- Sur très petit écran : adapter le ratio sans casser l'image radio

### 6. Bandeau promo
- 3 colonnes de hauteur égale, centrées sous le player
- `appstore.jpg` (gauche) + `FaitesUnDon.png` (centre) + `pub_polkamatik.png` (droite, lien externe Deguizland)
- Sur mobile : empilé verticalement
- Background blanc derrière chaque image

### 7. Footer
- Background `background_footer.png` repeat
- Texte centré : "Webdesign MP Pastini — Développement Cef-i — Radio Choup, tous droits réservés"
- Lien externe MP Pastini OK, le reste en `<span>`

### 8. Modales (déjà en place via `<Modal>`)
- Style ajusté pour matcher : background dark `rgba(0,0,0,0.8)`, border-radius 0, text noir/blanc
- Mais le composant `<Modal>` actuel a un fond clair. À harmoniser : dark theme sur les modales (charte legacy) + bouton close discret.

---

## Plan d'exécution (boucles de rétroaction)

### Cycle 1 — Implémentation initiale fidèle
- Réécrire `app/globals.css` avec les couleurs/typo legacy
- Réécrire `components/Header.tsx` avec menu + tableau cuisine intégré
- Réécrire `components/Player.tsx` avec image radio_ancienne en bg + positionnement contrôles
- Réécrire `components/PlayerMobile.tsx` avec image radio_ancienne_gsm + layout mobile UX correct
- Ajouter composant `components/PromoBar.tsx` (bandeau pub 3 cols)
- Adapter `components/Footer.tsx` avec background_footer.png
- Ajuster `components/Modal.tsx` pour theme dark legacy

### Cycle 2 — Screenshot + diff visuel
- Lancer Playwright (script `compare.mjs`) pour 4 captures :
  - localhost desktop 1440×900
  - localhost mobile 390×844
  - reference desktop 1440×900
  - reference mobile 390×844
- Reviewer agent : liste les écarts visuels précis (positionnement, couleurs, espacement, alignements)

### Cycle 3 — Fix ciblé
- Agent fix les écarts identifiés (positions exactes, marges, alignements)
- Re-screenshot, re-diff

### Cycle N — Itération jusqu'à convergence
- Si écarts résiduels acceptables (modernité spatiale OK) → DONE
- Sinon → cycle suivant

### Validation finale
- `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:e2e` doivent tous passer
- Visual diff < 10% (ou jugement d'agent reviewer = "fidèle avec modernisation cohérente")

---

## Ressources légères côté implémentation

### Fond d'écran cuisine `bg_c.jpg`
Test direct dans `app/globals.css` :
```css
body {
  background-color: #cd7784;
  background-image: url('/img/bg_c.jpg');
  background-repeat: no-repeat;
  background-position: top center;
  background-attachment: fixed;
}
```

### Trebuchet MS au global
```css
body {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
}
```
+ Import Google Fonts "Share" pour `info-current-song`.

### Tailwind theme étendu
Dans `app/globals.css` :
```css
@theme {
  --color-choup-pink: #cd7784;
  --color-choup-pink-soft: #ef929d;
  --color-choup-mauve: #a992bd;
  --color-choup-turquoise: #71bfbb;
}
```
