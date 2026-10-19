# Module print (`src/js/print/feuilles.js`, `Recueil.Feuilles` + `src/css/feuilles.css`)

- `Feuilles.chef(donnees, semaine, creneau)` → élément `.feuille` (A4 paysage, 1123 × 794 px = 297 × 210 mm) reproduisant la maquette `Main` v2.1 : en-tête + TOTAL À PRODUIRE, pastilles « Sur ces N plats », tableau zones PARCS (+ activités + total parcs) / SODEXO / DIRECTION / AUTRES / TOTAL, sections REPAS, TEXTURES, RÉGIMES, OPTIONS (lignes issues du référentiel, Haché/Mixé en grand et colorés).
- `Feuilles.chariots(donnees, semaine, creneau)` → une ou plusieurs `.feuille` par parc et par activité ayant un volume > 0 (maquette `ChariotA`) : en-tête coloré, collectif (bacs), étiquettes 6 par page (page suivante si besoin).
- `Feuilles.construire(donnees, semaine, {chef, chariot, jours, services})` → fragment avec toutes les feuilles dans l'ordre jour × service.
- Impression : `#impression` (hors de l'application) reçoit les feuilles puis `window.print()`. CSS : `@page { size: A4 landscape; margin: 0 }`, saut de page entre feuilles, couleurs forcées (`print-color-adjust: exact`).
- Aucune alerte, aucun texte « manager » sur les feuilles.
- Pots gourmands : absents de la feuille chef (information, hors production) ; affichés en pastille sur l'étiquette du résident.
