/* Onglet « Hors parc » de la page Semaine : nombres de plats qui ne dépendent d'aucun parc
   (Sodexo, Direction, Nettoyage, Plats témoins), sortis des onglets de parc pour les alléger.
   Mêmes données (semaine.sodexo, direction, nettoyage…) et même calcul qu'avant. */
(function (R) {
  'use strict';
  var M = R.Modele, C = R.Calc, h = R.h, O = R.Outils, App = R.App;

  // Colonnes de la feuille cuisine comptées « hors parcs ».
  var HORS_PARCS = ['sodexo', 'direction', 'autres', 'temoins'];
  var FOND = '#e4edf7';

  // d : données ; s : semaine ; vis : créneaux affichés (filtre « Services affichés » de la page Semaine).
  function grille(d, s, vis) {
    // Trait marqué au début de chaque jour : sur son premier créneau affiché.
    function bord(c) {
      var k = vis.indexOf(c);
      return k === 0 || M.decoupeCreneau(vis[k - 1]).jour !== M.decoupeCreneau(c).jour ? 'jour' : '';
    }
    var gabarit = 'grid-template-columns:230px 170px repeat(' + vis.length + ',32px)';

    // Total hors parcs par créneau affiché ; mis à jour sur place quand on saisit un nombre (focus gardé).
    var total, majs = [];
    function calculer() {
      total = vis.map(function (c) {
        return C.feuilleJour(d, s, c).colonnes.reduce(function (n, col) {
          return n + (HORS_PARCS.indexOf(col.type) >= 0 ? col.c.total : 0);
        }, 0);
      });
    }
    calculer();
    function majTotal() { calculer(); majs.forEach(function (f) { f(); }); }

    var entete = h('div', { class: 'g g-entete', style: gabarit },
      h('div', { class: 'gh gauche colle0' }, 'HORS PARC'),
      h('div', { class: 'gh gauche' }, 'NOTE'),
      vis.map(function (c) {
        var sc = M.decoupeCreneau(c);
        return h('div', { class: 'gh ' + bord(c) }, h('span', { class: 'v' },
          M.jour(sc.jour).court.replace('.', '').toUpperCase() + ' ' + (+M.dateDuJour(s, sc.jour).slice(8)) + ' ' + M.service(sc.service).court));
      }));

    // lire(c) / ecrire(c, n) : accès au champ de la semaine.
    function ligneNombres(libelle, note, lire, ecrire) {
      return h('div', { class: 'g g-sal', style: gabarit + ';background:' + FOND },
        h('div', { class: 'gc gauche gras colle0 etiquette', style: 'background:' + FOND, title: libelle }, libelle),
        h('div', { class: 'gnote' }, note),
        vis.map(function (c) {
          var v = lire(c);
          return h('div', { class: 'gc ' + bord(c) }, h('input', {
            class: 'nb', type: 'number', min: '0', step: '1', inputmode: 'numeric', value: v ? String(v) : '',
            'aria-label': libelle + ' · ' + C.libelleCreneaux([c]),
            onchange: function (e) {
              var n = Math.max(0, Math.floor(+e.target.value || 0));
              e.target.value = n ? String(n) : '';
              App.modifier(function () { ecrire(c, n); }, { sansRendu: true });
              majTotal();
            }
          }));
        }));
    }
    function simple(table) {
      return {
        lire: function (c) { return s[table][c] || 0; },
        ecrire: function (c, n) { if (n) s[table][c] = n; else delete s[table][c]; }
      };
    }
    var di = simple('direction'), ne = simple('nettoyage'), nv = simple('nettoyageSansViande'), te = simple('temoins');
    var libTotal = 'Total hors parcs (Sodexo, Direction, Nettoyage, Nettoyage sans viande, Plats témoins)';
    var ligneTotal = h('div', { class: 'g g-carres total-hors-parcs', style: gabarit },
      h('div', { class: 'gc gauche gras colle0 etiquette', title: libTotal }, 'Total hors parcs'),
      h('div', { class: 'gnote' }, 'Sodexo + Direction + Nettoyage + Témoins'),
      vis.map(function (c, k) {
        var carre = h('span');
        function maj() {
          var n = total[k], t = libTotal + ' · ' + C.libelleCreneaux([c]) + ' : ' + O.pluriel(n, 'plat');
          carre.className = 'carre' + (n ? '' : ' vide');
          carre.title = t;
          carre.setAttribute('aria-label', t);
          carre.textContent = n ? String(n) : '';
        }
        maj();
        majs.push(maj);
        return h('div', { class: 'gc ' + bord(c) }, carre);
      }));

    return h('div', { class: 'carte-grille', style: 'border-top-color:' + FOND },
      h('div', { class: 'petit' }, 'Plats à produire pour des personnes qui ne sont dans aucun parc : ils s’ajoutent à la colonne correspondante de la feuille cuisine.'),
      h('div', { class: 'defil', 'data-defil': 'grille' },
        h('div', { class: 'grille' },
          entete,
          ligneNombres('Salariés SODEXO', 'tous parcs', function (c) { return (s.sodexo[c] || {}).standard || 0; },
            function (c, n) { var v = s.sodexo[c] = s.sodexo[c] || { standard: 0, sansPorc: 0 }; v.standard = n; }),
          ligneNombres('Direction', 'tous parcs', di.lire, di.ecrire),
          ligneNombres('Nettoyage', 'tous parcs', ne.lire, ne.ecrire),
          ligneNombres('Nettoyage sans viande', 'tous parcs', nv.lire, nv.ecrire),
          ligneNombres('Plats témoins', 'à produire en plus', te.lire, te.ecrire),
          ligneTotal)));
  }

  R.HorsParc = { grille: grille };
})(window.Recueil = window.Recueil || {});
