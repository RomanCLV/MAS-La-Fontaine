# Aide : texte du guide d'utilisation (brouillon à relire)

Contenu de `guide.html`, vouvoiement. Les aides par page (`aide-textes.md`) en reprennent le résumé. Chaque titre `##` = une section avec ancre. **(à confirmer)** = à valider avec vous.

# 1. Pour commencer

## À quoi sert l'application
Vous indiquez qui mange à quels repas pendant la semaine. L'application compte les plats (par parc, par texture, par régime, par option) et imprime la **feuille cuisine** et les **feuilles chariot**.

## Où sont mes données ? (à lire)
- Tout ce que vous saisissez est **enregistré automatiquement dans le navigateur** de cet ordinateur. Rien n'est envoyé ailleurs.
- Ce n'est **pas une sauvegarde** : si vous videz les données du navigateur, changez de navigateur ou d'ordinateur, vous ne retrouvez rien.
- Pour sauvegarder ou transmettre : **Exporter** (en haut à droite). Le bandeau affiche « Modifications non exportées » tant que vous n'avez pas exporté.
- Pour reprendre un fichier : **Importer**. Il remplace votre copie de travail.
- Gardez toujours un fichier exporté récent.

## Vue d'ensemble de l'écran
- **Bandeau noir** (toujours visible) : menu Pages, Importer, Exporter, Aide.
- **Onglets** : chaque page s'ouvre dans un onglet. Glissez-les pour les ranger ; « + » ouvre le menu des pages ; « Fermés récemment » rouvre une fiche fermée. Les onglets sont retrouvés à la réouverture.
- Une **pastille « Modifications non enregistrées »** apparaît quand une page a un brouillon : cliquez « Enregistrer » (ou abandonnez).

## Le choix de l'écran d'accueil
- **Ouvrir un fichier reçu** : reprendre un fichier exporté.
- **MAS La Fontaine** : les 7 parcs et l'activité Sport du jeudi midi, prêts à remplir.
- **Base vide** : tout est à créer (textures, régimes et options sont déjà proposés).

# 2. Première mise en route

Dans l'ordre conseillé :
1. **Parcs** : vérifiez ou créez les zones.
2. **Résidents** : ajoutez chaque résident (parc, texture, régimes, options).
3. **Régimes** : ajustez les listes si besoin.
4. **Services** (facultatif) : goûter, repas de fête…
5. **Activités** (facultatif) : Sport du jeudi…
6. **Semaine** : saisissez les présences, puis **Imprimer**.
Exportez dès que vos résidents sont saisis.

# 3. Les pages, une par une

## Semaine
Voir la section 4.

## Résidents
- **Liste** : une ligne par résident. Au survol : éditer, archiver, supprimer. Filtres : nom, parc, archivés.
- **Tableau** : une colonne par texture / régime / option ; cliquez pour attribuer ; « Enregistrer » valide tout d'un coup (les cases modifiées sont entourées).
- **Archiver** : le résident disparaît des semaines mais reste dans la liste. **Supprimer** : définitif.

## Fiche résident
Nom, prénom, parc, observation (visible sur l'étiquette du chariot), texture (une seule), régimes et allergies, options, absences prévues.
**Absence prévue** : « + Ajouter une absence » ouvre une fenêtre (du… au…, repas concernés). Elle met à 0 les cases correspondantes de la semaine (rouge hachuré). Dates incluses.

## Parcs
Nom, couleur, ordre. Un parc = un onglet de la semaine et un chariot. Impossible de supprimer un parc qui a encore des résidents, même archivés : changez-les de parc d'abord.

## Services
Petit déjeuner, midi, soir : fixes. Services ajoutés : nom, abrégé (en-tête de colonne), type **Repas** ou **Présence seule**, **toutes les semaines** ou **certaines semaines**, jours, place dans la journée (↑ ↓), archivage. Suppression refusée si le service est utilisé (la page dit où).
Un repas ajouté reprend les textures / régimes / options du midi ; une présence seule, ceux du petit déjeuner (modifiable page Régimes).

## Régimes
Trois tableaux : **Textures** (une par résident), **Régimes et allergies**, **Options**.
Pour chaque élément : nom, abrégé, couleur, **repas concernés** (P.-déj. / Midi / Soir), **Toujours affiché** (colonne toujours visible dans la grille ; sinon seulement si un résident du parc en a), et pour les options : effet **« +1 plat chaud »** ou **« sur l'assiette »**. « Normal », « Sans porc » et « Sans viande » se renomment mais ne se suppriment pas (l'application s'en sert pour compter).

## Activités
Nom, couleur (donnée automatiquement, modifiable), jour, repas, participants. Filtres : recherche, « Cacher les absents ». « Tout ajouter » / « Tout retirer » agissent sur les résidents affichés. Un résident ne participe qu'à une activité par repas.
**Modèles** : enregistrez une activité pour la recharger une autre semaine.

## Importer / Exporter
Voir la section 1. Exporter : choisissez la semaine (elle donne le nom du fichier). Importer : « Remplacer la copie de travail » après aperçu du contenu.

## Imprimer
Semaine, feuilles (cuisine / chariots), services, jours → aperçu → Imprimer. Voir la section 5.

## Options
Fermer une page après « Enregistrer » ; contenu du cache et « Vider le cache local » ; copie de sauvegarde créée lors d'une mise à jour de l'application (« Télécharger cette copie »).

# 4. La page Semaine en détail

## Choisir la semaine et le parc
Une semaine = du lundi au dimanche. Un **onglet par parc** (pastille de sa couleur). Le sélecteur de semaine est en haut de la page.

## Saisir les présences
- Chaque ligne = un résident, chaque colonne = un repas (jour × service).
- **Clic** : inverse la case. **Glisser** : applique la même valeur sur plusieurs cases (Échap annule). **Clavier** : Entrée ou Espace.
- Par défaut tout le monde est **présent** (1), sauf absence prévue dans la fiche. Pour un service ajouté, la présence suit le repas voisin.
- Une case présente affiche son **nombre de plats** : 2 avec un « double plat », 3 avec double plat et gros gourmand, 1 au petit déjeuner.

## Les couleurs
| Case | Sens |
|---|---|
| Verte | Présent et consommant ses repas |
| Rouge | Absent (saisi à la main) |
| Rouge hachuré | Absence prévue (fiche du résident) |
| Jaune | Alerte à vérifier |
| Entourée de couleur | Participe à une activité |
| Encadrée | Trouvé par la recherche |

## Les carrés de plats
Sous les en-têtes, par repas : **Plats du parc** (résidents présents hors activité + plats en plus + salariés du parc), une ligne par **texture**, **En activité** (plats partis avec une activité). Ils se mettent à jour pendant la saisie.

## Salariés du parc
Deux lignes de nombres sous la grille, par repas : salariés du parc, avec ou sans porc. Ils s'ajoutent au total à produire.

## Hors parc : Sodexo, direction, nettoyage, témoins
Onglet **Hors parc**, à droite des onglets de parc (même page Semaine, mêmes services affichés). Lignes par repas : Sodexo, direction, nettoyage, nettoyage sans viande, plats témoins, puis **Total hors parcs**. Ils s'ajoutent au total à produire de la feuille cuisine.

## Saisir les nombres (salariés, hors parc)
Comme dans Excel (les cases de présence gardent leur fonctionnement : un clic inverse).
- **Un clic** sélectionne la case. Tapez le nombre puis **Entrée**. **Double-clic** ou **Entrée** : modifier le nombre déjà saisi. **Échap** annule la saisie.
- **Glisser** sélectionne plusieurs cases (la grille défile près du bord) ; **Maj + clic** agrandit la sélection.
- **Suppr** / Retour arrière vide les cases sélectionnées (pas de retour en arrière ; message « N cases vidées »).
- **Échap** ou clic ailleurs : plus de sélection. Le clavier n'agit sur les cases que si une sélection est visible.

## Alertes
Au-dessus de la grille : « présent alors qu'absent » (une saisie contredit une absence prévue) et « aucune présence » (un résident à 0 toute la semaine). Chaque alerte : **C'est voulu** ou **Ignorer** (elle disparaît, réaffichage possible). Elles n'apparaissent **jamais** sur les feuilles imprimées.

## Rechercher
Le champ « Nom, régime, observation… » cherche dans tous les parcs. Plusieurs mots : tous doivent être trouvés (« haché porc »). Une feuille « Recherche » s'ouvre, présences modifiables, avec la colonne Parc. Cliquer un parc l'efface.

## Services affichés et services ajoutés
- **Services affichés** : cache des colonnes pour y voir plus clair (les données sont gardées).
- **Services ajoutés cette semaine** : « + Ajouter un service à cette semaine » (repas de Noël…), jours réglables pour cette semaine seulement.

## Activités de la semaine
Un bandeau rappelle les activités. Voir la page Activités pour les créer.

## Semaine suivante, impression, suppression
- **Créer la semaine suivante** : reprend salariés, Sodexo, direction, nettoyage, témoins et les cases mises à 0 ; pas les activités (utilisez les modèles). Corrigez ensuite.
- **Imprimer cette semaine** : ouvre la page Imprimer.
- **Supprimer cette semaine** : après confirmation ; impossible s'il n'en reste qu'une.

# 5. Lire les feuilles imprimées

## La feuille cuisine
Une par jour et par repas, A4 paysage. En haut : le **total à produire**. Puis un tableau **par zone** : chaque parc, chaque activité, Total parcs, Sodexo, Direction, Autres (nettoyage), Témoins, Total. Puis par lignes : **Repas**, **Textures**, **Régimes**, **Options** (haché et mixé en grand et en couleur). Les lignes à 0 ne sont pas imprimées. Au petit déjeuner : version simplifiée (présents).

## La feuille chariot
Une par parc et par activité (pas pour Sodexo, direction, nettoyage). En-tête à la couleur du parc. **Collectif** : bacs Salariés standard / sans porc, Résidents simples / sans porc (un bac à 0 n'est pas imprimé). **Étiquettes** (6 par page) : texture en grand, régimes, options, observation, **EQ** (équivalent portions : le nombre de plats de ce résident, « ×3 » si 3). Sur un chariot d'activité, l'étiquette rappelle le parc. Petit déjeuner : bacs et encadré « Particularités » (pots gourmands…).

## Conseils d'impression
A4 paysage, une feuille par page. Couleurs absentes : cochez « Imprimer les arrière-plans ». Pour un PDF : choisissez « Enregistrer au format PDF » comme imprimante.

# 6. Comment l'application compte

- **Présent** = 1 plat. **Absent** = 0.
- **Double plat** et autres options « +1 plat chaud » : un plat de plus chacune, cumulables (double plat + gros gourmand = 3).
- **Options « sur l'assiette »** (enrichi, panée, pots gourmands…) : comptées sur chaque plat du résident.
- **Textures et régimes** comptés **en plats** : un résident à 2 plats haché compte pour 2 hachés. Normal + Haché + Mixé = total. **(à confirmer)**
- **Activité** : les participants présents sont retirés de leur parc et comptés dans l'activité.
- **Salariés** : texture normale ; « sans porc » ajouté au régime sans porc. **Nettoyage sans viande** : régime sans viande. **Témoins** : texture normale, sans régime, ajoutés au total.
- **Total à produire** = parcs + activités + Sodexo + direction + nettoyage + témoins.
- **Texture non concernée** par un repas : le résident est compté dans la texture par défaut.

# 7. Je veux…

- **Noter une absence de 3 jours** : fiche du résident → « + Ajouter une absence » → dates et repas → Enregistrer. Les cases passent en rouge hachuré.
- **Un résident ne mange pas ce midi seulement** : page Semaine, cliquez sa case.
- **Organiser le Sport du jeudi** : Activités → charger le modèle « Sport » → cochez les participants → Enregistrer. Leur repas part sur le chariot Sport.
- **Ajouter un repas de Noël** : Services → ajouter un service « Certaines semaines » ; page Semaine → « + Ajouter un service à cette semaine » (jours réglables).
- **Ajouter un goûter chaque jour** : Services → type Repas ou Présence seule, « Toutes les semaines ».
- **Ajouter un nouveau régime** : Régimes → tableau « Régimes et allergies » → ajouter, puis l'attribuer dans la fiche.
- **Retrouver tous les « sans porc »** : Semaine → champ de recherche.
- **Envoyer ma semaine à un collègue** : Exporter → choisir la semaine → Télécharger → envoyer. Il utilise Importer.
- **Passer à la semaine suivante** : bas de la Semaine → Créer la semaine suivante.
- **Un résident part définitivement** : fiche → archiver (ou supprimer).

# 8. Problèmes courants

- **Mes données ont disparu.** Données du navigateur effacées, autre navigateur ou autre ordinateur. Importez votre dernier fichier exporté.
- **« Données illisibles » à l'accueil.** L'application les a gardées. « Télécharger les données illisibles », puis ouvrez un fichier exporté ou commencez une base.
- **Après une mise à jour.** Une copie de l'ancienne version est téléchargeable dans Options.
- **L'import est refusé.** Fichier d'une autre application, abîmé, ou d'une version plus récente de l'application.
- **Un service ne peut pas être supprimé.** Il est utilisé : archivez-le.
- **Les couleurs manquent à l'impression.** « Imprimer les arrière-plans ».
- **Une alerte jaune ne disparaît pas.** Cliquez « C'est voulu » ou « Ignorer », ou corrigez la saisie.
- **Une colonne manque dans la grille.** Régimes → « Toujours affiché », ou vérifiez « Services affichés ».
- **Rien ne s'imprime pour un repas.** Un repas à 0 plat n'est pas imprimé.
- **Navigateur.** Firefox, Chrome et Edge conviennent. Ouvrez l'application par double-clic sur `index.html`.

# 9. Glossaire
Parc · Chariot · Feuille cuisine · Texture · Régime · Option · Service · Activité · Modèle d'activité · Pots gourmands · Sans résidus · Enrichi · EQ · Témoins · Sodexo. Définitions reprises de `glossaire.md` (à compléter : **EQ**, **Témoins**, **Collectif**).
