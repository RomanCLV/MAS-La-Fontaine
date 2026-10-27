# Module data

Fichiers : `src/js/data/modele.js` (`Recueil.Modele`), `stockage.js` (`Recueil.Stockage`).

## modele.js (pur)
- Constantes : `VERSION` (1), `APP`, `JOURS`, `IDS_JOURS`, `SERVICES_BASE` (petit déjeuner `presenceSeule`, midi, soir ; `court` = libellé court), `TEXTURE_DEFAUT` (`normal`), `REGIME_SANS_PORC` (`sans_porc`, salariés « sans porc »), `REGIME_NETTOYAGE` (`sans_viande`, ligne « Nettoyage sans viande »), `REGIMES_DEFAUT` (liste par défaut des textures / régimes / options, intégrée au code).
- **Services en vigueur** (tableaux modifiés sur place, mêmes références partout) : `TOUS_SERVICES` (archivés compris), `SERVICES` (non archivés, dans l'ordre), `IDS_SERVICES`. Remplis par `appliquerServices(donnees)` (null = services de base), appelé par `migrer` et par l'application à chaque rendu et chaque modification (`App.rendre`, `App.modifier`). `service(id)` (archivés compris ; inconnu = midi).
- **Par semaine** : `joursDuService(semaine, s)` (base : tous ; additionnel : `semaine.servicesSemaine[id]` s'il existe, sinon `joursHabituels(s)` = ses jours s'il est permanent, aucun s'il est ponctuel ; archivé : aucun), `creneaux(semaine)` (jour × service servi, ordre semaine puis journée), `estActif(semaine, jour, service)`, `servicesDuJour(semaine, jour)`, `servicesDeLaSemaine(semaine)` (servis au moins un jour). `semaineSuivante` ne reprend ni `servicesSemaine` ni les saisies des créneaux non servis la nouvelle semaine. `utilisationsService(d, id)` → `{ semaines (saisies ou jours réglés pour la semaine), activites, presets, absences }` (page Services : suppression refusée si l'un n'est pas 0).
- Dates ISO `AAAA-MM-JJ` calculées en UTC (pas de décalage d'heure d'été) : `ajouterJours`, `dateDuCreneau`, `idSemaine` (n° ISO), `lundiDe`.
- `concerne(g, serviceId)` : l'élément du référentiel compte-t-il pour ce service (`g.services`, défaut `SERVICES_REGIME_DEFAUT` = midi + soir ; inconnu = oui).
- `aRegime(r, g)` ; `colonneAffichee(g, residents)` : `g.toujoursVisible` (absent = oui) ou l'un des résidents a l'élément (grille Semaine).
- `groupesRegimes(donnees, filtre?)` : référentiel régimes rangé en groupes Textures / Régimes / Options (non vides).
- **Menu sans porc** : `semaine.menuSansPorc` = `{ <créneau>: true }` (repas dont la case « Menu avec porc » est décochée ; absent = avec porc, donc pas de nouvelle version). `menuAvecPorc(semaine, c)` : faux seulement si le créneau y est **et** que son service est un repas (un service « présence seule » est toujours « avec porc »). Normalisation : seules les entrées vraies d'un jour connu et d'un service « repas » du fichier sont gardées.
- Création : `nouvelId`, `semaineVide(debut)`, `semaineSuivante(semaine)` (copie salariés/Sodexo/direction/nettoyage/nettoyage sans viande/plats témoins/menus sans porc et les cases de présence saisies à 0 ; pas les « présent » saisis (1) ni les activités), `residentVide(parcId)`, `baseVide()` (aucun parc, résident ni preset ; `REGIMES_DEFAUT` ; une semaine = la semaine en cours). Preset MAS La Fontaine : `PARCS_MAS_LA_FONTAINE` (7 parcs), `parcsPresetManquants(d)` (comparaison par nom, sans casse), `ajouterParcsPreset(d)` (ajoute les manquants à la fin, existants inchangés, id déjà pris → suffixe `_2`), `PRESETS_ACTIVITES_MAS_LA_FONTAINE` (Sport, jeudi midi, sans participant), `presetsActivitesManquants(d)`, `ajouterPresetsActivites(d)` (même principe que les parcs), `baseMasLaFontaine()` (base vide + ces parcs + ces presets).
- `migrer(objet)` : vérifie `app`, refuse une version plus récente, enchaîne les **conversions** `CONVERSIONS[n]` (n → n+1) depuis la version du fichier (absente = 1), puis **normalise** : champs manquants (tableaux, `etablissement`, `abrege`…), services (`normaliserServices` : services de base imposés et remis à leur place, ordre petit déjeuner < midi < soir ; additionnels gardés, aucun jour = tous, `permanent` absent = oui ; `servicesSemaine` : services additionnels connus, jours nettoyés), services inconnus retirés des régimes / absences / presets (activité sur un service inconnu → midi), Sodexo `sansPorc` = 0, effets d'options inconnus → « sur l'assiette », texture `normal` encore blanche → bleu léger `COULEUR_NORMAL`. Applique les services du fichier (`appliquerServices`). Renvoie une **copie** ; lève une `Error` en français si le fichier n'est pas un recueil.
- Conversions : **aucune** (version 1 = format de l'application 1.0, 2026-10-23 ; les conversions des formats d'essai 1 à 4 ont été supprimées, aucune donnée en service).
- `nomAffiche(resident)` = « NOM Prénom ».

## stockage.js
- Copie de travail : `localStorage['recueil.donnees']` (+ `recueil.meta` : date de sauvegarde, fichier d'origine, modifié depuis l'export). État de l'interface (onglets, fermés récemment, choix d'impression `servicesExclus`, services masqués dans la grille Semaine `servicesMasques` : un service ajouté est donc affiché et imprimé) : `lireUi` / `sauverUi` dans `recueil.ui`. `tailleCache()` (≈ octets des 4 clés) et `vider()` (efface les 4 clés) pour la page Options.
- `chargerCopie()` → `{ donnees }` (migrées), `{ donnees: null }` si cache vide, `{ donnees: null, erreur, texte }` si illisible (JSON invalide, version trop récente, bug de migration) : **rien n'est effacé**, l'accueil affiche l'erreur, propose « Télécharger les données illisibles » (`telechargerTexte`) et `App.remplacerDonnees` demande confirmation avant de l'écraser.
- Cache d'une ancienne version : l'original est d'abord gardé dans `recueil.donnees.avant-migration` (`{ le, version, donnees }`, une seule copie, la dernière), puis le cache est réécrit migré (si la copie n'a pas pu être écrite, le cache n'est pas réécrit). `avantMigration()` ; page Options : « Télécharger cette copie » (fichier importable, il sera re-migré).
- `lireFichier(file)` → Promise de données migrées. `telecharger(donnees, nom)` : export par lien de téléchargement (tous navigateurs) ; `telechargerTexte(texte, nom)` : texte tel quel, sans migration. `nomExport(donnees, semaine)` → `MLF S42 - 12 au 18 oct 2026.json`.
- Bonus Chrome/Edge : `enregistrerSous` / `enregistrerLie` via File System Access (`showSaveFilePicker`) si disponible ; le fichier lié n'est gardé qu'en mémoire (session).

## Version du format de données (règle, 2026-10-23)
- **Version du format** (`VERSION`, entier dans le JSON) ≠ version de l'appli (informative seulement). `recueil.ui` n'est pas versionné (remis à zéro si illisible).
- `migrer` fait deux choses : **normalisation** (à chaque chargement, rejouable : valeurs par défaut, types, références orphelines) et **conversion** (une fois, version N → N+1 : changement de sens).
- Un champ absent vaut `undefined` : il ne se corrige jamais seul. Les valeurs par défaut se posent **dans `migrer`**, pour toutes les données d'un coup ; le reste du code suppose le champ présent.
- **Piège** : `migrer` reconstruit résidents, parcs, régimes… champ par champ → un champ oublié dans `migrer` est **effacé à chaque rechargement**.
- En production, tout le monde a toujours la dernière version de l'appli : seul le sens « vieux fichier → nouveau code » compte.
- **Augmenter `VERSION`** seulement si un vieux fichier, lu tel quel par le nouveau code, changerait de sens (renommage, déplacement, découpage, type ou unité, « absent » ≠ valeur par défaut) → étape de conversion.
  - Simple ajout avec valeur par défaut, ou retrait d'un champ plus lu : pas de changement de version, normalisation seulement.
  - Écrans, calculs, impression, libellés : jamais.
- **Conversions enchaînées** (`CONVERSIONS` dans `modele.js`) : un fichier V3 lu en V5 passe par V3 → V4 puis V4 → V5, puis une seule normalisation. Chaque étape est écrite pour le format de sa version et n'est plus jamais modifiée ; une étape manquante lève une erreur.
- Cache : jamais perdu si la migration échoue, copie de l'original avant migration (voir stockage.js ci-dessus).

### Check-list d'un changement de format
1. Mettre à jour le schéma dans `architecture.md`.
2. Un vieux fichier lu tel quel changerait-il de sens ? → décider du changement de version.
3. Si oui : `VERSION` + 1, ajouter `CONVERSIONS[N]` (N → N+1) commentée, à la suite des précédentes.
4. Ajouter le champ et sa valeur par défaut dans la normalisation de `migrer`.
5. Tester avec un fichier d'exemple fictif de chaque ancienne version (`tests.html`, groupe Migration : chaîne complète depuis V1, normalisation rejouable).
6. Ligne dans `decisions.md` (et dans ce fichier, liste des conversions de `migrer`).

## Fichiers de données
Les fichiers `.json` ouverts par l'application (exports reçus) se rangent dans `src/data/`. Le code ne lit rien dans `../data` (réservé à l'analyse : sources, CSV, résumés).
**`src/data/` est ignoré par git** : ce sont les données résidents réelles. Ne jamais mettre de vraies données dans le code.
