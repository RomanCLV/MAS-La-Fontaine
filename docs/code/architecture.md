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
src/js/ui/*.js            outils DOM, application à onglets, une page par fichier → ui.md
```

## Flux de données
```
fichier .json ──import──▶ Modele.migrer ──▶ copie de travail (localStorage, autosauvegarde)
                                               │
                     pages ui (saisie) ◀───────┤──── modifications → sauvegarde immédiate
                                               │
                     Calc (pur) ──▶ Feuilles (HTML A4) ──▶ window.print()
                                               │
copie de travail ──export──▶ fichier .json (téléchargement ; ou fichier lié si File System Access)
```
- `Calc` et `Modele` n'accèdent jamais au DOM ni au stockage : testables dans `tests.html`.
- L'interface ne calcule rien elle-même : elle appelle `Calc`.
- Alertes : calculées par `Calc.alertes`, affichées uniquement en mode manager, **jamais** dans `Feuilles`.

## Schéma JSON (version 4 ; versions 1 à 3 migrées à l'import)
```
{
  app: "recueil-alimentation-mas-la-fontaine", version: 4,   // v1 : nettoyage = tout sans viande ; v2 : pas de petit déjeuner (migrés) exporteLe: "AAAA-MM-JJ",
  etablissement: "MAS La Fontaine",                       // ajouté par la migration si absent
  referentiels: {
    parcs:   [{ id, nom, couleur, ordre }],
    regimes: [{ id, nom, abrege?, nature: "texture"|"regime"|"option", couleur,
                affecte?: "plat"|"legumes"|"information",     // options seulement
                services: ["midi","soir"],                    // services concernés ; v≤3 : midi+soir (pots gourmands : petitdej)
                toujoursVisible: true }]                      // colonne toujours dans la grille Semaine (absent = true) ; sinon si un résident du parc l'a
  },
  residents: [{ id, nom, prenom, parcId, textureId, regimeIds[], optionIds[], consigne, archive,
                absences: [{ debut, fin, services: ["petitdej","midi","soir"] }] }],  // dates incluses ; v2 « midi+soir » → + petitdej
  presetsActivites: [{ id, nom, jours: ["jeu"], services: ["midi"], participantIds[], couleur }],
  semaines: [{
    id: "2026-S42", debut: "2026-10-12",                  // lundi
    presences:  { <residentId>: { <créneau>: 0|1 } },     // seulement les valeurs saisies ≠ défaut
    activites:  [{ id, nom, jour, service, participantIds[], presetId|null, couleur }],  // couleur : défaut M.COULEUR_ACTIVITE (bleu #2d6cb5)
    salaries:   { <parcId>: { <créneau>: { standard, sansPorc } } },
    sodexo:     { <créneau>: { standard, sansPorc } },
    direction:  { <créneau>: n },  nettoyage: { <créneau>: n },  nettoyageSansViande: { <créneau>: n },
    temoins:    { <créneau>: n },                         // plats témoins (nombre donné par le client)
    alertesTraitees: [{ cle, statut: "voulu"|"ignore" }]
  }]
}
```
Créneau = `<jour>_<service>` : jours `lun mar mer jeu ven sam dim`, services `petitdej midi soir` (21 créneaux). Petit déjeuner = service « présence seulement » (`presenceSeule`) : on compte les présents, sans plat en plus ; textures, régimes et options seulement s'ils sont cochés pour ce service (comme midi et soir).

## Règles de calcul (résumé, détail dans `calc.md`)
- Présence effective : valeur saisie sinon 0 si absence dans la fiche, sinon 1.
- Volume (plats) = résidents présents + plats en plus (options « +1 plat », cumulables) + salariés (+ Sodexo, Direction, Nettoyage, Plats témoins).
- Activité : participants présents retirés de leur parc, comptés dans une colonne d'activité.
- Textures, régimes et options « assiette » comptés **en plats** (1 + une par option « +1 plat ») ⇒ Normal + Haché + Mixé = total.

## Routage vers les docs par module
| Module | Fichier | Rôle |
|---|---|---|
| data | `docs/code/data.md` | Modèle, migration, stockage, import/export |
| calc | `docs/code/calc.md` | Calculs purs et leurs règles métier |
| ui | `docs/code/ui.md` | Onglets, pages, alertes, mode manager |
| print | `docs/code/print.md` | Feuille cuisine, feuille chariot, impression |
