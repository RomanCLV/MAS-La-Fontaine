# Architecture du code (phase 5)

Application locale : `src/index.html` ouvert par double-clic (Firefox, Chrome, Edge). HTML/CSS/JS « vanilla », **scripts classiques** (pas de modules ES, bloqués en `file://`), aucune dépendance.
Tous les scripts s'enregistrent dans un seul objet global `window.Recueil` (`Recueil.Modele`, `Recueil.Calc`, …).

## Fichiers
```
src/index.html            application (charge les scripts dans l'ordre ci-dessous)
src/tests.html            tests des calculs (ouvrir dans le navigateur)
src/css/app.css           écrans
src/css/feuilles.css      feuilles A4 paysage (aperçu écran + impression)
src/js/data/modele.js     constantes, listes par défaut, dates, création, migration → data.md
src/js/data/stockage.js   copie de travail (localStorage), import/export JSON → data.md
src/js/calc/calc.js       calculs purs (présences, colonnes, chariots, alertes) → calc.md
src/js/print/feuilles.js  feuille cuisine + feuille chariot (HTML imprimable)   → print.md
src/js/ui/*.js            outils DOM, application à onglets, une page par fichier ; semaine-horsparc.js = onglet Hors parc de la Semaine → ui.md
src/js/aide/*.js          contenu et maquettes de l'aide ; ui/aide.js = menu, fenêtres, présentation → aide.md
src/guide.html            guide d'utilisation (second fichier, nouvel onglet) ; css/aide.css, css/guide.css
```

## Flux de données
```
fichier .json ──import──▶ Modele.migrer (normalise, applique les services) ──▶ copie de travail (localStorage, autosauvegarde)
                                               │
                     pages ui (saisie) ◀───────┤──── modifications → sauvegarde immédiate
                                               │
                     Calc (pur) ──▶ Feuilles (HTML A4) ──▶ window.print()
                                               │
copie de travail ──export──▶ fichier .json (téléchargement ; ou fichier lié si File System Access)
```
- `Calc` et `Modele` n'accèdent jamais au DOM ni au stockage : testables dans `tests.html`.
- L'interface ne calcule rien elle-même : elle appelle `Calc`.
- Alertes : calculées par `Calc.alertes`, affichées au-dessus de la grille Semaine, **jamais** dans `Feuilles`.

## Schéma JSON (version 1 = application 1.0, 2026-10-23 ; formats d'essai d'avant non lus)
```
{
  app: "recueil-alimentation-mas-la-fontaine", version: 1, exporteLe: "AAAA-MM-JJ",
  etablissement: "MAS La Fontaine",                       // ajouté par la normalisation si absent
  referentiels: {
    parcs:   [{ id, nom, couleur, ordre }],
    services: [{ id, nom, court, base, presenceSeule, permanent, jours: ["lun",…], archive }],  // ordre de la journée ; voir ci-dessous
    regimes: [{ id, nom, abrege?, nature: "texture"|"regime"|"option", couleur,
                affecte?: "plat"|"",                          // options seulement : +1 plat chaud ou sur l'assiette
                services: ["midi","soir"],                    // services concernés (absent = midi + soir)
                toujoursVisible: true }]                      // colonne toujours dans la grille Semaine (absent = true) ; sinon si un résident du parc l'a
  },
  residents: [{ id, nom, prenom, parcId, textureId, regimeIds[], optionIds[], consigne, archive,
                absences: [{ debut, fin, services: ["petitdej","midi","soir"] }] }],  // dates incluses
  presetsActivites: [{ id, nom, jours: ["jeu"], services: ["midi"], participantIds[], couleur }],
  semaines: [{
    id: "2026-S42", debut: "2026-10-12",                  // lundi
    presences:  { <residentId>: { <créneau>: 0|1 } },     // seulement les valeurs saisies ≠ défaut
    activites:  [{ id, nom, jour, service, participantIds[], presetId|null, couleur }],  // couleur : nouvelle activité = 1re couleur libre de M.PALETTE_ACTIVITES (8, bleu #2d6cb5 d'abord) ; absente = bleu
    salaries:   { <parcId>: { <créneau>: { standard, sansPorc } } },
    sodexo:     { <créneau>: { standard, sansPorc } },
    direction:  { <créneau>: n },  nettoyage: { <créneau>: n },  nettoyageSansViande: { <créneau>: n },
    temoins:    { <créneau>: n },                         // plats témoins (nombre donné par le client)
    servicesSemaine: { <service additionnel>: ["ven",…] },  // jours de cette semaine ([] = retiré) ; absent = jours habituels
    alertesTraitees: [{ cle, statut: "voulu"|"ignore" }]
  }]
}
```
Services : 3 **services de base** (`base: true`, `petitdej midi soir`, tous les jours, fixes : imposés par la normalisation) + **services additionnels** (page Services : nom, abrégé `court`, type, jours, ordre parmi les services de base, archivage ; identifiant sans `_`). Additionnel **permanent** (« Toutes les semaines ») : ses jours chaque semaine ; **ponctuel** (« Certaines semaines ») : seulement dans les semaines où on l'ajoute (page Semaine, `servicesSemaine`), ses jours étant proposés. Les jours d'un additionnel se règlent aussi pour une seule semaine (`servicesSemaine`).
Créneau = `<jour>_<service>` : jours `lun mar mer jeu ven sam dim` × services non archivés servis ce jour-là **cette semaine** (`Modele.creneaux(semaine)` ; 21 sans service additionnel). Service « présence seulement » (`presenceSeule` : petit déjeuner, ou un service additionnel de ce type) : on compte les présents, sans plat en plus ; textures, régimes et options seulement s'ils sont cochés pour ce service (comme midi et soir).

## Règles de calcul (résumé, détail dans `calc.md`)
- Présence effective : valeur saisie sinon 0 si absence dans la fiche, sinon 1 (service de base) ou, service additionnel, 1 si le service voisin le plus proche (avant ou après, même jour) est à 1.
- Volume (plats) = résidents présents + plats en plus (options « +1 plat », cumulables) + salariés (+ Sodexo, Direction, Nettoyage, Plats témoins).
- Activité : participants présents retirés de leur parc, comptés dans une colonne d'activité.
- Textures, régimes et options « assiette » comptés **en plats** (1 + une par option « +1 plat ») ⇒ Normal + Haché + Mixé = total.

## Routage vers les docs par module
| Module | Fichier | Rôle |
|---|---|---|
| data | `docs/code/data.md` | Modèle, migration, stockage, import/export |
| calc | `docs/code/calc.md` | Calculs purs et leurs règles métier |
| ui | `docs/code/ui.md` | Onglets, pages, alertes |
| print | `docs/code/print.md` | Feuille cuisine, feuille chariot, impression |
| aide | `docs/code/aide.md` | Guide, présentation de démarrage, aide par page, version |
