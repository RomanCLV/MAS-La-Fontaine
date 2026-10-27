/* Ligne « Menu avec porc » de la page Semaine (onglets de parc, Hors parc, Recherche) : une case par créneau affiché,
   cochée = le menu contient du porc (défaut). Décochée = repas sans porc (semaine.menuSansPorc), ce qui allège
   les feuilles cuisine et chariot. Pas de case pour un service « présence seule » (petit déjeuner…).
   Valeur commune à toute la MAS ; annulable par Ctrl+Z (historique.js). */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h;

  var LIBELLE = 'Menu avec porc';
  var NOTE = 'décocher = menu sans porc';

  // Cellules de la ligne pour les créneaux vis ; bord(c) : classe du trait de début de jour ;
  // lieu : onglet de la saisie pour l'historique (id du parc, '@horsparc', ou null pour la recherche).
  function cellules(s, vis, bord, lieu) {
    return vis.map(function (c) {
      if (M.service(M.decoupeCreneau(c).service).presenceSeule) return h('div', { class: 'gc ' + bord(c) });
      var porc = M.menuAvecPorc(s, c);
      var titre = R.Calc.libelleCreneaux([c]) + ' : ' + (porc ? 'menu avec porc' : 'menu sans porc');
      return h('div', { class: 'gc ' + bord(c) + (porc ? '' : ' sans-porc') },
        h('button', { class: 'case-porc', role: 'checkbox', 'aria-checked': porc ? 'true' : 'false', title: titre, 'aria-label': titre,
          onclick: function () { basculer(s, c, lieu); } }, porc ? '✓' : ''));
    });
  }

  function basculer(s, c, lieu) {
    R.Historique.modifier(s, 'menu avec porc', lieu, [{
      lire: function () { return (s.menuSansPorc || {})[c]; },
      // undefined : avec porc (pas d'entrée) ; true : sans porc.
      ecrire: function (val) {
        s.menuSansPorc = s.menuSansPorc || {};
        if (val) s.menuSansPorc[c] = true; else delete s.menuSansPorc[c];
      },
      v: M.menuAvecPorc(s, c) ? true : undefined
    }]);
  }

  R.MenuPorc = { LIBELLE: LIBELLE, NOTE: NOTE, cellules: cellules };
})(window.Recueil = window.Recueil || {});
