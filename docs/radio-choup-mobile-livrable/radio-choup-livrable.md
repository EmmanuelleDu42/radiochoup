# Livrable de mise en page, visuel mobile Radio Choup

## Objectif

Créer une page verticale inspirée d’un écran type iPhone X, avec un ancien poste radio turquoise placé en bas de composition. Le visuel doit servir de fond principal, avec une grande zone respirante en haut permettant d’ajouter un titre, un menu, un bouton ou une accroche.

## Image fournie

Fichier à utiliser en priorité

`radio-choup-mobile-hero.webp`

Usage recommandé

- Format hero mobile
- Fond plein écran
- `object-fit: cover`
- `object-position: center bottom`
- Overlay sombre léger pour garantir la lisibilité du texte

## Intention graphique

L’image repose sur trois idées

1. Un poste radio rétro, chaleureux et identifiable
2. Un format très vertical, pensé pour mobile
3. Une respiration importante dans la partie haute, afin de ne pas écraser le contenu éditorial

## Palette recommandée

```css
:root {
  --radio-turquoise: #37cfc4;
  --radio-turquoise-dark: #0f8e86;
  --radio-wood: #8a481f;
  --radio-cream: #f5ead8;
  --radio-brown: #3a2618;
  --radio-text: #fffaf1;
}
```

## Structure HTML proposée

Voir le fichier `index.html`.

## CSS proposé

Voir le fichier `radio-choup-hero.css`.

## Recommandations d’intégration

- Ne pas centrer le poste radio au milieu de l’écran, il doit rester bas dans la composition
- Préserver la zone vide au-dessus du poste, c’est elle qui donne l’effet affiche mobile
- Ajouter un overlay plutôt qu’un rectangle opaque derrière le texte
- Utiliser un bouton crème ou blanc chaud, pas un blanc pur
- Éviter les typographies trop modernes ou trop corporate
- Préférer un titre court, très visuel, sur deux à quatre lignes

## Prompt d’exécution pour une IA de codage

Intègre le visuel `radio-choup-mobile-hero.webp` comme hero mobile plein écran. La composition doit être pensée comme un écran iPhone X, avec le poste radio en bas et une grande respiration en haut. Ajoute un overlay sombre léger en dégradé vertical pour garantir la lisibilité du texte sans masquer l’image. Crée une section avec un kicker, un titre fort, un paragraphe court et un bouton d’appel à l’action. Utilise les variables CSS fournies, un style doux, rétro, premium, et une mise en page responsive. Sur mobile, la section doit occuper toute la hauteur de l’écran. Sur desktop, elle peut rester dans un conteneur vertical centré pour conserver l’effet mobile.
