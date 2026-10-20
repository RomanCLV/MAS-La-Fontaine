# Module print (`src/js/print/feuilles.js`, `Recueil.Feuilles` + `src/css/feuilles.css`)

- `Feuilles.cuisine(donnees, semaine, creneau)` → élément `.feuille` (A4 paysage, 1123 × 794 px = 297 × 210 mm) reproduisant la maquette `Main` v2.1 : en-tête + TOTAL À PRODUIRE, pastilles « Sur ces N plats », tableau zones PARCS (+ activités, en-tête à la couleur de l'activité, + total parcs) / SODEXO / DIRECTION / AUTRES / TÉMOINS / TOTAL, sections REPAS (dont ligne « Plats témoins »), TEXTURES, RÉGIMES, OPTIONS (lignes issues du référentiel, Haché/Mixé en grand et colorés).
- `Feuilles.chariots(donnees, semaine, creneau)` → une ou plusieurs `.feuille` par parc et par activité ayant un volume > 0 (maquette `ChariotA`) : en-tête coloré, collectif (bacs), étiquettes 6 par page (page suivante si besoin).
- `Feuilles.construire(donnees, semaine, {cuisine, chariot, jours, services})` → fragment avec toutes les feuilles dans l'ordre jour × service.
- Impression : `#impression` (hors de l'application) reçoit les feuilles puis `window.print()`. CSS : `@page { size: A4 landscape; margin: 0 }`, saut de page entre feuilles, couleurs forcées (`print-color-adjust: exact`).
- Ajustement à la page : le tableau prend la place restante (`container-type: size`) ; `--n` = nombre de lignes (total/textures 1,4, bandeau 0,9) ; hauteur et texte des lignes réduits proportionnellement s'ils ne tiennent pas (sinon 20 px / 14 px comme la maquette).
- Lignes textures / régimes / options : seulement celles qui concernent le service ; groupe vide non affiché. Options « information » (pots gourmands) : groupe « INFORMATIONS (hors production) », quantité par zone.
- Petit déjeuner (présence seulement) : section REPAS (sans doubles plats ni pastilles « Sur ces N plats ») + éléments cochés pour ce service, total en « petits déj. » ; feuille chariot simple (`chariotSimple`) : bacs Résidents et Salariés, encadré « Particularités » (élément, nombre, noms), pas d'étiquettes.
- Aucune alerte, aucun texte « manager » sur les feuilles.
- Pots gourmands : petit déjeuner seulement (par défaut) ; groupe INFORMATIONS de la feuille cuisine et encadré Particularités du chariot.
