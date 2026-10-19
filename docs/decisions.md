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
| 2026-10-19 | Impression A4 paysage, 1 feuille/jour/service ; priorité = feuille chef puis feuille chariot | Réponses 17, 19, 26 |
| 2026-10-19 | Alertes destinées au manager, jamais à la cuisine | Réponse 16 |
| 2026-10-19 | CSV/MD sans noms de résidents (codes type AMB-01) | Données de santé |
| 2026-10-19 | Mémoire du projet = fichiers MD routés par CLAUDE.md | Économie de tokens |

## 2026-10-19 — Retours maquettes phase 3 (v1)
- **Sport = activité**, pas un parc : ajoutée par semaine (jour, service, participants), presets réutilisables ; repas inchangé, seul le chariot change. Raison : éviter la double saisie et refléter la réalité.
- **Feuille chef variante A** ; zones Parcs / Sodexo / Direction / Nettoyage / Total ; un seul total à produire ; ventilation des régimes sur le total. Raison : totaux « par parc / général / avec doubles » étaient confus.
- Haché et Mixé mis en avant (couleur) sur la feuille chef.
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
- **Hypothèse** : Sodexo saisi en `{standard, sansPorc}` par créneau (la maquette chef montre du sans porc Sodexo) ; ancien format nombre accepté.
- Chariots : un par parc et par activité (volume > 0) ; 6 étiquettes par page, page suivante si besoin. Étiquette si texture ≠ normal, régime autre que « sans porc » seul, option ou consigne ; « sans porc » seul et « normaux simples » en collectif.
- Feuilles d'un créneau à 0 plat non imprimées. Pots gourmands : pastille sur l'étiquette, absents de la feuille chef.
- « Créer la semaine suivante » reprend salariés, Sodexo, direction, nettoyage ; pas les présences ni les activités (presets).
- Clic sur une présence : si la valeur revient à celle de la fiche, la saisie est effacée (pas de fausse alerte).
- « Normal », « Sans porc », « Sans viande » renommables mais non supprimables (utilisés par les calculs).
- Police Atkinson Hyperlegible utilisée seulement si installée (pas de téléchargement : hors ligne, aucune dépendance) ; sinon police système.
- Données de démarrage : codes remplacés par des **noms fictifs** (demande utilisateur). Les vrais noms restent uniquement dans `data/source/` (non versionné) ; pour les utiliser, importer un JSON gardé hors du dépôt. Identifiants internes AMB-01… conservés (invisibles).
