# Module ui (`src/js/ui/`)

| Fichier | Rôle |
|---|---|
| `outils.js` | `Recueil.h(tag, attrs, ...enfants)` (création DOM sans `innerHTML` ⇒ pas d'injection), formats de dates français |
| `app.js` | `Recueil.App` : état (données + état UI), sauvegarde, barre du haut, menu Pages, onglets, rendu |
| `page-semaine.js` | Saisie : alertes (manager), bandeau activités, onglets de parcs, grille présences, salariés, Sodexo, Direction, Nettoyage |
| `page-residents.js` / `page-resident.js` | Bascule Liste / Tableau (mémorisée). Liste type TYPOLOGIE (éditer / archiver / supprimer au survol) ; Tableau : une colonne par texture/régime/option, clic = X, brouillon enregistré d’un coup (cases modifiées entourées) ; fiche + absences |
| `page-parcs.js` / `page-regimes.js` | Référentiels (nom, couleur, ordre ; nature et effet pour les régimes) |
| `page-activites.js` | Activités de la semaine, presets (charger, mettre à jour, enregistrer) |
| `page-fichier.js` | Accueil, page Importer, page Exporter |
| `page-imprimer.js` | Choix semaine/jours/services/type, aperçu, impression |

## Principes
- Onglet = `{type, id?}`, clé `type:id`. Onglets ouverts, actif et « fermés récemment » mémorisés (`localStorage['recueil.ui']`) et **restaurés** à la réouverture.
- Chaque page = `Recueil.Pages[type] = { titre(onglet), rendu(onglet) }`. Toute modification passe par `App.modifier(fn)` : applique, sauvegarde, re-rend (option `sansRendu` pour les champs numériques, pour garder le focus).
- Brouillons (fiche résident, tableau des résidents, activité, édition de parc/régime) : en mémoire jusqu'à « Enregistrer ». Chaque page déclare `modifie(onglet)` / `abandonner(onglet)` ; `App.indicateur()` affiche « Modifications non enregistrées » près du titre et `•` sur l'onglet ; confirmation avant de fermer l'onglet, de changer d'élément édité ou de quitter le navigateur. Pendant la frappe : `App.signalerModif()` (sans re-rendu, garde le focus).
- Mode manager : bouton de la barre du haut ; seul effet = afficher les alertes de présence au-dessus de la grille.
- Présence : clic sur une case = 1 ↔ 0 ; si la nouvelle valeur égale la valeur par défaut (fiche), la saisie est effacée.
- Pas de données au démarrage → écran d'accueil : « Charger les données de démarrage (S42) » ou « Ouvrir un fichier ».
