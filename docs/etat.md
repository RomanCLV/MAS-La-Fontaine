# État du projet

**Phase courante** : 5 Code — **V1 écrite, à tester par l'utilisateur** (2026-10-19).
Phases 1 à 4 terminées (produit validé, maquettes v2.1 validées, choix techniques dans `technique.md`).
**Dernière MAJ** : 2026-10-20

## Fait (phase 5)
- `docs/code/architecture.md` + `data.md`, `calc.md`, `ui.md`, `print.md`.
- `src/index.html` : application complète (onglets restaurés, Semaine, Résidents, fiche, Parcs, Régimes, Activités + presets, Importer, Exporter, Imprimer, alertes manager). Aucune dépendance.
- `src/tests.html` : 58 tests de calcul, tous verts (totaux, double plat, activité, direction/nettoyage, alertes, chariot, migration, base vide).
- Vérifié dans le navigateur intégré (Chromium, via un petit serveur local de test) : toutes les pages, aller-retour export/import JSON, rendu d'impression A4 (règles `@page` actives, 297 × 210 mm).

## Retours V1 traités (2026-10-19, 7 commits)
- Résidents : vue Tableau (édition texture/régimes/options sans fiche). Textes de debug retirés. Selects sans « ▾ ». Activités : jour sans date, parcs centrés. Indicateur « Modifications non enregistrées ».
- Vérifié dans le navigateur intégré (Chromium) ; 58 tests verts. À revoir par l'utilisateur dans Firefox.

## Retours V1 (2e lot, 2026-10-19, 3 commits)
- Bandeau « Alertes de présence » masqué sans alerte. Bouton « Supprimer cette semaine » (confirmation). Export : le nom du fichier suit bien la semaine affichée (bug à la fermeture d'un onglet) + choix « Semaine envoyée » sur la page Exporter.

## Retours V1 (3e lot, 2026-10-19, 2 commits)
- Activités : couleur par activité (bleu par défaut), reprise dans la grille Semaine et la feuille cuisine/chariot. Plus de doublon d'activité sur un même service (retrait auto au changement de jour + blocage à l'enregistrement).

## Retours V1 (4e lot, 2026-10-19)
- Colonnes groupées Textures / Régimes / Options (grille Semaine, Tableau résidents). Boutons Importer / Exporter dans la barre du haut. « Repartir de zéro » (base vide).

## Retours V1 (5e lot, 2026-10-20)
- Page **Options** (menu Pages) : zone « Données en cache » + bouton « Vider le cache local » (retour à l’accueil).

## Retours V1 (6e lot, 2026-10-20)
- Semaine : Nettoyage séparé en « Nettoyage » (standard) et « Nettoyage sans viande » ; fichiers version 2 (anciens fichiers migrés).
- Menu Pages réordonné : Semaine, Parcs, Régimes, Résidents, Activités | Importer, Exporter | Options. « Imprimer » retiré du menu (bouton sur la page Semaine).
- Semaine : ligne « Plats témoins » (par service) → colonne TÉMOINS de la feuille cuisine, ajoutée au total à produire. 69 tests verts.

## Retours V1 (7e lot, 2026-10-20)
- Service **Petit déjeuner** (présences seulement) : grille, absences par service, feuilles cuisine/chariot simplifiées ; fichiers version 3. Filtre « Services affichés » sur la page Semaine. 78 tests verts ; vérifié dans le navigateur intégré.
- « Feuille chef » renommée « feuille cuisine » (docs, appli, titre imprimé).

## Retours V1 (8e lot, 2026-10-20)
- **Services concernés** par chaque texture / régime / option (cases sur la page Régimes) ; pots gourmands = petit déjeuner seulement (quantité par zone sur la feuille cuisine, noms sur le chariot). Fichiers version 4.
- Page Régimes en trois tableaux : Textures, Régimes, Options. 91 tests verts ; vérifié dans le navigateur intégré.
- Fiche résident : trois groupes Texture / Régimes et allergies / Options.

## Retours V1 (9e lot, 2026-10-20)
- Fichier de démarrage `recueil_base_s42.json` supprimé (et `demarrage.js`, bouton « Recharger les données de démarrage »). Base vide = **listes par défaut** du code (`REGIMES_DEFAUT`). 93 tests verts ; vérifié dans le navigateur intégré.
- Listes par défaut enrichies (choix utilisateur) : 5 textures, 15 régimes et allergies, 6 options (+ Demi-portion).
- Feuille cuisine : lignes réduites automatiquement si elles ne tiennent pas dans la page A4 (sinon coupées, constaté avec 27 éléments).
- Question : masquer sur la feuille cuisine les régimes / options à 0 pour le service ?
- Commit f3b8710. Puis : case **« Toujours affiché »** par texture / régime / option (page Régimes, info-bulle) ; grille Semaine = colonnes toujours affichées + celles présentes chez un résident du parc. Défaut : les 14 éléments d'avant cochés, les 12 nouveaux non ; fichiers existants : tout coché. 96 tests verts ; vérifié dans le navigateur intégré. Commit 3d115f1.
- « Mixé lisse » retiré de la liste par défaut (Mixé veut déjà dire lisse).
- Preset **MAS La Fontaine** : 7 parcs ajoutés depuis l'accueil (« Commencer avec MAS La Fontaine ») ou la page Parcs (manquants seulement). Commit e9d022f. Puis preset d'activité **Sport jeudi midi** (accueil MAS + bouton page Activités). 108 tests verts ; vérifié dans le navigateur intégré.

## Non vérifié (à faire par l'utilisateur)
1. Ouvrir `src/index.html` par **double-clic dans Firefox** (Edge/Chrome non installés sur ce poste de développement) : ouvrir un fichier ou base vide, saisir, fermer, rouvrir → données et onglets restaurés.
2. **Impression réelle** (page Imprimer) : vérifier paysage, 1 feuille par page, couleurs (cocher « Imprimer les arrière-plans » si besoin), et en PDF.
3. Export → fichier `.json` ; import du même fichier sur un autre poste/navigateur.

## Questions métier ouvertes (hypothèses appliquées, voir `decisions.md`)
- Double plat : textures et régimes comptés sur **2 plats** (un haché en double = 2 hachés). Correct ?
- Chariots imprimés pour les **parcs et activités** seulement (pas Sodexo / Direction / Nettoyage). Correct ?
- Étiquette « Salarié » de la maquette : non produite (les salariés ne sont saisis qu'en nombres standard / sans porc). Faut-il des salariés avec régime individuel ?
- Questions plus anciennes toujours ouvertes : zone du nettoyage (« Autres »), étiquettes par repas ou par résident.

## Prochaines actions
1. Utilisateur : tests ci-dessus + réponses aux questions → corrections.
2. Commit de la phase 5 (après accord).

## Retours V1 (9e lot, 2026-10-20)
- Semaine : ligne « Total à produire » en carrés sous les en-têtes (total de la MAS par service).
- Résidents : avec un filtre actif (nom, parc, archivés), le titre affiche aussi le nombre de résidents affichés (« · 3 actifs · 1 affiché »).
