# Module data

Fichiers : `src/js/data/modele.js` (`Recueil.Modele`), `stockage.js` (`Recueil.Stockage`), `demarrage.js` (`Recueil.DONNEES_DEMARRAGE`).

## modele.js (pur)
- Constantes : `VERSION`, `APP`, `JOURS`, `SERVICES`, `CRENEAUX` (14), `TEXTURE_DEFAUT` (`normal`), `REGIME_SANS_PORC` (`sans_porc`, salariés « sans porc »), `REGIME_NETTOYAGE` (`sans_viande`, équipe nettoyage).
- Dates ISO `AAAA-MM-JJ` calculées en UTC (pas de décalage d'heure d'été) : `ajouterJours`, `dateDuCreneau`, `idSemaine` (n° ISO), `lundiDe`.
- `groupesRegimes(donnees, filtre?)` : référentiel régimes rangé en groupes Textures / Régimes / Options (non vides).
- Création : `nouvelId`, `semaineVide(debut)`, `semaineSuivante(semaine)` (copie salariés/Sodexo/direction/nettoyage, pas les présences ni activités), `residentVide(parcId)`.
- `migrer(objet)` : vérifie `app`, refuse une version plus récente, complète les champs manquants (tableaux, `etablissement`, `abrege`…), convertit un nombre Sodexo en `{standard, sansPorc}`. Renvoie une **copie** ; lève une `Error` en français si le fichier n'est pas un recueil.
- `nomAffiche(resident)` = « NOM Prénom ».

## stockage.js
- Copie de travail : `localStorage['recueil.donnees']` (+ `recueil.meta` : date de sauvegarde, fichier d'origine, modifié depuis l'export). État de l'interface (onglets, fermés récemment, mode manager, choix d'impression) : `lireUi` / `sauverUi` dans `recueil.ui`.
- `lireFichier(file)` → Promise de données migrées. `telecharger(donnees, nom)` : export par lien de téléchargement (tous navigateurs). `nomExport(donnees, semaine)` → `MLF S42 - 12 au 18 oct 2026.json`.
- Bonus Chrome/Edge : `enregistrerSous` / `enregistrerLie` via File System Access (`showSaveFilePicker`) si disponible ; le fichier lié n'est gardé qu'en mémoire (session).

## demarrage.js
Copie de `src/data/recueil_base_s42.json` dans une variable JS (un navigateur ne peut pas lire un fichier voisin en `file://`).
Si le JSON de départ change : remplacer tout ce qui suit `window.Recueil.DONNEES_DEMARRAGE = ` par le contenu du JSON, suivi de `;`.

## Fichiers de données
Les fichiers `.json` ouverts par l'application (données de démarrage, exports reçus) se rangent dans `src/data/`. Le code ne lit rien dans `../data` (réservé à l'analyse : sources, CSV, résumés).
**`src/data/` est ignoré par git** : ce sont les données résidents réelles. Seule la copie intégrée `demarrage.js` (noms fictifs) est versionnée ; ne jamais y coller de vraies données.
