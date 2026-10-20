# État du projet

**Phase courante** : 5 Code — **V1 écrite, à tester par l'utilisateur** (2026-10-19).
Phases 1 à 4 terminées (produit validé, maquettes v2.1 validées, choix techniques dans `technique.md`).
**Dernière MAJ** : 2026-10-20

## Fait (phase 5)
- `docs/code/architecture.md` + `data.md`, `calc.md`, `ui.md`, `print.md`.
- `src/index.html` : application complète (onglets restaurés, Semaine, Résidents, fiche, Parcs, Régimes, Activités + presets, Importer, Exporter, Imprimer, alertes manager). Aucune dépendance.
- `src/tests.html` : 58 tests de calcul, tous verts (totaux, double plat, activité, direction/nettoyage, alertes, chariot, migration, données S42).
- Vérifié dans le navigateur intégré (Chromium, via un petit serveur local de test) : toutes les pages, aller-retour export/import JSON, rendu d'impression A4 (règles `@page` actives, 297 × 210 mm).
- Données de démarrage : couleurs et ordre des colonnes alignés sur les maquettes ; copie intégrée `src/js/data/demarrage.js`.

## Retours V1 traités (2026-10-19, 7 commits)
- Résidents : vue Tableau (édition texture/régimes/options sans fiche). Textes de debug retirés. JSON de démarrage dans `src/data/`. Selects sans « ▾ ». Activités : jour sans date, parcs centrés. Indicateur « Modifications non enregistrées ».
- Vérifié dans le navigateur intégré (Chromium) ; 58 tests verts. À revoir par l'utilisateur dans Firefox.

## Retours V1 (2e lot, 2026-10-19, 3 commits)
- Bandeau « Alertes de présence » masqué sans alerte. Bouton « Supprimer cette semaine » (confirmation). Export : le nom du fichier suit bien la semaine affichée (bug à la fermeture d'un onglet) + choix « Semaine envoyée » sur la page Exporter.

## Retours V1 (3e lot, 2026-10-19, 2 commits)
- Activités : couleur par activité (bleu par défaut), reprise dans la grille Semaine et la feuille chef/chariot. Plus de doublon d'activité sur un même service (retrait auto au changement de jour + blocage à l'enregistrement).

## Retours V1 (4e lot, 2026-10-19)
- Colonnes groupées Textures / Régimes / Options (grille Semaine, Tableau résidents). Boutons Importer / Exporter dans la barre du haut. « Repartir de zéro » (base vide).

## Retours V1 (5e lot, 2026-10-20)
- Page **Options** (menu Pages) : zone « Données en cache » + bouton « Vider le cache local » (retour à l’accueil).

## Non vérifié (à faire par l'utilisateur)
1. Ouvrir `src/index.html` par **double-clic dans Firefox** (Edge/Chrome non installés sur ce poste de développement) : charger les données de démarrage, saisir, fermer, rouvrir → données et onglets restaurés.
2. **Impression réelle** (page Imprimer) : vérifier paysage, 1 feuille par page, couleurs (cocher « Imprimer les arrière-plans » si besoin), et en PDF.
3. Export → fichier `.json` ; import du même fichier sur un autre poste/navigateur.

## Questions métier ouvertes (hypothèses appliquées, voir `decisions.md`)
- Double plat : textures et régimes comptés sur **2 plats** (un haché en double = 2 hachés). Correct ?
- Équipe Sodexo : saisie **standard + sans porc** (comme les salariés de parc). Correct ?
- Chariots imprimés pour les **parcs et activités** seulement (pas Sodexo / Direction / Nettoyage). Correct ?
- Étiquette « Salarié » de la maquette : non produite (les salariés ne sont saisis qu'en nombres standard / sans porc). Faut-il des salariés avec régime individuel ?
- Questions plus anciennes toujours ouvertes : zone du nettoyage (« Autres »), pots gourmands (pastille sur l'étiquette seulement), étiquettes par repas ou par résident.

## Prochaines actions
1. Utilisateur : tests ci-dessus + réponses aux questions → corrections.
2. Commit de la phase 5 (après accord).
