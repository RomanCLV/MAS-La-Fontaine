# Journal des décisions

| Date | Décision | Raison |
|---|---|---|
| 2026-10-19 | Outils 100 % gratuits, sans limite ni partie payante | Exigence utilisateur |
| 2026-10-19 | Établissement = **MAS La Fontaine** (pas EHPAD) ; nom provisoire "Recueil Alimentation MAS La Fontaine" | Réponse utilisateur |
| 2026-10-19 | Double plat = +1 plat chaud seulement ; double légumes compté à part | Réponses 1-2 |
| 2026-10-19 | Texture (normal/haché/mixé) distincte des régimes ; mixé/haché combinable avec sans résidus | Réponse 3 |
| 2026-10-19 | Pots gourmands = information hors outil de production | Réponse 4 |
| 2026-10-19 | Menu hors V1 (règle future : sans porc, sans viande, sans produit de la mer quotidiens) | Réponses 6, 24 |
| 2026-10-19 | Sport : jeudi midi uniquement, repas retiré du parc d'origine, texture suit le résident | Réponses 8-10 |
| 2026-10-19 | Nettoyage "sans viande" (halal : œufs/poisson) ; direction lun-ven midi | Réponses 11-12 |
| 2026-10-19 | Pas d'archives, pas de comparaison de semaines, nom+prénom seulement, sécurité minimale | Réponses 20-23 |
| 2026-10-19 | Impression A4 paysage, 1 feuille/jour/service ; priorité = feuille cuisine puis feuille chariot | Réponses 17, 19, 26 |
| 2026-10-19 | Alertes destinées au manager, jamais à la cuisine | Réponse 16 |
| 2026-10-19 | CSV/MD sans noms de résidents (codes type AMB-01) | Données de santé |
| 2026-10-19 | Mémoire du projet = fichiers MD routés par CLAUDE.md | Économie de tokens |

## 2026-10-19 — Retours maquettes phase 3 (v1)
- **Sport = activité**, pas un parc : ajoutée par semaine (jour, service, participants), presets réutilisables ; repas inchangé, seul le chariot change. Raison : éviter la double saisie et refléter la réalité.
- **Feuille cuisine variante A** ; zones Parcs / Sodexo / Direction / Nettoyage / Total ; un seul total à produire ; ventilation des régimes sur le total. Raison : totaux « par parc / général / avec doubles » étaient confus.
- Haché et Mixé mis en avant (couleur) sur la feuille cuisine.
- **Chariot variante A** ; étiquettes : Résident/Salarié au lieu du parc ; texture en grand et colorée ; régimes colorés.
- Saisie : alertes au-dessus, régimes non éditables dans la grille, pas de « lignes libres », lignes Direction / Salariés Sodexo ajoutées, stylo → fiche résident en nouvel onglet.
- Pages distinctes (Résidents, Parcs, Activités, Régimes) ; liste Résidents façon TYPOLOGIE CONVIVES ; actions éditer/archiver/supprimer au survol (archivage réintroduit).
- Import et export séparés ; onglets restaurés à la réouverture.

## 2026-10-19 — Retours maquettes v2
- Feuille chariot : plus de pointillés (traits pleins).
- Presets d'activité : proposés seulement dans la fiche d'ajout/édition de l'activité, pas dans la saisie semaine.
- Texture unique par résident (haché et mixé exclusifs) : pas d'alerte « régime incohérent » (les régimes ne s'éditent pas dans la saisie).
- Alertes = uniquement présence/absence. Chaque alerte peut être « C'est voulu » ou « Ignorée » et disparaît ; réaffichage possible. Plus d'alerte « variation d'effectif » (retirée, jugée peu claire).
- Mode manager + derniers onglets ouverts : mémorisés dans un fichier `recueil.ini` à côté de l'app (à confirmer en phase 4).
- Pas de code résident : aucune utilité claire (et ambigu si changement de parc). Retiré de la liste Résidents.
- Activité : pas de « salariés encadrants » pour l'instant (trop complexe) ; participants = résidents seulement.

## 2026-10-19 — Phase 4 (choix techniques)
- Appli = HTML/CSS/JS vanilla ouverte dans Chrome/Edge, sans framework, sans npm, sans dépendance. Raison : gratuit, hors ligne, rien à installer. Détail : `technique.md`.
- Scripts classiques (pas de modules ES) : bloqués en `file://`.
- Fichiers via API File System Access (repli import/export). Impression via CSS `@page` A4 paysage.
- `recueil.ini` abandonné (impossible depuis une page web) → mode manager/onglets/dernier fichier dans le stockage du navigateur.
- Calculs purs séparés de l'interface et testés via `tests.html`.
- **Révision (même jour)** : fonctionnement commun Firefox/Chrome/Edge. Copie de travail dans le navigateur ; fichier JSON = échange (import/export) ; File System Access seulement en bonus. Raison : l'utilisateur est sous Firefox.
- JSON de démarrage `data/recueil_base_s42.json` généré depuis le CSV (hypothèses : direction 3 et nettoyage 5 en lun-ven midi ; Sodexo 0 ; Sport = preset sans participants).

## 2026-10-19 — Phase 5 (code V1)
- Appli dans `src/` (HTML/CSS/JS vanilla, scripts classiques, objet global `Recueil`), copie de travail dans `localStorage`. Raison : simple, synchrone, suffisant (~20 Ko).
- Données de démarrage intégrées en JS (`src/js/data/demarrage.js`) : un navigateur ne peut pas lire `data/recueil_base_s42.json` en `file://`.
- Données de démarrage : couleurs des maquettes, ordre des colonnes de l'Excel, champ `abrege` (libellé court de colonne), `etablissement`.
- **Hypothèse** : textures, régimes, enrichi et panée comptés **en plats** (double plat = 2) ⇒ Normal + Haché + Mixé = total. Double plat, double légumes et pots gourmands comptés en personnes.
- **Hypothèse** : Sodexo saisi en `{standard, sansPorc}` par créneau (la maquette cuisine montre du sans porc Sodexo) ; ancien format nombre accepté.
- Chariots : un par parc et par activité (volume > 0) ; 6 étiquettes par page, page suivante si besoin. Étiquette si texture ≠ normal, régime autre que « sans porc » seul, option ou consigne ; « sans porc » seul et « normaux simples » en collectif.
- Feuilles d'un créneau à 0 plat non imprimées. Pots gourmands : pastille sur l'étiquette, absents de la feuille cuisine.
- « Créer la semaine suivante » reprend salariés, Sodexo, direction, nettoyage ; pas les présences ni les activités (presets).
- Clic sur une présence : si la valeur revient à celle de la fiche, la saisie est effacée (pas de fausse alerte).
- « Normal », « Sans porc », « Sans viande » renommables mais non supprimables (utilisés par les calculs).
- Police Atkinson Hyperlegible utilisée seulement si installée (pas de téléchargement : hors ligne, aucune dépendance) ; sinon police système.
- Données de démarrage : codes remplacés par des **noms fictifs** (demande utilisateur). Les vrais noms restent uniquement dans `data/source/` (non versionné) ; pour les utiliser, importer un JSON gardé hors du dépôt. Identifiants internes AMB-01… conservés (invisibles).

## 2026-10-19 — Retours V1
- Fichiers de données de l'appli dans `src/data/` (JSON de démarrage déplacé depuis `data/`) ; le code n'accède plus à `../data`. Raison : demande utilisateur, `src/` autonome.
- Saisie des présences par « presser-glisser-relâcher » : la valeur inverse de la première case est appliquée au rectangle survolé. Raison : demande utilisateur (saisie plus rapide).
- `src/data/` ignoré par git (données résidents réelles) ; le JSON de démarrage n'y est plus versionné, seule sa copie fictive `src/js/data/demarrage.js` l'est. Raison : demande utilisateur, données personnelles/santé.

## 2026-10-20 — Nettoyage et plats témoins
- Nettoyage en deux lignes : « Nettoyage » (standard) et « Nettoyage sans viande ». Anciens fichiers (version 1) : leur nettoyage passe en sans viande (c'était la règle). Format de fichier version 2. Raison : demande utilisateur.
- Plats témoins : saisis par service (ligne de la semaine), colonne « TÉMOINS » de la feuille cuisine, comptés en texture normale sans régime et **ajoutés au total à produire**. Repris par « Créer la semaine suivante » (comme direction/nettoyage). Pas de chariot. Raison : réponses utilisateur.
- Feuille cuisine : en-têtes de colonnes 11 px et zones 10 px pour loger la colonne en plus (même avec une activité).

## 2026-10-20 — Service Petit déjeuner et filtre des services
- Nouveau service **Petit déjeuner** (avant midi) : **présences seulement** (pas de textures, régimes, options ni double plat). Lignes salariés / Sodexo / direction / nettoyage / témoins disponibles (vides par défaut ; l'utilisateur n'a pas de préférence). Feuille cuisine et feuille chariot imprimées, en version simplifiée. Raison : réponses utilisateur.
- Absences : une case par service. Fichiers d'avant (version ≤ 2) : une absence « midi et soir » couvre aussi le petit déjeuner. Format de fichier version 3.
- Page Semaine : filtre « Services affichés » = simple affichage (les données restent), au moins un service, mémorisé dans le navigateur.
- « Feuille chef » renommée **« feuille cuisine »** partout (docs, appli, titre imprimé). Raison : demande utilisateur.

## 2026-10-20 — Services concernés par les régimes et page Régimes
- Chaque texture / régime / option a des **services concernés** (cases P.-déj. / Midi / Soir, cochables directement sur la page Régimes). Un élément décoché n'est ni compté ni affiché pour ce service (feuille cuisine, chariot, pastilles). Format de fichier version 4. Raison : demande utilisateur.
- Fichiers d'avant (version ≤ 3) : tout concerne midi et soir (comportement d'avant), sauf **pots gourmands → petit déjeuner seulement** (alternative du petit déjeuner).
- Texture décochée pour un service : le résident est compté dans la texture par défaut (si elle concerne le service), pour garder Normal + Haché + Mixé = total. Petit déjeuner : jamais de double plat.
- Options « information » (pots gourmands) : nouveau groupe « INFORMATIONS (hors production) » de la feuille cuisine = quantité par zone, sur les services cochés (réponse 4 : « quantité sur telle zone »). Chariot du petit déjeuner : encadré « Particularités » avec les noms.
- Page Régimes en **trois tableaux** (Textures, Régimes, Options), chacun avec son bouton d'ajout ; flèches ↑↓ au sein du tableau. Raison : demande utilisateur.

## 2026-10-20 — Fin des données de démarrage, listes par défaut
- `recueil_base_s42.json` et sa copie `demarrage.js` **abandonnés** (plus aucune référence dans l'appli). Remplace les décisions antérieures sur les « données de démarrage ». Raison : demande utilisateur.
- Base vide (accueil ou « Repartir de zéro ») = **liste par défaut** des textures / régimes / options écrite dans le code (`Modele.REGIMES_DEFAUT`), mêmes éléments, couleurs et services qu'avant ; rangée par groupe. Les modifications faites dans la page Régimes ne changent pas cette liste.
- Listes par défaut enrichies (choix utilisateur sur propositions) : textures Normal, Haché (= « coupé », vocabulaire client), Tendre, Mouliné, Mixé ; régimes : les 6 existants + Végétarien (ni viande ni poisson, ≠ Sans viande), Sans sel, Pauvre en potassium / protéines, Sans gluten, Sans lactose, Allergie lait, Allergie œufs, Allergie arachides, Allergie fruits à coque (pas de Halal : « Sans porc » suffit) ; options : les 5 existantes + Demi-portion (assiette individuelle). Services : midi + soir (pots gourmands : petit déjeuner). Ordre des textures modifiable (↑↓ page Régimes).
- Feuille cuisine : avec beaucoup d'éléments, les lignes rapetissent pour tenir sur la page (rien n'est coupé).

## 2026-10-20 — Colonnes « Toujours affiché » de la grille Semaine
- Chaque texture / régime / option a une case **« Toujours affiché »** (page Régimes, info-bulle). Coché : colonne toujours dans la grille Semaine. Décoché : colonne seulement si un résident **du parc affiché** a l'élément. Raison : demande utilisateur (trop de colonnes).
- Défaut : les 14 éléments d'avant cochés, les nouveaux non ; nouvel élément ajouté : non coché. Champ absent (fichiers existants) = coché, donc rien ne change pour eux (pas de nouvelle version de fichier).
- Hors champ : Résidents › Tableau garde toutes les colonnes (sert à cocher les régimes) ; feuilles imprimées inchangées. Texture par défaut (Normal) : jamais de colonne, pas de case.
- « Mixé lisse » retiré de la liste par défaut : pour le client, « Mixé » veut déjà dire lisse. Raison : demande utilisateur.

## 2026-10-20 — Preset « MAS La Fontaine » (parcs)
- Client principal : ses 7 parcs (AMBOISE, BONAGUIL, COLLIOURE, LUDE, MIRANDE, SULLY, ALHAMBRA, avec leurs couleurs) sont intégrés au code. Raison : demande utilisateur.
- Accès : accueil « Commencer avec MAS La Fontaine » + page Parcs « Ajouter les parcs MAS La Fontaine ». Parcs déjà présents (même nom) : on n'ajoute que les manquants, rien n'est modifié ni supprimé.
- Le preset ne contient que les parcs (textures / régimes / options = listes par défaut).
- Ajout : preset d'activité **Sport, jeudi midi** (sans participant, couleur par défaut). Accueil MAS : inclus ; page Activités : « Ajouter les presets MAS La Fontaine » s'il manque (même nom). Raison : demande utilisateur.

## 2026-10-20 — Sodexo sans porc retiré
- Grille Semaine : plus de ligne « Salariés SODEXO sans porc » ; la ligne standard est renommée « Salariés SODEXO ». Raison : demande utilisateur.
- Anciennes données : un sans porc Sodexo déjà saisi est compté en standard à l'ouverture (le nombre de repas ne change pas).

## 2026-10-20 — Carrés de quantité (grille Semaine)
- Sous les en-têtes : ligne « Total à produire » = un carré par service avec le total de toute la MAS (même chiffre que TOTAL À PRODUIRE de la feuille cuisine), identique sur chaque onglet de parc. Raison : faciliter la communication des quantités (choix utilisateur).
- Puis une ligne de carrés par texture (fond = couleur de la texture), comptée en plats comme la feuille cuisine (Normal + Haché + … = total). Textures montrées : par défaut, « Toujours affichées », et toute texture ayant au moins un plat sur un service affiché (sinon la somme serait fausse). Raison : la texture est essentielle (choix utilisateur).
- Correction utilisateur : les carrés comptent le **parc affiché**, pas la MAS. Ligne « Plats <parc> » = colonne du parc sur la feuille cuisine (résidents présents hors partis en activité + doubles plats + salariés du parc) ; textures idem, pour ce parc.
- Lignes de texture : affichées seulement si la texture a au moins un plat dans le parc sur un service affiché de la semaine (y compris Normal et les « Toujours affichées »). Raison : demande utilisateur.

## 2026-10-20 — Feuille cuisine sans lignes à 0
- Textures, régimes et options dont le total du service est 0 : ligne non imprimée (pastilles « Sur ces N plats » aussi). Les lignes REPAS restent. Raison : demande utilisateur (répond à la question ouverte du 9e lot).

## 2026-10-20 — Feuille chariot : bacs salariés / résidents séparés
- Collectif en quatre bacs : Salariés standard, Salariés sans porc, Résidents simples, Résidents sans porc (avant : un bac « sans porc » commun). Fond beige = salariés, bleu = résidents. Bac imprimé seulement si sa quantité n'est pas 0 (aucun → « Aucun bac collectif cette fois »). Petit déjeuner : idem pour Salariés / Résidents. Raison : demande utilisateur.

## 2026-10-20 — Grille Semaine : case = nombre de plats
- Résident présent avec une option « plat » (double plat) : la case affiche 2 au lieu de 1 (info-bulle « double plat (2 plats) ») ; petit déjeuner toujours 1 ; absent 0. Le clic inverse toujours présent / absent. Raison : demande utilisateur.
