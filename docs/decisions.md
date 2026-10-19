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
