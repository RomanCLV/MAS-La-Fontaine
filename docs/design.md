# Design — index des maquettes (Canvas Claude Design)

Canvas unique (privé) : https://claude.ai/artifact/FGqnNvy6XnVWdVVvkUckx3 — « Recueil Alimentation – Maquettes ». Données de démonstration **fictives**. Hypothèses signalées sur 2 post-it du canvas.

## Validés le 2026-10-19 (v2.1, reflètent l'application cible)
| Maquette | Écran | Changements v2 |
|---|---|---|
| 1 `Main` | Feuille cuisine A4 paysage | Zones Parcs / Sodexo / Direction / Autres / TOTAL ; un seul total à produire ; ventilation « sur N plats » ; Haché/Mixé en couleur ; colonne Activité (Sport) |
| 2 `ChariotA` | Feuille chariot Amboise | Étiquette Résident/Salarié ; texture en bandeau coloré ; régimes colorés |
| 3 `Saisie` | Saisie client (interactif : Mode manager, Pages, stylo) | Barre d'onglets + menu Pages ; alertes au-dessus ; régimes lecture seule ; stylo au survol → onglet fiche ; lignes Sodexo/Direction/Nettoyage ; bandeau Activités ; sans « lignes libres » |
| 4A `Residents` | Page Résidents (nouveau) | Liste type TYPOLOGIE ; éditer/archiver/supprimer au survol |
| 4B `Activites` | Page Activités + presets (nouveau) | Jour, service, participants, presets |
| 4C `Referentiels` | Parcs + régimes | Sport retiré des parcs ; à scinder en pages distinctes |
| 4D `Resident` | Fiche résident + absences | Bouton Archiver |
| 5 `Fichier` | Import / export | À séparer en 2 pages dans l'app |

## Hypothèses appliquées
- Nettoyage : colonne « Autres » (à confirmer) ; Direction standard, lun–ven midi.
- Salarié avec régime = étiquette individuelle sur le chariot ; « sans porc » seuls = collectif.
- Absence : dates + services, sans motif. « Sans viande » = 13e colonne de régime.
- Alertes (manager seulement) : présence/absence uniquement, avec « C'est voulu / Ignorer ».
- Poste Windows, Chrome/Edge ; JSON sur clé USB ou dossier réseau.

## Retours v2.1 appliqués (2026-10-19)
Chariot sans pointillés ; preset seulement dans la fiche activité ; alertes avec « C'est voulu / Ignorer » (présence uniquement) ; mode manager dans recueil.ini ; code résident retiré ; activité sans salariés encadrants.

## Archives
- Variantes 1B (feuille cuisine en cartes par parc) et 2B (planche d'étiquettes A4) — écartées le 2026-10-19 (fichiers supprimés du canvas).
- v1 de 1A/2A/3 : remplacées par la v2 ci-dessus.

Format d'une ligne : `nom — écran/fonction — lien Canvas — date — remarques`
