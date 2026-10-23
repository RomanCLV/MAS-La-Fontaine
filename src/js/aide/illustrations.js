/* Petites maquettes de l'aide (présentation, fenêtres d'aide, guide) dessinées avec les styles de l'application,
   et mise en forme des textes (**gras**, retours à la ligne). Lues aussi par guide.html : ne dépendent pas de Recueil.App. */
(function (R) {
  'use strict';
  var h = R.h;

  // Texte d'aide → nœuds : « **mot** » en gras, « \n » en retour à la ligne. Jamais de HTML interprété.
  function texte(t) {
    return String(t).split('\n').map(function (ligne, i) {
      return [i ? h('br') : null, ligne.split('**').map(function (p, k) { return k % 2 ? h('strong', null, p) : p; })];
    });
  }

  // Case de présence en miniature : '' = vert, ou absent / abs-fiche / alerte-case / act.
  function ex(classe, t, couleur) {
    return h('span', { class: 'pc-ex' + (classe ? ' ' + classe : ''), style: couleur ? '--act:' + couleur : '' }, t);
  }
  function ligne(nom, cases, observation) {
    return h('div', { class: 'illu-ligne' }, h('span', { class: 'illu-nom' }, nom), cases, observation ? h('span', { class: 'illu-obs' }, observation) : null);
  }
  function legende(classe, t) { return h('span', { class: 'illu-leg' }, ex(classe, classe === 'absent' || classe === 'abs-fiche' ? '0' : '1'), t); }
  function pastille(couleur, nom) {
    return h('span', { class: 'etiquette-parc' }, h('span', { class: 'pastille-couleur', style: 'background:' + couleur }), ' ' + nom);
  }
  function carre(n, fond) { return h('span', { class: 'carre', style: fond ? 'background:' + fond : '' }, n); }
  function chip(nom, on) { return h('span', { class: 'choix' + (on ? ' on' : '') }, nom); }
  function boite(titre, contenu, classe) {
    return h('div', { class: 'illu-boite' + (classe ? ' ' + classe : '') }, titre ? h('div', { class: 'illu-titre' }, titre) : null, contenu);
  }
  function fleche(t) { return h('span', { class: 'illu-fleche' }, t || '→'); }
  function feuilleMini() {
    return h('div', { class: 'illu-feuille' },
      h('div', { class: 'illu-f-haut' }, h('b', null, 'TOTAL À PRODUIRE'), h('span', { class: 'carre' }, '128')),
      h('div', { class: 'illu-f-ligne' }), h('div', { class: 'illu-f-ligne' }),
      h('div', { class: 'illu-f-ligne', style: 'background:#f3c98b' }), h('div', { class: 'illu-f-ligne', style: 'background:#b9d3f0' }),
      h('div', { class: 'illu-f-ligne' }));
  }
  function grilleMini() {
    return h('div', { class: 'illu-grille' },
      h('div', { class: 'illu-ligne illu-entete' }, h('span', { class: 'illu-nom' }, ''),
        h('span', { class: 'illu-jour' }, 'Lun. midi'), h('span', { class: 'illu-jour' }, 'Lun. soir'), h('span', { class: 'illu-jour' }, 'Mar. midi'), h('span', { class: 'illu-jour' }, 'Mar. soir')),
      h('div', { class: 'illu-ligne' }, h('span', { class: 'illu-nom gras' }, 'Plats Amboise'), carre(24), carre(25), carre(23), carre(25)),
      ligne('Martin Léa', [ex('', '1'), ex('', '1'), ex('', '1'), ex('', '1')]),
      ligne('Durand Paul', [ex('', '2'), ex('', '2'), ex('absent', '0'), ex('', '2')]),
      ligne('Petit Anne', [ex('abs-fiche', '0'), ex('abs-fiche', '0'), ex('abs-fiche', '0'), ex('', '1')]),
      ligne('Bernard Jean', [ex('', '1'), ex('alerte-case', '1'), ex('', '1'), ex('act', '1', '#2d6cb5')]),
      h('div', { class: 'illu-legende' }, legende('', 'Présent'), legende('absent', 'Absent'), legende('abs-fiche', 'Absence prévue'),
        legende('alerte-case', 'Alerte'), h('span', { class: 'illu-leg' }, ex('act', '1', '#2d6cb5'), 'Activité')));
  }

  var COULEURS_PARCS = [['#e8a0a0', 'Amboise'], ['#a8c8e8', 'Bonaguil'], ['#b9dcae', 'Collioure'], ['#f0d58a', 'Lude']];

  var MAQUETTES = {
    etapes: function () {
      return h('div', { class: 'illu-rangee' },
        boite('1 · Saisir', h('div', { class: 'illu-mini' }, [0, 1, 2].map(function () { return h('div', null, ex('', '1'), ex('', '1'), ex('absent', '0')); }))),
        fleche(),
        boite('2 · Compter', h('div', { class: 'illu-mini' }, carre(128), h('div', { class: 'petit' }, 'plats à produire'))),
        fleche(),
        boite('3 · Imprimer', feuilleMini()));
    },
    'export-barre': function () {
      return h('div', { class: 'barre illu-barre' },
        h('div', { class: 'barre-titre' }, 'Recueil Alimentation'),
        h('span', { class: 'etat etat-attention' }, 'Modifications non exportées'),
        h('span', { class: 'btn-barre' }, 'Importer'),
        h('span', { class: 'btn-barre illu-entoure' }, 'Exporter'));
    },
    parcs: function () {
      return h('div', { class: 'illu-rangee illu-parcs' }, COULEURS_PARCS.map(function (p) { return pastille(p[0], p[1]); }), h('span', { class: 'petit' }, '…'));
    },
    fiche: function () {
      return boite('', [
        h('div', { class: 'illu-ligne' }, h('b', null, 'Martin Léa'), pastille('#a8c8e8', 'Bonaguil')),
        h('div', { class: 'illu-groupe' }, h('span', { class: 'illu-etq' }, 'Texture'), chip('Normal', false), chip('Haché', true), chip('Mixé', false)),
        h('div', { class: 'illu-groupe' }, h('span', { class: 'illu-etq' }, 'Régimes'), chip('Sans porc', true), chip('Sans sel', false)),
        h('div', { class: 'illu-groupe' }, h('span', { class: 'illu-etq' }, 'Options'), chip('Double plat', true), chip('Enrichi', false)),
        h('div', { class: 'illu-groupe' }, h('span', { class: 'illu-etq' }, 'Absences'), h('span', { class: 'pilule' }, 'du 20/10 au 22/10 · midi, soir'))
      ], 'illu-fiche');
    },
    'trois-listes': function () {
      function col(titre, elements) {
        return boite(titre, elements.map(function (e) {
          return h('div', { class: 'illu-ref' }, h('span', { class: 'pastille-couleur', style: 'background:' + e[1] }), e[0]);
        }));
      }
      return h('div', { class: 'illu-rangee' },
        col('Textures', [['Normal', '#e0e0e0'], ['Haché', '#f3c98b'], ['Mixé', '#d9a0c8']]),
        col('Régimes et allergies', [['Sans porc', '#b9dcae'], ['Sans sel', '#a8c8e8'], ['Sans gluten', '#f0d58a']]),
        col('Options', [['Double plat', '#a8c8e8'], ['Enrichi', '#f0d58a'], ['Pots gourmands', '#e8a0a0']]));
    },
    services: function () {
      function s(nom, nouveau) { return h('div', { class: 'illu-service' + (nouveau ? ' nouveau' : '') }, nom); }
      return h('div', { class: 'illu-rangee' }, s('Petit déjeuner'), s('Midi'), s('Goûter', true), s('Soir'));
    },
    activite: function () {
      return h('div', { class: 'illu-rangee' },
        boite('Sport · jeudi midi', h('div', null, ex('act', '1', '#2d6cb5'), ex('act', '1', '#2d6cb5'), ex('act', '1', '#2d6cb5'))),
        h('div', { class: 'petit' }, 'Leur repas quitte le parc et part sur le chariot Sport.'));
    },
    'services-activite': function () {
      return h('div', { class: 'illu-colonne' }, MAQUETTES.services(), MAQUETTES.activite());
    },
    grille: grilleMini,
    'liste-tableau': function () {
      return h('div', { class: 'illu-colonne' },
        h('div', { class: 'segments' }, h('span', { class: 'segment actif' }, 'Liste'), h('span', { class: 'segment' }, 'Tableau')),
        h('div', { class: 'illu-ligne' }, h('span', { class: 'illu-nom' }, 'Martin Léa'), pastille('#a8c8e8', 'Bonaguil'), h('span', { class: 'pilule' }, 'Haché')),
        h('div', { class: 'illu-ligne' }, h('span', { class: 'illu-nom' }, 'Durand Paul'), pastille('#e8a0a0', 'Amboise'), h('span', { class: 'pilule' }, 'Sans porc')));
    },
    fichier: function () {
      return h('div', { class: 'illu-rangee' },
        boite('Copie de travail', h('div', { class: 'petit' }, 'dans ce navigateur')),
        h('span', { class: 'illu-fleches' }, h('span', null, 'Exporter →'), h('span', null, '← Importer')),
        boite('Fichier', h('div', { class: 'petit' }, 'semaine-43.json')));
    },
    feuille: function () { return h('div', { class: 'illu-rangee' }, feuilleMini(), feuilleMini()); },
    options: function () {
      function c(t, on) { return h('div', { class: 'illu-ref' }, h('span', { class: 'illu-case' + (on ? ' on' : '') }, on ? '✓' : ''), t); }
      return boite('Fermer la page après avoir enregistré', [c('Fiche résident', true), c('Parcs', false), c('Activités', true)]);
    }
  };

  R.Illustrations = {
    texte: texte,
    // Maquette par nom, ou null si le nom est inconnu. Décorative : cachée aux lecteurs d'écran.
    faire: function (nom) {
      var f = MAQUETTES[nom];
      return f ? h('div', { class: 'illu', 'aria-hidden': 'true' }, f()) : null;
    },
    NOMS: Object.keys(MAQUETTES)
  };
})(window.Recueil = window.Recueil || {});
