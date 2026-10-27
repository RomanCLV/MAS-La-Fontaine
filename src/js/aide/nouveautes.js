/* Nouveautés de chaque version : fenêtre d'annonce après une mise à jour (une fois par navigateur), historique
   (menu « ? Aide », Options, guide). Données pures, lues aussi par guide.html et tests.html. Voir docs/code/aide.md.

   Ajouter une version (règle dans docs/aide.md) :
   - en tête de VERSIONS ; la version n'est montrée que quand Modele.VERSION_APP l'atteint (on peut l'écrire avant) ;
   - annoncer: true  → la fenêtre s'ouvre une fois chez chacun (changement visible : page déplacée, bouton renommé…) ;
     annoncer: false → seulement dans l'historique (corrections) ;
   - chaque point : type (clé de TYPES), texte (**gras**, \n), et au choix page (type d'onglet) + onglet ('horsparc')
     pour un bouton « Voir », guide (ancre de guide.html) pour un lien « En savoir plus ». */
(function (R) {
  'use strict';

  var TYPES = { nouveau: 'Nouveau', deplace: 'Déplacé', modifie: 'Modifié', retire: 'Retiré', corrige: 'Corrigé' };

  // La plus récente d'abord.
  var VERSIONS = [
    {
      version: '1.2', date: '2026-10-27', annoncer: true,
      points: [
        { type: 'nouveau', page: 'semaine', guide: 'porc',
          texte: '**Menu avec porc** : nouvelle ligne en haut de la page Semaine, une case par repas (cochée par défaut). ' +
            'Décochez un repas dont le menu ne contient pas de porc : les feuilles cuisine et chariot n’affichent plus le détail « sans porc » ' +
            '(les étiquettes des résidents gardent la mention).' },
        { type: 'modifie', guide: 'semaine',
          texte: '**Créer la semaine suivante** reprend aussi les repas sans porc, et un message confirme la semaine créée.' }
      ]
    },
    {
      version: '1.1', date: '2026-10-24', annoncer: true,
      points: [
        { type: 'deplace', page: 'semaine', onglet: 'horsparc', guide: 'horsparc',
          texte: '**Sodexo, Direction, Nettoyage, Nettoyage sans viande et Plats témoins** ne sont plus sous la grille de chaque parc : ' +
            'ils sont dans l’onglet **Hors parc**, à droite des onglets de parc (page Semaine), avec le « Total hors parcs ».' },
        { type: 'nouveau', guide: 'nombres',
          texte: '**Plusieurs cases de nombres à la fois** (salariés, Hors parc) : glissez pour les sélectionner, tapez un nombre puis Entrée ' +
            'pour le mettre dans toutes. Maj + clic ou Maj + flèches agrandissent la sélection.' },
        { type: 'nouveau', guide: 'nombres',
          texte: '**Copier, couper, coller** des cases de nombres : Ctrl + C, Ctrl + X, Ctrl + V, aussi d’un parc à un autre.' },
        { type: 'nouveau', guide: 'semaine',
          texte: '**Annuler une erreur** sur la page Semaine : Ctrl + Z annule la dernière saisie (présences ou nombres), Ctrl + Y la rétablit.' }
      ]
    },
    {
      version: '1.0', date: '2026-10-23', annoncer: false,
      points: [
        { type: 'nouveau', texte: 'Première version : semaines, résidents, parcs, services, régimes, activités, feuilles cuisine et chariot, aide.' }
      ]
    }
  ];

  // Compare deux numéros de version ('1.0.1' < '1.1' < '1.10') : négatif, 0 ou positif.
  function comparer(a, b) {
    var x = String(a).split('.'), y = String(b).split('.');
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
      var d = (+x[i] || 0) - (+y[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  // Versions déjà sorties (≤ version de l'application), la plus récente d'abord.
  function publiees(actuelle) {
    return VERSIONS.filter(function (v) { return comparer(v.version, actuelle) <= 0; });
  }

  // Versions à annoncer à quelqu'un qui a vu la version « vue » : sorties depuis, avec annoncer: true.
  function aAnnoncer(vue, actuelle) {
    return publiees(actuelle).filter(function (v) { return v.annoncer && comparer(v.version, vue) > 0; });
  }

  // '2026-10-24' → '24 octobre 2026'.
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function dateLongue(iso) { return (+iso.slice(8, 10)) + ' ' + MOIS[+iso.slice(5, 7) - 1] + ' ' + iso.slice(0, 4); }

  R.Nouveautes = { TYPES: TYPES, VERSIONS: VERSIONS, comparer: comparer, publiees: publiees, aAnnoncer: aAnnoncer, dateLongue: dateLongue };
})(window.Recueil = window.Recueil || {});
