# Module aide (`src/js/aide/`, `src/js/ui/aide.js`, `src/guide.html`)

Définition fonctionnelle : `docs/aide.md`. Textes sources relus : `docs/aide-textes.md`, `docs/aide-guide.md`.

| Fichier | Rôle |
|---|---|
| `js/aide/contenu.js` | `Recueil.Aide` : données pures. `SECTIONS` (ancres du guide), `PAGES` (une aide par type de page : `nom`, `quoi`, `points`, `illu`, `guide`), `SLIDES` (présentation : `titre`, `illu`, `texte` — chaîne ou `{vide, mas, revue}` —, `aller` / `aller2` = boutons « Aller à… »), `lienGuide(section)`. Textes : `**gras**`, `\n` = retour à la ligne. |
| `js/aide/illustrations.js` | `Recueil.Illustrations` : `texte(t)` (texte → nœuds, jamais de HTML), `faire(nom)` (maquette DOM aux styles de l'appli), `NOMS`. Ne dépend pas de `Recueil.App` : lu aussi par `guide.html` et `tests.html`. |
| `js/ui/aide.js` | `Recueil.AideUi` : `aidePage(type)` (fenêtre d'aide), `menu()` (menu « ? Aide »), `boutonTitre(contenu, type)`, `presentation(variante)`, `init()` (touche F1). |
| `css/aide.css` | Bouton « ? », menu Aide, fenêtres d'aide et de présentation, maquettes (`.illu-*`). Chargé après `app.css`. |
| `guide.html` + `css/guide.css` | Guide complet (HTML écrit à la main, sommaire fixe, impression). Les `<div data-illu="nom">` sont remplacés par les maquettes ; contrôle au chargement que chaque section de `Aide.SECTIONS` existe (`console.error` + `body[data-sections-manquantes]`). |

## Branchements dans l'application
- **Bandeau noir** : bouton « ? Aide » toujours présent (`App.menuOuvert === 'aide'`) → `AideUi.menu()` : Aide sur cette page (si la page a une aide), Guide d'utilisation (lien `target=_blank`), Revoir la présentation (si des données), version.
- **« ? » à côté du titre** : `App.rendre` appelle `AideUi.boutonTitre` après le rendu de la page ; le `h1` de `.page-tete` / `.fiche-tete` est enveloppé dans `.titre-aide` avec le bouton (aucune page n'a à s'en occuper). Une page sans entrée dans `Aide.PAGES` n'a pas de bouton.
- **F1** : `AideUi.init()` (appelée par `App.demarrer`), ignorée si une fenêtre est ouverte.
- **Présentation** : `App.remplacerDonnees(donnees, origine, { presentation: 'mas' | 'vide' })` l'ouvre après la création d'une base (tuiles « MAS La Fontaine » / « Base vide » de l'accueil, « Repartir de zéro » de la page Importer). Pas à l'import d'un fichier. Revue par « ? Aide » ou la page Options (variante `revue`). Rien n'est mémorisé : elle ne s'ouvre qu'à la création.
- **Fenêtres** : `App.fenetre(contenu, boutons, surFin, classe)` (4e paramètre = classe CSS ajoutée à `.dialogue`).
- **Accueil** : groupe « Besoin d'aide ? » (tuile guide) et pied « Version 1.0 · Guide d'utilisation ». **Options** : carte « À propos » (version, guide, revoir la présentation).
- **Version** : `Modele.VERSION_APP` (constante unique, `'1.0'`), distincte de `Modele.VERSION` (format des données).

## Ajouter ou changer une page
1. Une entrée dans `Aide.PAGES` (clé = type d'onglet), une section dans `guide.html` (id = `guide` de l'entrée, listé dans `Aide.SECTIONS`), une maquette si besoin (`Illustrations`).
2. `tests.html` vérifie : une aide par type de page, chaque `guide` ∈ `SECTIONS`, chaque `illu` connue, ≥ 3 points, boutons « Aller à… » valides. Il ne lit pas `guide.html` (en `file://` un navigateur ne le permet pas) : c'est `guide.html` qui contrôle ses propres ancres au chargement.
3. Si la liste des types de page de `tests.html` change, la mettre à jour.
