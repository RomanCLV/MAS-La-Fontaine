# Module calc (`src/js/calc/calc.js`, `Recueil.Calc`)

Fonctions pures : entrées = données + semaine + créneau ; aucune lecture du DOM ni du stockage. Testées par `src/tests.html`.

## Présence
- `estAbsentFiche(resident, semaine, creneau)` : date du créneau dans une absence de la fiche (bornes incluses, service coché).
- `presence(semaine, resident, creneau)` → `{valeur: 0|1, source: "saisie"|"absence"|"defaut"|"voisins"}` : 1. saisie ; 2. absence de la fiche → 0 ; 3. service de base → 1 (`defaut`) ; service additionnel → 1 si le service « connu » le plus proche avant **ou** après, le même jour (parmi les services servis cette semaine), est à 1, sinon 0 (`voisins`). Connu = service de base, ou additionnel saisi / couvert par une absence de la fiche (deux additionnels côte à côte : on saute celui qui n'est pas connu). Ex. p.-déj. 1, midi 0, soir 0 → goûter (entre midi et soir) 0.
- `presenceParDefaut(semaine, resident, creneau)` : même calcul sans la saisie de ce créneau (une saisie égale est effacée par la grille).
- `activiteDe(semaine, residentId, creneau)` : 1re activité du créneau contenant le résident.

## Colonnes de la feuille cuisine — `feuilleJour(donnees, semaine, creneau)`
Colonnes : chaque parc (résidents actifs présents **hors** participants d'activité + salariés du parc) ; chaque activité du créneau (participants présents) ; `TOTAL PARCS` (parcs + activités) ; `SODEXO` ; `DIRECTION` ; `AUTRES` (Nettoyage) ; `TÉMOINS` (Plats témoins) ; `TOTAL À PRODUIRE`.
Colonne de parc : aussi `partis` ([{ resident, activite, plats }] : présents partis en activité) et `platsPartis` (somme de leurs plats).
Compteurs par colonne : `residents`, `platsEnPlus`, `salStd`, `salSansPorc`, `total` (= somme des 4), `tex{}`, `reg{}`, `opt{}`.
- Poids d'un résident = 1 + `platsEnPlus` (une par option « +1 plat » : double plat, gros gourmand… ; cumulables, ex. les deux = 3).
- `tex[texture]` et `reg[régime]` += poids. Options : « plat » += 1 (nombre de personnes) ; options d'assiette (enrichi, panée, pots gourmands…) += poids.
- Salariés : texture par défaut ; `sansPorc` ajoute aussi `reg.sans_porc`. Direction = standard. Nettoyage = `nettoyage` (standard) + `nettoyageSansViande` (standard + `reg.sans_viande`), une seule colonne. Plats témoins = compteur `temoins` (ligne à part sur la feuille cuisine), texture par défaut, sans régime, compris dans `total`.
- Services concernés (`regimes[].services`, `Modele.concerne`) : seuls la texture, les régimes et options qui concernent le service sont comptés (`regimesDu`, `optionsDu`). Texture non concernée → texture par défaut si elle l'est, sinon rien (`textureDu`). Idem pour salariés / Sodexo / direction / nettoyage / témoins (texture par défaut, sans porc, sans viande).
- **Menu sans porc** (`!Modele.menuAvecPorc(semaine, c)`, `feuilleJour(...).menuSansPorc`) : salariés sans porc ajoutés à `salStd` (`col.salaries.sansPorc` = 0), régime `sans_porc` des résidents non compté (`ajouterResident(..., menuSansPorc)`) ⇒ ni ligne ni pastille « Sans porc ». Totaux inchangés.
- Service additionnel : mêmes colonnes et compteurs qu'un service de base (salariés, Sodexo, direction, nettoyage, témoins saisis sur ses créneaux).
- Service « présence seulement » (petit déjeuner ou additionnel de ce type, `feuilleJour(...).presenceSeule`) : jamais de plat en plus ; par défaut rien n'y est coché sauf les pots gourmands. `particularites(donnees, c, col)` : éléments concernés avec les noms (chariot du petit déjeuner).
- Hypothèse à confirmer : les textures et régimes d'un double plat comptent pour 2 plats (Normal + Haché + Mixé = total).

## Ventilation — `ventilation(donnees, compteurs)`
Liste « sur N plats » : textures hors défaut, régimes, options d'assiette (pas « plat »), qui concernent le service.

## Chariot — `chariot(donnees, semaine, creneau, colonne)`
- Collectif : salariés standard ; bac sans porc = salariés sans porc + résidents « sans porc seuls » (texture par défaut, seul régime sans porc, aucune option ni consigne) ; résidents « normaux simples ».
- Menu sans porc (`menuSansPorc: true`) : « sans porc » ignoré pour classer ⇒ « sans porc seul » = normal simple (`sansPorcSeuls` = 0) ; salariés en un seul bac (voir `feuilleJour`).
- Étiquettes : tous les autres résidents (texture, régimes, options, consigne, EQ = poids ; `parc` = parc du résident sur un chariot d'activité, sinon null). Les pastilles gardent toujours « sans porc ».
- `doubles` ([{ nom, n }] : résidents avec n plats en plus), `platsEnPlus` (leur somme), `partis` (résidents du parc partis en activité).

## Alertes — `alertes(donnees, semaine)` puis `alertesVisibles(...)`
1. **Présent alors qu'absent** : présence saisie à 1 sur un créneau d'absence de la fiche (une alerte par résident, créneaux regroupés).
2. **Aucune présence** : 0 sur tous les créneaux de la semaine (`Modele.creneaux(semaine)`) sans absence dans la fiche cette semaine.
Clé stable (`type:resident:créneaux`) ; une alerte traitée (« C'est voulu » / « Ignorer ») est masquée tant que sa clé est identique.
