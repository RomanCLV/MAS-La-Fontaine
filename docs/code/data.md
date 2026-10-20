# Module data

Fichiers : `src/js/data/modele.js` (`Recueil.Modele`), `stockage.js` (`Recueil.Stockage`).

## modele.js (pur)
- Constantes : `VERSION`, `APP`, `JOURS`, `SERVICES` (petit déjeuner `presenceSeule`, midi, soir ; `court` = libellé court), `IDS_SERVICES`, `CRENEAUX` (21), `TEXTURE_DEFAUT` (`normal`), `REGIME_SANS_PORC` (`sans_porc`, salariés « sans porc »), `REGIME_NETTOYAGE` (`sans_viande`, ligne « Nettoyage sans viande »), `REGIMES_DEFAUT` (liste par défaut des textures / régimes / options, intégrée au code).
- Dates ISO `AAAA-MM-JJ` calculées en UTC (pas de décalage d'heure d'été) : `ajouterJours`, `dateDuCreneau`, `idSemaine` (n° ISO), `lundiDe`.
- `concerne(g, serviceId)` : l'élément du référentiel compte-t-il pour ce service (`g.services`, défaut `SERVICES_REGIME_DEFAUT` = midi + soir ; inconnu = oui).
- `aRegime(r, g)` ; `colonneAffichee(g, residents)` : `g.toujoursVisible` (absent = oui) ou l'un des résidents a l'élément (grille Semaine).
- `groupesRegimes(donnees, filtre?)` : référentiel régimes rangé en groupes Textures / Régimes / Options (non vides).
- Création : `nouvelId`, `semaineVide(debut)`, `semaineSuivante(semaine)` (copie salariés/Sodexo/direction/nettoyage/nettoyage sans viande/plats témoins, pas les présences ni activités), `residentVide(parcId)`, `baseVide()` (aucun parc, résident ni preset ; `REGIMES_DEFAUT` ; une semaine = la semaine en cours). Preset MAS La Fontaine : `PARCS_MAS_LA_FONTAINE` (7 parcs), `parcsPresetManquants(d)` (comparaison par nom, sans casse), `ajouterParcsPreset(d)` (ajoute les manquants à la fin, existants inchangés, id déjà pris → suffixe `_2`), `baseMasLaFontaine()` (base vide + ces parcs).
- `migrer(objet)` : vérifie `app`, refuse une version plus récente, complète les champs manquants (tableaux, `etablissement`, `abrege`…), convertit un nombre Sodexo en `{standard, sansPorc}` ; fichier version 1 : `nettoyage` (alors tout sans viande) déplacé dans `nettoyageSansViande` ; avant la version 3 : une absence « midi et soir » couvre aussi le petit déjeuner (« midi seul » / « soir seul » inchangées) ; avant la version 4 : `regimes[].services` = midi + soir (pots gourmands : petit déjeuner). Renvoie une **copie** ; lève une `Error` en français si le fichier n'est pas un recueil.
- `nomAffiche(resident)` = « NOM Prénom ».

## stockage.js
- Copie de travail : `localStorage['recueil.donnees']` (+ `recueil.meta` : date de sauvegarde, fichier d'origine, modifié depuis l'export). État de l'interface (onglets, fermés récemment, mode manager, choix d'impression, services affichés dans la grille Semaine) : `lireUi` / `sauverUi` dans `recueil.ui`. `tailleCache()` (≈ octets des 3 clés) et `vider()` (efface les 3 clés) pour la page Options.
- `lireFichier(file)` → Promise de données migrées. `telecharger(donnees, nom)` : export par lien de téléchargement (tous navigateurs). `nomExport(donnees, semaine)` → `MLF S42 - 12 au 18 oct 2026.json`.
- Bonus Chrome/Edge : `enregistrerSous` / `enregistrerLie` via File System Access (`showSaveFilePicker`) si disponible ; le fichier lié n'est gardé qu'en mémoire (session).

## Fichiers de données
Les fichiers `.json` ouverts par l'application (exports reçus) se rangent dans `src/data/`. Le code ne lit rien dans `../data` (réservé à l'analyse : sources, CSV, résumés).
**`src/data/` est ignoré par git** : ce sont les données résidents réelles. Ne jamais mettre de vraies données dans le code.
