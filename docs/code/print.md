# Module print (`src/js/print/feuilles.js`, `Recueil.Feuilles` + `src/css/feuilles.css`)

- `Feuilles.cuisine(donnees, semaine, creneau)` → élément `.feuille` (A4 paysage, 1123 × 794 px = 297 × 210 mm) reproduisant la maquette `Main` v2.1 : en-tête + TOTAL À PRODUIRE, pastilles « Sur ces N plats », tableau zones PARCS (+ activités, en-tête à la couleur de l'activité, + total parcs) / SODEXO / DIRECTION / AUTRES / TÉMOINS / TOTAL, sections REPAS (dont ligne « Plats témoins »), TEXTURES, RÉGIMES, OPTIONS (lignes issues du référentiel, Haché/Mixé en grand et colorés).
- `Feuilles.chariots(donnees, semaine, creneau)` → une ou plusieurs `.feuille` par parc et par activité ayant un volume > 0 (maquette `ChariotA`) : en-tête coloré, collectif (bacs), étiquettes 6 par page (page suivante si besoin).
- `Feuilles.construire(donnees, semaine, {cuisine, chariot, jours, services})` → fragment avec toutes les feuilles dans l'ordre jour × service.
- Impression : `#impression` (hors de l'application) reçoit les feuilles puis `window.print()`. CSS : `@page { size: A4 landscape; margin: 0 }`, saut de page entre feuilles, couleurs forcées (`print-color-adjust: exact`).
- Petit déjeuner (présence seulement) : feuille cuisine réduite à la section REPAS (sans doubles plats ni pastilles « Sur ces N plats »), total en « petits déj. » ; feuille chariot simple (`chariotSimple`) : bacs Résidents et Salariés, pas d'étiquettes.
- Aucune alerte, aucun texte « manager » sur les feuilles.
- Pots gourmands : absents de la feuille cuisine (information, hors production) ; affichés en pastille sur l'étiquette du résident.
