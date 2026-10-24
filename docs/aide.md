# Aide à l'utilisation (guide, présentation, aide par page)

Validé le 2026-10-23. Dernière pièce de la V1. Utilisation seulement, rien de technique. Ton : vouvoiement.
Textes à relire : `aide-textes.md` (présentation + aides par page), `aide-guide.md` (guide complet).

## Principe commun
- **Un seul fichier de contenu** (textes + illustrations) lu par trois endroits : guide, présentation, fenêtres d'aide. Une règle qui change = un texte à corriger.
- **Illustrations = petites maquettes dessinées avec les styles réels de l'appli** (cases vertes / rouges / hachurées / jaunes, carrés de plats, pastilles de parcs, onglets), pas de captures d'écran (elles deviennent fausses au moindre changement). Réutilisées partout.
- Aucune dépendance, aucun réseau : tout fonctionne en `file://`. Rien à ajouter à `technique.md`.

## 1. Guide d'utilisation (`src/guide.html`)
- Second fichier HTML, ouvert dans un **nouvel onglet du navigateur** (lien relatif `guide.html#section`). Lisible seul, sans données. Sommaire fixe à gauche, ancres vers chaque section, feuille de style d'impression (PDF possible).
- Plan : 1 Pour commencer (dont « où sont mes données ? ») · 2 Première mise en route · 3 Une section par page · 4 La page Semaine en détail · 5 Lire les feuilles imprimées · 6 Comment l'appli compte · 7 « Je veux… » (recettes) · 8 Problèmes courants · 9 Glossaire.

## 2. Présentation de démarrage (carrousel)
- Fenêtre de l'appli : titre, 1-2 phrases courtes, illustration ; points de progression, Précédent / Suivant / Passer.
- **Quand** : à la création d'une base (« MAS La Fontaine » ou « Base vide »), une seule fois. **Pas** à l'import d'un fichier. Revoyable depuis le menu Aide.
- 7 slides : Bienvenue · Vos données (penser à Exporter) · Parcs · Résidents · Textures, régimes, options · Services et activités · La semaine. Les slides de réglage ont un bouton « Y aller » (ferme la fenêtre, ouvre la page). Texte du slide Parcs adapté : base vide / base MAS (7 parcs déjà là).

## 3. Aide par page
- Fenêtre d'aide par page : « à quoi sert cette page », 3-5 points clés, petite illustration, lien **« Lire le guide complet »** vers la bonne section.
- **Bouton** : « ? Aide » dans le **bandeau noir** (à côté d'Importer / Exporter, toujours visible, Semaine comprise) → menu : Aide sur cette page · Guide d'utilisation · Revoir la présentation · Version. Plus un petit « ? » à côté du titre de chaque page (ouvre directement l'aide de la page). Touche F1 = aide de la page en cours.
- Pages couvertes : Semaine, Résidents (liste / tableau), Fiche résident, Parcs, Services, Régimes, Activités, Importer, Exporter, Imprimer, Options.

## 4. Accueil et version
- Nouveau groupe « Besoin d'aide ? » avec la tuile « Guide d'utilisation » ; pied de page **« Version 1.1 · Nouveautés · Guide d'utilisation »**.
- Version de l'application = **une constante unique** (distincte de la version du format de données), affichée aussi dans le menu Aide et la page Options.

## Ordre de réalisation
1. Rédiger le contenu (relecture utilisateur : on n'invente pas le métier). 2. `guide.html`. 3. Menu Aide + fenêtres d'aide. 4. Présentation. 5. Accueil + version. 6. Docs (`code/aide.md`) + tests (chaque page a son aide ; chaque lien vers le guide pointe une section existante).

## État
- [x] Définition validée.
- [x] Contenu rédigé (brouillon dans `aide-textes.md` et `aide-guide.md`) — **à relire par l'utilisateur** (points « à confirmer » inclus).
- [x] `guide.html` · [x] menu Aide + fenêtres · [x] présentation · [x] accueil + version · [x] docs de code (`code/aide.md`) + tests (174 verts). Fait le 2026-10-23, à tester par l'utilisateur dans Firefox.
- Écart avec la définition : le **guide** est du HTML écrit à la main (long texte, lisible avec Ctrl+F) ; le contenu partagé (`contenu.js`) couvre la présentation et les aides par page, et les **maquettes** sont communes aux trois. `guide.html` contrôle lui-même ses ancres au chargement.

## 5. Nouveautés (annonce de mise à jour, 2026-10-24)
- Liste unique : `src/js/aide/nouveautes.js` (une entrée par version : date, `annoncer`, points typés Nouveau / Déplacé / Modifié / Retiré / Corrigé, bouton « Voir » vers la page, lien « En savoir plus » vers le guide).
- **Fenêtre « Quoi de neuf ? »** au démarrage, **une fois par navigateur**, si une version `annoncer: true` est sortie depuis la dernière vue (versions sautées regroupées). Pas au premier démarrage (présentation). Relue par « ? Aide › Nouveautés », Options › À propos, accueil, guide (section 10).
- **Règle** : tout changement visible (élément déplacé, renommé, retiré, nouvelle fonction) = une ligne dans `nouveautes.js`, écrite avec le changement (version suivante, invisible tant que `VERSION_APP` ne l'atteint pas). Correction seule = version x.y.z, `annoncer: false` ou rien. Avant un déploiement : monter `Modele.VERSION_APP`, dater l'entrée, relire les phrases avec l'utilisateur. `tests.html` échoue si la version n'a pas d'entrée.
