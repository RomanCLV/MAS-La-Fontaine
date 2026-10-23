# Aide : textes de la présentation et des aides par page (brouillon à relire)

Vouvoiement, phrases courtes. `[Illustration]` = petite maquette aux styles de l'appli (voir `aide.md`). Les noms de boutons sont ceux de l'appli.
À relire : le vocabulaire métier, et tout ce qui est marqué **(à confirmer)**.

## A. Présentation de démarrage (7 slides)

**1 · Bienvenue**
Vous saisissez les présences, l'application compte, vous imprimez les feuilles.
Trois étapes : *Saisir* → *Compter* → *Imprimer*.
[Illustration : une mini-grille de cases vertes → un carré de plats → une feuille A4]

**2 · Vos données restent sur cet ordinateur**
Tout ce que vous saisissez est enregistré tout seul dans ce navigateur.
Mais pour **sauvegarder** ou **envoyer** votre travail, il faut l'**exporter** : bouton « Exporter » en haut à droite.
Pensez à le faire régulièrement.
[Illustration : le bandeau noir avec le bouton Exporter entouré]

**3 · Les parcs**
*Base vide* : Un parc est une zone de la MAS, avec son chariot. Créez les vôtres dans la page « Parcs ».
*Base MAS La Fontaine* : Les 7 parcs de la MAS sont déjà là. Vous pouvez les modifier dans la page « Parcs ».
[Illustration : 7 pastilles de parcs colorées]
Bouton : « Aller à la page Parcs »

**4 · Les résidents**
Chaque résident a un parc, une texture (normal, haché, mixé…), éventuellement des régimes, des options et des absences prévues.
Ajoutez-les un par un dans « Résidents ».
[Illustration : une fiche résident simplifiée]
Bouton : « Aller à la page Résidents »

**5 · Textures, régimes et options**
La liste est déjà remplie (haché, mixé, sans porc, sans sel, double plat…). Vous pouvez la modifier, en ajouter ou en retirer.
Vous pouvez aussi choisir pour quels repas chacun compte (petit déjeuner, midi, soir).
[Illustration : trois colonnes Textures / Régimes / Options]
Bouton : « Aller à la page Régimes »

**6 · Services et activités (facultatif)**
*Services* : petit déjeuner, midi et soir existent déjà. Vous pouvez en ajouter (goûter, repas de Noël…).
*Activités* : une sortie qui regroupe des résidents de plusieurs parcs (Sport le jeudi midi…). Leur repas part sur un chariot à part.
[Illustration : un goûter ajouté dans la grille ; une case entourée de la couleur d'une activité]
Boutons : « Aller à la page Services » · « Aller à la page Activités »

**7 · La semaine**
C'est la page principale. Un clic sur une case inverse la présence ; vous pouvez aussi glisser sur plusieurs cases.
Les nombres de plats se calculent tout seuls. Quand c'est prêt : « Imprimer cette semaine ».
Besoin d'aide ? Le bouton « ? Aide » en haut est toujours là.
[Illustration : grille avec cases vertes, rouges, une jaune ; carrés de plats en haut]
Bouton : « Commencer »

---

## B. Aides par page (fenêtre)

Chaque fenêtre : phrase « À quoi sert cette page » · points clés · illustration · lien « Lire le guide complet ».

### Semaine (`#semaine`)
**À quoi sert cette page** : saisir qui mange à quels repas pendant la semaine, et voir les nombres de plats à produire.
- Un clic sur une case inverse sa valeur : **1** (vert) = présent, **0** (rouge) = absent. Glissez pour en changer plusieurs.
- Les cases rouges hachurées viennent d'une absence prévue dans la fiche du résident.
- Une case **jaune** est une alerte : à vérifier, ou à classer avec « C'est voulu » / « Ignorer ».
- Les carrés en haut donnent le nombre de plats par repas pour le parc affiché.
- Les lignes du bas : salariés, Sodexo, direction, nettoyage, témoins.
- Les boutons du bas : créer la semaine suivante, imprimer, supprimer cette semaine.
[Illustration : mini-grille avec la légende]

### Résidents (`#residents`)
**À quoi sert cette page** : la liste de tous les résidents, avec leur parc, leur texture et leurs régimes.
- **Liste** : une ligne par résident ; éditer, archiver ou supprimer au survol.
- **Tableau** : une colonne par texture, régime ou option ; cliquez une case pour l'attribuer, puis « Enregistrer ».
- Un résident **archivé** n'apparaît plus dans la semaine mais reste dans la liste.
- Les filtres (nom, parc, archivés) limitent l'affichage.
[Illustration : bascule Liste / Tableau]

### Fiche résident (`#fiche-resident`)
**À quoi sert cette page** : tout ce qui concerne un résident.
- Nom, prénom, parc, observation.
- **Texture** (une seule), **régimes et allergies** (plusieurs), **options** (plusieurs).
- **Absences prévues** : « + Ajouter une absence », avec les dates et les repas concernés. Elles remplissent automatiquement les cases de la semaine.
- Rien n'est gardé avant « Enregistrer ».
[Illustration : fiche avec trois groupes]

### Parcs (`#parcs`)
**À quoi sert cette page** : la liste des parcs (zones de la MAS), avec leur couleur.
- Un parc = un chariot à l'impression.
- La couleur sert partout : onglets de la semaine, feuilles imprimées.
- L'ordre des parcs est celui des onglets.
- Si vous avez commencé avec une base vide : « Ajouter les parcs MAS La Fontaine ».
[Illustration : pastilles de parcs]

### Services (`#services`)
**À quoi sert cette page** : les moments de repas de la journée.
- Petit déjeuner, midi et soir existent toujours.
- Vous pouvez ajouter un service (goûter, repas de fête…) : **Repas** (avec textures et régimes) ou **Présence seule** (on compte seulement les présents).
- **Toutes les semaines** : présent chaque semaine. **Certaines semaines** : vous l'ajoutez à une semaine précise depuis la page Semaine.
- Un service déjà utilisé ne peut pas être supprimé : archivez-le.
[Illustration : journée avec un goûter ajouté]

### Régimes (`#regimes`)
**À quoi sert cette page** : trois listes à régler.
- **Textures** : la consistance du plat (normal, haché, mixé…). Une seule par résident.
- **Régimes et allergies** : les contraintes alimentaires (sans porc, sans sel, allergies…).
- **Options** : ce qui s'ajoute (double plat, enrichi, pots gourmands…). « +1 plat chaud » ajoute un plat ; sinon l'option est comptée « sur l'assiette ».
- Pour chacun : les repas concernés, et « Toujours affiché » (colonne toujours dans la grille, ou seulement si un résident du parc en a besoin).
[Illustration : les trois tableaux]

### Activités (`#activites`)
**À quoi sert cette page** : les sorties et activités de la semaine.
- Une activité a un jour, un repas et des participants (de plusieurs parcs).
- Les participants **présents** sont retirés de leur parc et comptés dans l'activité : leur repas part sur un chariot à part.
- Un résident ne peut être que dans une activité par repas.
- Les **modèles** (ex. Sport jeudi midi) se réutilisent d'une semaine à l'autre.
[Illustration : case entourée de la couleur de l'activité]

### Importer (`#importer`)
**À quoi sert cette page** : ouvrir un fichier reçu (ou le vôtre).
- Choisissez un fichier `.json` exporté par l'application.
- Il **remplace** votre copie de travail : exportez d'abord si vous voulez la garder.
- « Repartir de zéro » vide tout et commence une base neuve.
[Illustration : fichier → copie de travail]

### Exporter (`#exporter`)
**À quoi sert cette page** : sauvegarder votre travail ou l'envoyer.
- Choisissez la semaine envoyée : elle donne son nom au fichier.
- « Télécharger le fichier » : le fichier va dans votre dossier Téléchargements.
- Envoyez-le ensuite par clé USB, dossier partagé ou mail. L'autre personne le charge avec « Importer ».
[Illustration : copie de travail → fichier]

### Imprimer (`#imprimer`)
**À quoi sert cette page** : préparer et lancer l'impression des feuilles.
- Choisissez la semaine, le type de feuille (**cuisine** et/ou **chariots**), les jours et les services.
- L'aperçu montre ce qui sera imprimé, une feuille par jour et par service.
- Format A4 paysage. Si les couleurs manquent : cochez « Imprimer les arrière-plans » dans la fenêtre d'impression.
- Un repas sans plat n'est pas imprimé.
[Illustration : feuille cuisine réduite]

### Options (`#options`)
**À quoi sert cette page** : réglages de l'application.
- **Fermer la page après avoir enregistré** : choisissez les pages qui se ferment toutes seules après « Enregistrer ».
- **Données en cache** : ce que l'application garde dans ce navigateur, et « Vider le cache local » (efface tout : exportez d'abord).
- Version de l'application et lien vers le guide.
[Illustration : cases à cocher]

### Accueil (sans lien d'aide propre)
Texte du pied de page : « Version 1.0 · Guide d'utilisation ». Tuile « Guide d'utilisation » (groupe « Besoin d'aide ? »).
