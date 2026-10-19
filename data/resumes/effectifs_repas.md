# Résumé — `Effectifs Repas Semaine MLF 16 10 26 .xlsx`

Semaine du lun 12 au dim 18 oct 2026 (nom de fichier = date d'envoi). 5 feuilles. Extrait anonymisé (sans noms) : `data/csv/effectif_mch_s42_sans_noms.csv`.
Chaîne de calcul : `Effectif MCH` (saisie client) → `SEMAINE2` (miroir) → `RECAP SERVICE` (sélecteur jour/service) → `MATFER SERVICE` (chariots).

## Effectif MCH (A2:BA137) — seule vraie source
- Blocs par parc, 1 ligne par résident (col B = n°, C = nom, D = observation texte libre, E..P = 12 flags "X", puis présence).
- 12 colonnes régime/texture/option : HACHE, MIXE, SANS PORC, SANS RESIDUS, DOUBLE LEGUMES VERT, PLATEAU HYPO, DOUBLE PLAT, POTS GOURMANDS, DIABETIQUE, ENRICHI, SANS PRODUIT MER, POISSON/VIANDE PANE+PATE/RIZ FRITE.
- Présence : 3 colonnes par jour (PDJ, MIDI, SOIR) de R à AK, valeur 1 (présent) / 0 ; cellule vide = non servi. PDJ non utilisé.
- Chaque parc finit par 2 lignes : `Salariés` et `Salariés Sans Porc` (nombre de repas dans les colonnes de présence), puis `TOTAL UNITE` (vide).
- Lignes par parc (capacité du modèle) : Amboise 4-14 (11 places), Bonaguil 18-28, Collioure 32-42, Lude 46-56, Mirande 60-68 (9), Sully 72-79 (8), Alhambra 83-100 (18), **Sport du jeudi midi** 104-119 (16 places + salariés).
- Résidents réels : Amboise 8, Bonaguil 8, Collioure 8, Lude 8, Mirande 9, Sully 6, Alhambra 15 = **62** (cohérent avec TYPOLOGIE). Sport : 0 résident saisi.
- Totaux (lignes 123-137) : résidents, salariés, total repas, puis 1 SUMIF par régime × 14 colonnes de service. **Le bloc Sport n'est pas inclus** dans ces sommes (plages s'arrêtent à la ligne 100/102).
- Mode d'emploi du client (cellule AO5) : ne pas copier-coller, verrouiller le fichier, "x" pour compter un régime, un fichier par semaine à partir du modèle.

## SEMAINE2 (A1:AK136)
- Miroir : chaque cellule = `=IF(MCH!X="","",MCH!X)` avec décalage de **−1 ligne** (3 170 formules, toutes cohérentes — aucun lien cassé constaté).
- Titre de semaine et libellés de jours saisis à la main (lundi 12 → dimanche 18, corrects). Sur Effectif MCH, les jours Ven/Sam/Dim affichent 9/10/11 (périmés) → incohérence.
- Total par parc (ligne 16, 30, 44…) : `COUNTIF(col,"x")` = nombre de personnes avec le régime **sans tenir compte de la présence** ; présence = `SUM`.
- Totaux généraux 122-136 : somme de SUMIF par parc ; **inclut le bloc Sport** (contrairement à Effectif MCH).
- **Libellé col J = "DOUBLE LÉGUMES VERTS + FÉCULENT"** alors que la colonne source J d'Effectif MCH = **PLATEAU HYPO** → même colonne, deux sens.

## RECAP SERVICE (A1:J27)
- Sélecteurs : G3 (LUNDI…DIMANCHE), I3 (MIDI / DINER). Colonnes : 7 parcs + Sport jeudi + TOTAL.
- Lignes : salariés std / sans porc, résidents normal / haché / mixé, équiv. portions résidents, total à produire, portions chaudes avec doubles (= total + doubles), alternative sans porc (= sans-porc résidents + salariés sans porc), doubles portions (personnes présentes avec DOUBLE PLAT), assiettes individuelles (présents), lignes de dispatch, puis déclinaisons : sans résidus, double légumes, double légumes+féculent, pots gourmands, diabétique, enrichi, sans produit mer, poisson/viande panée.
- Formules : long enchaînement d'`IF` par résident (11 termes par parc) avec `INDEX(SEMAINE2!R:AK, 1, décalage)`.
- Colonne Sport : lignes 6-18 = constantes 0 ; lignes 20-27 = uniquement la **première** ligne sport (ligne 103). Non fonctionnel.
- Pas de ligne pour Plateau hypo, Sans porc seul, ni Personnel nettoyage / direction.

## MATFER SERVICE (A1:H150, impression A1:H18 = Amboise seulement)
- Un bloc de 23 lignes par parc : en-tête (portions résidents, normal/haché/mixé, salariés, total, sans porc), "collectif / bacs à charger" (salariés std/sans porc, normaux simples), puis "individuel / assiettes à identifier" (EQ., NOM, TEXTURE, RÉGIME, ÉTIQUETTE).
- **137 formules contiennent `#REF!`** : toute la liste nominative (assiettes individuelles) est cassée — vide aujourd'hui.

## TYPOLOGIE CONVIVES (A1:T67)
- Référentiel fait par Codex : 62 résidents, code interne provisoire (ex. BON-006 = 3 lettres du parc + n°), parc habituel, observations, mêmes 12 flags. Pas relié aux autres feuilles. Idée de future "source de référence" (note de bas de page).
- Note : les déplacements Sport ne sont pas ajoutés comme résidents.

## Hotfix appliqué (copie `... - HOTFIX.xlsx`, original intact)
- RECAP : 120 formules patchées ; cellule d'aide `K3` calcule la colonne (1,4,7…19 + 1 si soir) ; "SOIR" accepté en plus de "DINER".
- Col. J : libellé SEMAINE2!J1 et RECAP A22 → PLATEAU HYPO.
- MATFER : 7 blocs reconstruits à l'identique (23 lignes, saut de page par parc, zone d'impression complète) ; liste individuelle recalculée depuis SEMAINE2 via la feuille masquée `AIDE_MATFER`. Individuel = présent + au moins un régime autre que "sans porc" seul ; 7 emplacements max (alerte si dépassé) ; EQ. = 2 si double plat, sinon 1 (hypothèse).
- Non traités : Sport (RECAP/MATFER), totaux SEMAINE2 qui ignorent la présence, dates périmées de Effectif MCH, bloc "Sport jeudi" absent de MATFER.
- Vérifié par recalcul Python (lun midi : 7 résidents, mar midi : 8 avec STELLA, jeu soir : colonne 11) ; **non ouvert dans Excel** → à tester côté utilisateur.

## Anomalies relevées (voir `docs/analyse.md` pour l'impact)
1. Sélecteur RECAP cassé : décalages de colonne 1,3,5,7,9,11,13 au lieu de 1,4,7,10,13,16,19 (une colonne vide sépare chaque jour).
2. Colonne J : PLATEAU HYPO (client) vs DOUBLE LÉGUMES+FÉCULENT (SEMAINE2/RECAP).
3. Sport : exclu des totaux MCH, inclus dans SEMAINE2, non branché dans RECAP, et aucune règle de retrait du parc d'origine.
4. MATFER : liste individuelle en `#REF!`, impression limitée au premier parc.
5. Observation texte libre (col D) redondante et parfois incohérente avec les X (ex. Lude : "MIXE TOUT LE FROID / DOUBLE PLAT" avec X haché, pas mixé ; "DOUBLE PORTION" vs colonne DOUBLE PLAT ; "ENRICHI" vs "ENRICHIE").
6. Cette semaine, les présences ne sont saisies que pour Amboise (+ salariés Amboise le lundi midi) : fichier incomplet/modèle.
7. Libellé du service "DINER" (RECAP) vs "SOIR" (autres feuilles).
