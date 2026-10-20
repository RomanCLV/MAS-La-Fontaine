# Choix techniques (phase 4)

Règle : **100 % gratuit, sans quota, sans partie payante**. Chaque élément indique sa licence.
Principe directeur : **zéro dépendance externe, zéro installation** → rien à payer, rien à mettre à jour, fonctionne hors ligne.

| Élément | Choix | Licence | Gratuit sans limite ? | Raison |
|---|---|---|---|---|
| Application | Page web locale : `index.html` + fichiers `.js`/`.css` ouverts dans le navigateur (double-clic) | — (code du projet) | Oui | Pas de serveur, pas d'installation |
| Langage | HTML + CSS + JavaScript « vanilla » (sans framework, sans npm, sans build) | Standards ouverts du web | Oui | Rien à installer côté utilisateur ; code lisible et durable |
| Scripts | Scripts classiques (`<script src>`), **pas de modules ES** | — | Oui | Les modules sont bloqués par les navigateurs en ouverture de fichier (`file://`) |
| Navigateur cible | **Firefox, Chrome, Edge** (comportement identique) | Gratuits | Oui | Aucune fonction réservée à un navigateur |
| Échange de fichier | **Importer** (`<input type=file>`) et **Exporter** (téléchargement `.json`) — identiques partout. Bonus facultatif Chrome/Edge : lier un fichier (API *File System Access*) pour l'enregistrer sans re-télécharger | Standard intégré | Oui | Seul comportement commun à Firefox/Chrome/Edge |
| Format de données | **JSON** (un fichier = une semaine + référentiels), champ `version` pour migrer plus tard | Standard ouvert | Oui | Décision produit |
| **Copie de travail** (autosauvegarde continue), onglets ouverts, mode manager | `IndexedDB` / `localStorage` du navigateur (stockage persistant, pas le cache) | Intégré | Oui | À la réouverture : données et onglets restaurés sans rouvrir de fichier |
| Impression | CSS `@page { size: A4 landscape }` + `window.print()` (une feuille par jour × service, saut de page CSS) ; PDF possible via « Enregistrer au format PDF » du navigateur | Intégré | Oui | Pas de lib PDF |
| Couleurs / pastilles | Variables CSS alimentées par les référentiels | — | Oui | Couleurs administrables |
| Tests | Fichier `tests.html` ouvert dans le navigateur (fonctions de calcul des totaux testées avec des `assert` maison) | — | Oui | Les totaux sont le risque n°1 |
| Versionnage | Git (local) | GPL v2 | Oui | Déjà en place |

## Architecture visée (détail en phase 5 dans `docs/code/architecture.md`)
- `src/data` : modèle (résidents, parcs, régimes, activités, semaine) + lecture/écriture JSON + migration de version.
- `src/calc` : **calculs purs** (totaux par zone, ventilation « sur N plats », répartition activité) — sans écran, donc testables.
- `src/ui` : pages (Semaine, Résidents, Parcs, Activités, Régimes, Fichier import/export) + onglets.
- `src/print` : feuille cuisine et feuille chariot (HTML/CSS imprimable).

## Points à confirmer (hypothèse par défaut retenue)
1. **Zone du nettoyage** → colonne « Autres » (comme sur les maquettes).
2. **Archiver vs supprimer** → archiver = masqué des listes et de la saisie, conservé dans le fichier (réactivable) ; supprimer = retiré définitivement, avec confirmation.
3. **`recueil.ini`** → **abandonné** (une page web ne peut pas écrire à côté d'elle). Copie de travail, onglets et mode manager sont dans le stockage du navigateur. **L'import crée la copie de travail sans toucher au fichier original** (remplace « lecture seule / Éditer »). Limites : vider les données du site efface la copie → exporter régulièrement (rappel dans l'appli) ; déplacer le dossier de l'appli peut, sous Firefox, faire perdre la copie.
4. Poste client : Windows ; navigateur quelconque (Firefox inclus) ; JSON sur clé USB, dossier réseau ou mail.

## Risques connus
- Firefox : stockage lié à l'emplacement du fichier `index.html` (ne pas le déplacer ; sinon import du dernier export). Option « effacer les données à la fermeture » à éviter.
- Si ces limites gênent à l'usage : mini-lanceur local gratuit (plus tard).

## Réalisation (phase 5)
**Aucune dépendance externe** : pas de bibliothèque, pas de police téléchargée, pas de npm, pas de serveur. Licence de tiers à consigner : **aucune**.
- Copie de travail : `localStorage` (clés `recueil.donnees`, `recueil.meta`, `recueil.ui`).
- Tests : `src/tests.html` (assertions maison).
- Outil de développement seulement (non livré, non nécessaire à l'utilisateur) : serveur `python -m http.server` (Python, licence PSF) déclaré dans `.claude/launch.json` pour tester dans le navigateur intégré de Claude, qui n'exécute pas les scripts en `file://`.

## Listes par défaut
Aucun fichier de démarrage. Une base vide reçoit les textures / régimes / options par défaut écrits dans le code (`REGIMES_DEFAUT`, `src/js/data/modele.js`) ; ni parc ni résident. Schéma dans `docs/code/architecture.md`.
