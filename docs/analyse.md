# Analyse (phase 1)

Détail technique des fichiers : `data/resumes/effectifs_repas.md`.

## Contexte
- EHPAD (à confirmer), cuisine/prestataire de restauration collective. Le **client** (l'EHPAD) saisit chaque semaine ; l'utilisateur (prestataire) en déduit ce que le **chef** produit et ce qui part sur les **chariots** (1 par parc).
- 7 parcs : Amboise, Bonaguil, Collioure, Lude, Mirande, Sully, Alhambra (+ bloc temporaire **Sport du jeudi midi**). ~62 résidents.
- Rythme : jeudi, réception de la feuille client de la semaine suivante ; copie dans l'Excel maison ; envoi de l'Excel au chef.
- Services : midi et soir (petit-déjeuner ignoré). Convives : résidents + salariés (standard / sans porc) par parc, + hors parc : personnel de nettoyage (5, sans viande) et direction client (2-3, en semaine) — à compter dans les totaux globaux uniquement.

## Modèle de données déduit
- **Parc** : nom, couleur.
- **Régime/texture/option** (12 aujourd'hui, extensibles, avec couleur) — trois natures mélangées :
  - Régimes impératifs (contraintes) : sans porc, sans résidus, diabétique, sans produit de la mer, hypocalorique.
  - Textures : haché, mixé.
  - Options/exceptions (bonus ou substitution, souvent sur avis médical) : double légumes vert, double plat, pots gourmands, enrichi, poisson/viande panée + pâtes/riz/frite.
  - Une option comme "double portion" doit préciser ce qu'elle double (plat, entrée, dessert…).
- **Résident** : nom, prénom, âge, sexe, parc, régimes/textures/options, périodes d'absence, archivé oui/non. Présent par défaut s'il existe.
- **Présence** : par jour × service (midi/soir). Aujourd'hui saisie à la main (1/0) ; cible : déduite + alertes d'incohérence avec les absences.
- **Salariés** : par parc, 2 catégories (standard / sans porc), nombre par service. Hors parc : nettoyage, direction.
- **Sport** : parc temporaire (jeudi midi, optionnel) pouvant contenir des résidents de plusieurs parcs ; leur repas passe du parc d'origine au parc Sport pour ce service (même plat, autre chariot).

## Sorties attendues (A4 imprimables)
1. **Feuille chef** (production, par jour + service) : par parc, nb de repas (résidents + salariés), détail par régime/texture/option, doubles portions (ex. 8 entrées, 10 plats, 8 desserts).
2. **Feuille chariot** (par parc, jour + service) : totaux à charger + assiettes individuelles à identifier (nom, texture, régime, étiquette).
3. Totaux globaux incluant nettoyage et direction.

## Problèmes du fonctionnement actuel
| # | Problème | Conséquence |
|---|---|---|
| 1 | Rigide : ajout/retrait de résident ou de régime = modifier les feuilles et formules | Lenteur, erreurs |
| 2 | Fragile : formules dépendantes de positions de cellules ; effacer une formule peut corrompre | Données fausses silencieuses |
| 3 | Transmission client → prestataire pauvre : hospitalisations, changements de régime ponctuels non anticipés (ex. retour d'hôpital en mixé) | Plats inadaptés, plats produits et facturés pour rien |
| 4 | Trop d'information mélangée sur la page client (parcs, noms, régimes, présence éditables ensemble) | Erreurs de saisie, d'où les feuilles dérivées |
| 5 | Envoi de l'Excel brut au chef | Illisible, pas imprimable proprement |

## Défauts techniques constatés dans l'Excel (diagnostic)
1. **Sélecteur RECAP cassé** : le décalage de colonnes est 1,3,5,7,9,11,13 au lieu de 1,4,7,10,13,16,19 → mardi lit une colonne vide (aucune donnée), mercredi lit le soir de mardi, etc. Seul lundi fonctionne.
2. **Colonne J incohérente** : "Plateau hypo" côté client, "Double légumes + féculent" côté SEMAINE2/RECAP → un régime n'est jamais restitué (hypo) ou mal étiqueté.
3. **Sport non géré** : exclu des totaux MCH, inclus dans ceux de SEMAINE2, 0 ou ligne unique dans RECAP ; aucune règle pour retirer le repas du parc d'origine.
4. **MATFER** : liste nominative en `#REF!` (137 cellules), impression limitée à Amboise.
5. **Totaux de parc SEMAINE2** : comptent les régimes sans regarder la présence du jour.
6. Observations libres redondantes/contradictoires avec les cases X ; dates périmées dans les en-têtes ; "DINER" vs "SOIR".

## Contraintes
- **Informatique** : pas de serveur ou très contrôlé ; échange par fichier sur le serveur d'entreprise. → application locale, fichier d'échange (JSON) exporté par le client, ouvert par le prestataire.
- **Client rigide** : l'outil ne doit pas changer ses habitudes : affichage proche de la feuille actuelle, aucun apprentissage, aucune frustration.
- **Gratuit** intégral (voir `technique.md` plus tard).
- Sauvegarde automatique interne pendant l'édition ; export à nom suggéré (n° de semaine, date) ; mémoire du dernier fichier ouvert ; mode lecture par défaut + bouton "Éditer" qui crée une copie.
- Données de santé : confidentialité.

## Enjeux (pourquoi)
Gain de temps, moins d'erreurs, moins de gaspillage et de plats facturés pour rien, charge mentale réduite ; faciliter l'administratif du client (gestion parcs/résidents/régimes) ; alertes et affichage adaptatif.
