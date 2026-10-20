# Module ui (`src/js/ui/`)

| Fichier | Rôle |
|---|---|
| `outils.js` | `Recueil.h(tag, attrs, ...enfants)` (création DOM sans `innerHTML` ⇒ pas d'injection), formats de dates français |
| `app.js` | `Recueil.App` : état (données + état UI), sauvegarde, barre du haut, menu Pages, onglets, rendu |
| `page-semaine.js` | Saisie : créer la semaine suivante, supprimer la semaine (confirmation ; impossible s’il n’en reste qu’une ; on bascule sur la voisine), alertes (manager), bandeau activités, onglets de parcs, grille présences, salariés, Sodexo, Direction, Nettoyage, Nettoyage sans viande |
| `page-residents.js` / `page-resident.js` | Bascule Liste / Tableau (mémorisée). Liste type TYPOLOGIE (éditer / archiver / supprimer au survol) ; Tableau : une colonne par texture/régime/option, clic = X, brouillon enregistré d’un coup (cases modifiées entourées) ; fiche + absences |
| `page-parcs.js` / `page-regimes.js` | Référentiels (nom, couleur, ordre ; nature et effet pour les régimes) |
| `page-activites.js` | Activités de la semaine (nom, couleur, jour, service, participants), presets (charger, mettre à jour, enregistrer ; gardent la couleur). La couleur entoure les cases de la grille Semaine (variable CSS `--act`), la puce et la légende. Un résident = une activité par service : changer de jour/service ou charger un preset retire (avec message) les participants déjà pris ailleurs ; un doublon restant (en rouge) bloque l’enregistrement |
| `page-fichier.js` | Accueil, page Importer, page Exporter (choix de la semaine envoyée → nom du fichier) |
| `page-imprimer.js` | Choix semaine/jours/services/type, aperçu, impression |
| `page-options.js` | Options › « Données en cache » : contenu, origine, dates, place occupée ; « Vider le cache local » (confirmation, avertit si non exporté) → `App.viderCache()` efface `recueil.donnees/meta/ui` et revient à l’accueil |

## Principes
- Onglet = `{type, id?}`, clé `type:id`. Onglets ouverts, actif et « fermés récemment » mémorisés (`localStorage['recueil.ui']`) et **restaurés** à la réouverture.
- Semaine courante (`App.ui.semaine`, utilisée par Exporter, Imprimer, Activités) : toute activation d'un onglet Semaine la met à jour (`definirActif`, y compris quand la fermeture d'un onglet en affiche un autre). Exporter et Imprimer affichent un choix « Semaine » qui la modifie.
- Chaque page = `Recueil.Pages[type] = { titre(onglet), rendu(onglet) }`. Toute modification passe par `App.modifier(fn)` : applique, sauvegarde, re-rend (option `sansRendu` pour les champs numériques, pour garder le focus).
- Brouillons (fiche résident, tableau des résidents, activité, édition de parc/régime) : en mémoire jusqu'à « Enregistrer ». Chaque page déclare `modifie(onglet)` / `abandonner(onglet)` ; `App.indicateur()` affiche « Modifications non enregistrées » près du titre et `•` sur l'onglet ; confirmation avant de fermer l'onglet, de changer d'élément édité ou de quitter le navigateur. Pendant la frappe : `App.signalerModif()` (sans re-rendu, garde le focus).
- Colonnes textures/régimes/options (grille Semaine, Résidents › Tableau) : groupées par nature (`Modele.groupesRegimes`, ordre du référentiel dans chaque groupe), bandeau « TEXTURES / RÉGIMES / OPTIONS » au-dessus et trait épais entre groupes (`Outils.colonnesGroupees`).
- Barre du haut : état d’enregistrement, « Modifications non exportées », boutons **Importer** et **Exporter** (toujours visibles), Mode manager.
- Mode manager : bouton de la barre du haut ; seul effet = afficher les alertes de présence au-dessus de la grille (bandeau masqué s’il n’y en a aucune, sauf alertes masquées à réafficher).
- Présence : presser une case inverse sa valeur ; glisser étend cette même valeur au rectangle entre la première case et la case survolée ; relâcher enregistre (une seule sauvegarde), Échap annule. Clavier : Entrée/Espace inverse une case. Si la nouvelle valeur égale la valeur par défaut (fiche), la saisie est effacée.
- Pas de données au démarrage → écran d'accueil : « Ouvrir un fichier reçu » ou « Commencer avec une base vide » (les données de démarrage restent chargeables depuis Importer).
- Base vide (accueil, ou Importer › « Repartir de zéro », avec confirmation) : garde seulement les textures/régimes/options des données de démarrage ; aucun parc, résident, preset ; une semaine = la semaine en cours.
