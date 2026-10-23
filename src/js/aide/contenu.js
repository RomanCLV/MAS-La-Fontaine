/* Contenu de l'aide : fenêtres d'aide par page et présentation de démarrage (docs/aide.md).
   Données pures (aucun accès à l'écran) : lues par l'application et testées par tests.html.
   Dans les textes, **mot** = gras. `illu` = nom d'une maquette de Recueil.Illustrations. */
(function (R) {
  'use strict';

  // Sections du guide (identifiants des ancres de guide.html). Vérifiées par guide.html au chargement et par tests.html.
  var SECTIONS = ['demarrer', 'donnees', 'ecran', 'accueil', 'mise-en-route', 'semaine', 'residents', 'fiche-resident', 'parcs',
    'services', 'regimes', 'activites', 'importer', 'exporter', 'imprimer', 'options', 'feuilles', 'calculs', 'recettes',
    'problemes', 'glossaire'];

  // Une aide par type de page : quoi (à quoi sert la page), points (3 à 6), illustration, section du guide.
  var PAGES = {
    semaine: {
      nom: 'Semaine', illu: 'grille', guide: 'semaine',
      quoi: 'Saisir qui mange à quels repas pendant la semaine, et voir les nombres de plats à produire.',
      points: [
        'Un clic sur une case inverse sa valeur : **1** (vert) = présent, **0** (rouge) = absent. Glissez pour en changer plusieurs. **Ctrl+Z** annule une erreur.',
        'Les cases rouges hachurées viennent d’une **absence prévue** dans la fiche du résident.',
        'Une case **jaune** est une alerte : à vérifier, ou à classer avec « C’est voulu » / « Ignorer ».',
        'Les carrés en haut donnent le nombre de plats par repas pour le parc affiché.',
        'Sous la grille : les salariés du parc (cliquez une case, tapez le nombre, Entrée ; glissez pour en remplir plusieurs d’un coup). Sodexo, direction, nettoyage et plats témoins sont dans l’onglet **Hors parc**.',
        'Les boutons du haut : créer la semaine suivante, imprimer, supprimer cette semaine.'
      ]
    },
    residents: {
      nom: 'Résidents', illu: 'liste-tableau', guide: 'residents',
      quoi: 'La liste de tous les résidents, avec leur parc, leur texture et leurs régimes.',
      points: [
        '**Liste** : une ligne par résident ; au survol, éditer, archiver ou supprimer.',
        '**Tableau** : une colonne par texture, régime ou option ; cliquez une case pour l’attribuer, puis « Enregistrer ».',
        'Un résident **archivé** n’apparaît plus dans la semaine mais reste dans la liste.',
        'Les filtres (nom, parc, archivés) limitent l’affichage.'
      ]
    },
    resident: {
      nom: 'Fiche résident', illu: 'fiche', guide: 'fiche-resident',
      quoi: 'Tout ce qui concerne un résident.',
      points: [
        'Nom, prénom, parc et observation.',
        'Une **texture** (une seule), des **régimes et allergies** et des **options** (plusieurs).',
        '**Absences prévues** : « + Ajouter une absence », avec les dates et les repas concernés. Elles remplissent toutes seules les cases de la semaine.',
        'Rien n’est gardé avant « Enregistrer ».'
      ]
    },
    parcs: {
      nom: 'Parcs', illu: 'parcs', guide: 'parcs',
      quoi: 'La liste des parcs (zones de la MAS), avec leur couleur.',
      points: [
        'Un parc = un chariot à l’impression.',
        'La couleur sert partout : onglets de la semaine, feuilles imprimées.',
        'L’ordre des parcs est celui des onglets de la semaine.',
        'Base vide : le bouton « Ajouter les parcs MAS La Fontaine » ajoute les 7 parcs de la MAS.'
      ]
    },
    services: {
      nom: 'Services', illu: 'services', guide: 'services',
      quoi: 'Les moments de repas de la journée.',
      points: [
        'Petit déjeuner, midi et soir existent toujours.',
        'Vous pouvez en ajouter (goûter, repas de fête…) : **Repas** (avec textures et régimes) ou **Présence seule** (on compte seulement les présents).',
        '**Toutes les semaines** : présent chaque semaine. **Certaines semaines** : vous l’ajoutez à une semaine précise depuis la page Semaine.',
        'Un service déjà utilisé ne peut pas être supprimé : archivez-le.'
      ]
    },
    regimes: {
      nom: 'Régimes', illu: 'trois-listes', guide: 'regimes',
      quoi: 'Trois listes à régler : textures, régimes et allergies, options.',
      points: [
        '**Textures** : la consistance du plat (normal, haché, mixé…). Une seule par résident.',
        '**Régimes et allergies** : les contraintes alimentaires (sans porc, sans sel, allergies…).',
        '**Options** : ce qui s’ajoute (double plat, enrichi, pots gourmands…). « +1 plat chaud » ajoute un plat ; sinon l’option est comptée « sur l’assiette ».',
        'Pour chacun : les repas concernés, et « Toujours affiché » (colonne toujours dans la grille, ou seulement si un résident du parc en a besoin).'
      ]
    },
    activites: {
      nom: 'Activités', illu: 'activite', guide: 'activites',
      quoi: 'Les sorties et activités de la semaine.',
      points: [
        'Une activité a un jour, un repas et des participants (de plusieurs parcs).',
        'Les participants **présents** sont retirés de leur parc et comptés dans l’activité : leur repas part sur un chariot à part.',
        'Un résident ne peut être que dans une activité par repas.',
        'Les **modèles** (ex. Sport jeudi midi) se réutilisent d’une semaine à l’autre.'
      ]
    },
    import: {
      nom: 'Importer', illu: 'fichier', guide: 'importer',
      quoi: 'Ouvrir un fichier reçu (ou le vôtre).',
      points: [
        'Choisissez un fichier .json exporté par l’application.',
        'Il **remplace** votre copie de travail : exportez d’abord si vous voulez la garder.',
        '« Repartir de zéro » vide tout et commence une base neuve.'
      ]
    },
    export: {
      nom: 'Exporter', illu: 'fichier', guide: 'exporter',
      quoi: 'Sauvegarder votre travail ou l’envoyer.',
      points: [
        'Choisissez la semaine envoyée : elle donne son nom au fichier.',
        '« Télécharger le fichier » : il va dans votre dossier Téléchargements.',
        'Envoyez-le ensuite par clé USB, dossier partagé ou mail. L’autre personne le charge avec « Importer ».'
      ]
    },
    imprimer: {
      nom: 'Imprimer', illu: 'feuille', guide: 'imprimer',
      quoi: 'Préparer et lancer l’impression des feuilles.',
      points: [
        'Choisissez la semaine, le type de feuille (**cuisine** et/ou **chariots**), les jours et les services.',
        'L’aperçu montre ce qui sera imprimé, une feuille par jour et par service.',
        'Format A4 paysage. Si les couleurs manquent : cochez « Imprimer les arrière-plans » dans la fenêtre d’impression.',
        'Un repas sans plat n’est pas imprimé.'
      ]
    },
    options: {
      nom: 'Options', illu: 'options', guide: 'options',
      quoi: 'Les réglages de l’application.',
      points: [
        '**Fermer la page après avoir enregistré** : choisissez les pages qui se ferment toutes seules après « Enregistrer ».',
        '**Données en cache** : ce que l’application garde dans ce navigateur, et « Vider le cache local » (efface tout : exportez d’abord).',
        'La version de l’application et le lien vers le guide.'
      ]
    }
  };

  // Présentation de démarrage. texte : chaîne, ou { vide, mas } selon la base créée. aller : bouton « Y aller ».
  var SLIDES = [
    { titre: 'Bienvenue', illu: 'etapes',
      texte: 'Vous saisissez les présences, l’application compte, vous imprimez les feuilles.' },
    { titre: 'Vos données restent sur cet ordinateur', illu: 'export-barre',
      texte: 'Tout ce que vous saisissez est enregistré tout seul dans ce navigateur.\nMais pour **sauvegarder** ou **envoyer** votre travail, il faut l’**exporter** : bouton « Exporter » en haut à droite. Pensez-y régulièrement.' },
    { titre: 'Les parcs', illu: 'parcs',
      texte: { vide: 'Un parc est une zone de la MAS, avec son chariot.\nCréez les vôtres dans la page « Parcs ».',
        mas: 'Les 7 parcs de la MAS sont déjà là.\nVous pouvez les modifier dans la page « Parcs ».',
        revue: 'Un parc est une zone de la MAS, avec son chariot.\nVous les gérez dans la page « Parcs ».' },
      aller: { page: 'parcs', texte: 'Aller à la page Parcs' } },
    { titre: 'Les résidents', illu: 'fiche',
      texte: 'Chaque résident a un parc, une texture (normal, haché, mixé…), éventuellement des régimes, des options et des absences prévues.\nAjoutez-les un par un dans « Résidents ».',
      aller: { page: 'residents', texte: 'Aller à la page Résidents' } },
    { titre: 'Textures, régimes et options', illu: 'trois-listes',
      texte: 'La liste est déjà remplie (haché, mixé, sans porc, sans sel, double plat…). Vous pouvez la modifier, en ajouter ou en retirer.\nVous choisissez aussi pour quels repas chacun compte (petit déjeuner, midi, soir).',
      aller: { page: 'regimes', texte: 'Aller à la page Régimes' } },
    { titre: 'Services et activités (facultatif)', illu: 'services-activite',
      texte: '**Services** : petit déjeuner, midi et soir existent déjà. Vous pouvez en ajouter (goûter, repas de Noël…).\n**Activités** : une sortie qui regroupe des résidents de plusieurs parcs (Sport le jeudi midi…). Leur repas part sur un chariot à part.',
      aller: { page: 'services', texte: 'Aller à la page Services' }, aller2: { page: 'activites', texte: 'Aller à la page Activités' } },
    { titre: 'La semaine', illu: 'grille',
      texte: 'C’est la page principale. Un clic sur une case inverse la présence ; vous pouvez aussi glisser sur plusieurs cases.\nLes nombres de plats se calculent tout seuls. Quand c’est prêt : « Imprimer cette semaine ».\nBesoin d’aide ? Le bouton « ? Aide » en haut est toujours là.',
      fin: true }
  ];

  R.Aide = { SECTIONS: SECTIONS, PAGES: PAGES, SLIDES: SLIDES, lienGuide: function (section) { return 'guide.html' + (section ? '#' + section : ''); } };
})(window.Recueil = window.Recueil || {});
