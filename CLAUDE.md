# Projet "papa" (nom provisoire) — règles et routage

Projet : "Recueil Alimentation MAS La Fontaine" (nom provisoire ; MAS = Maison d'Accueil Spécialisée, pas EHPAD).
Utilisateur : conseiller culinaire en restauration collective. Non-développeur : expliquer simplement, en français.
Langue : français pour échanges et docs. Code/identifiants : anglais ou français, à fixer en phase 4.

## Règles impératives
1. **Gratuit uniquement** : aucun outil, lib, service ou partie payant, limité (quota, freemium) ou à licence restrictive. Toute dépendance est consignée dans `docs/technique.md` avec sa licence.
2. **Économie de tokens** : ne lire que le fichier MD utile (table ci-dessous). Ne jamais relire un Excel déjà résumé : lire son résumé `data/resumes/`.
3. **Phases dans l'ordre** : 1 Analyse → 2 Conseil → 3 Design → 4 Analyse technique → 5 Code. Ne pas coder avant validation design + choix techniques. Phase courante : voir `docs/etat.md`.
4. **Mettre à jour les MD** à chaque décision/avancée (courtement). Le MD est la mémoire ; la conversation est jetable.
5. **Contexte lourd ou conversation longue** → proposer `/compact` ou nouvelle conversation (avec prompt de reprise + `handoff.md` si utile ; `handoff.md` est temporaire, à supprimer après lecture).
6. **Données** : les Excel sources peuvent contenir des données personnelles/santé → `data/source/` et `src/data/` (données résidents réelles de l'appli) sont ignorés par git. Ne jamais publier ni envoyer ailleurs.
7. Ne pas inventer le métier : en cas de doute sur un terme/règle de restauration collective, demander.

## Table de routage (que lire, quand)
| Fichier | Contenu | Lire quand |
|---|---|---|
| `docs/etat.md` | Phase courante, prochaines actions, questions ouvertes | Début de chaque session |
| `docs/analyse.md` | Contraintes, problèmes du fonctionnement actuel | Phase 1-2 |
| `docs/questions.md` / `docs/reponses.md` | Questions phase 2 / réponses brutes de l'utilisateur | Seulement pour retrouver une formulation exacte |
| `docs/produit.md` | Fiche produit globale (périmètre, fonctions, décisions) | Phase 2+ |
| `docs/decisions.md` | Journal bref des décisions (date, choix, raison) | Avant de remettre un choix en question |
| `docs/glossaire.md` | Vocabulaire métier | Doute sur un terme |
| `docs/design.md` | Index des maquettes : validées / en cours / archives | Phase 3+ |
| `docs/technique.md` | Langage, libs, licences (preuve du "gratuit") | Phase 4+ |
| `docs/code/architecture.md` | Architecture globale + routage vers `docs/code/*.md` par module | Phase 5 |
| `data/README.md` | Index des fichiers sources/CSV/résumés | Avant toute analyse de données |
| `data/resumes/*.md` | Ce qui a été compris de chaque Excel | Au lieu de rouvrir l'Excel |
| `data/csv/*.csv` | Extraits simples pour vérification | Vérifier une donnée |

## Arborescence
```
CLAUDE.md  .gitignore  handoff.md (temporaire)
docs/      etat, analyse, produit, decisions, glossaire, design, technique, code/
data/      source/ (Excel, non versionné)  csv/  resumes/  README.md
src/       code (phase 5)
```

## Conventions
- Excel analysé → extrait CSV utile (pas l'intégralité) + résumé MD (structure, colonnes, règles déduites, doutes) + ligne dans `data/README.md`.
- Un fichier MD = un sujet, court. Si > ~200 lignes, découper.
- Maquettes : Canvas Claude Design ; états `validé` / `en cours` (supprimable après choix) / `archive` — référencés dans `docs/design.md`.
