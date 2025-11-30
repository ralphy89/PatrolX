# Assets - Logo Patrol-X

Ce dossier contient les fichiers du logo Patrol-X.

## Fichiers

- `logo.svg` - Logo vectoriel (format principal)
- `logo.png` - Logo raster 512×512 (à générer depuis le SVG)

## Génération du PNG

Pour générer le PNG 512×512 depuis le SVG, vous pouvez utiliser :

### Option 1 : Inkscape (ligne de commande)
```bash
inkscape logo.svg --export-filename=logo.png --export-width=512 --export-height=512
```

### Option 2 : ImageMagick
```bash
convert -background none -resize 512x512 logo.svg logo.png
```

### Option 3 : Outil en ligne
- Utiliser un convertisseur SVG vers PNG en ligne
- Uploader `logo.svg` et télécharger en 512×512

### Option 4 : Figma / Adobe Illustrator
- Ouvrir le SVG dans Figma ou Illustrator
- Exporter en PNG 512×512

## Utilisation dans le code

Le logo est disponible via le composant React `Logo.jsx` :

```jsx
import Logo from './components/Logo'

<Logo width={40} height={40} />
```

Ou directement via le SVG dans `public/assets/logo.svg` :

```jsx
<img src="/assets/logo.svg" alt="Patrol-X" width="40" height="40" />
```

