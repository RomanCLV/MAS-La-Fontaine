# Module calc (`src/js/calc/calc.js`, `Recueil.Calc`)

Fonctions pures : entrées = données + semaine + créneau ; aucune lecture du DOM ni du stockage. Testées par `src/tests.html`.

## Présence
- `estAbsentFiche(resident, semaine, creneau)` : date du créneau dans une absence de la fiche (bornes incluses, service coché).
- `presence(semaine, resident, creneau)` → `{valeur: 0|1, source: "saisie"|"absence"|"defaut"}` ; saisie prioritaire.
- `activiteDe(semaine, residentId, creneau)` : 1re activité du créneau contenant le résident.

## Colonnes de la feuille chef — `feuilleJour(donnees, semaine, creneau)`
Colonnes : chaque parc (résidents actifs présents **hors** participants d'activité + salariés du parc) ; chaque activité du créneau (participants présents) ; `TOTAL PARCS` (parcs + activités) ; `SODEXO` ; `DIRECTION` ; `AUTRES` (Nettoyage) ; `TOTAL À PRODUIRE`.
Compteurs par colonne : `residents`, `doublesPlats`, `salStd`, `salSansPorc`, `total` (= somme des 4), `tex{}`, `reg{}`, `opt{}`.
- Poids d'un résident = 1 + 1 s'il a l'option « plat » (double plat).
- `tex[texture]` et `reg[régime]` += poids. Options : « plat », « legumes » et « information » += 1 (nombre de personnes) ; autres (enrichi, panée) += poids.
- Salariés : texture par défaut ; `sansPorc` ajoute aussi `reg.sans_porc`. Direction = standard. Nettoyage = standard + `reg.sans_viande`.
- Hypothèse à confirmer : les textures et régimes d'un double plat comptent pour 2 plats (Normal + Haché + Mixé = total).

## Ventilation — `ventilation(donnees, compteurs)`
Liste « sur N plats » : textures hors défaut, régimes, options sans `affecte` (enrichi, panée).

## Chariot — `chariot(donnees, semaine, creneau, colonne)`
- Collectif : salariés standard ; bac sans porc = salariés sans porc + résidents « sans porc seuls » (texture par défaut, seul régime sans porc, aucune option ni consigne) ; résidents « normaux simples ».
- Étiquettes : tous les autres résidents (texture, régimes, options, consigne, EQ = poids).
- `doubles` (noms des doubles plats), `legumes` (portions à part), `partis` (résidents du parc partis en activité).

## Alertes — `alertes(donnees, semaine)` puis `alertesVisibles(...)`
1. **Présent alors qu'absent** : présence saisie à 1 sur un créneau d'absence de la fiche (une alerte par résident, créneaux regroupés).
2. **Aucune présence** : 0 sur les 14 créneaux sans absence dans la fiche cette semaine.
Clé stable (`type:resident:créneaux`) ; une alerte traitée (« C'est voulu » / « Ignorer ») est masquée tant que sa clé est identique.
