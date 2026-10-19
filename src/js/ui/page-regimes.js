/* Page Régimes : textures, régimes et options (nom, abrégé, nature, effet, couleur, ordre). */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h, O = R.Outils, App = R.App;
  var NATURES = [{ v: 'texture', nom: 'Texture' }, { v: 'regime', nom: 'Régime' }, { v: 'option', nom: 'Option' }];
  var EFFETS = [
    { v: '', nom: 'Assiette individuelle (compté sur les plats)' },
    { v: 'plat', nom: '+1 plat chaud (double plat, EQ 2)' },
    { v: 'legumes', nom: 'Portion comptée à part' },
    { v: 'information', nom: 'Information seulement (hors feuille chef)' }
  ];
  var PROTEGES = [M.TEXTURE_DEFAUT, M.REGIME_SANS_PORC, M.REGIME_NETTOYAGE];

  function effet(g) {
    if (g.nature === 'texture') return g.id === M.TEXTURE_DEFAUT ? 'Texture par défaut' : 'Texture';
    if (g.nature === 'regime') {
      var t = 'Compté sur tous les convives';
      if (g.id === M.REGIME_SANS_PORC) t += ' ; inclut les salariés « sans porc »';
      if (g.id === M.REGIME_NETTOYAGE) t += ' ; inclut l’équipe nettoyage';
      return t;
    }
    return (EFFETS.filter(function (e) { return e.v === (g.affecte || ''); })[0] || EFFETS[0]).nom;
  }

  function utilisations(d, g) {
    return d.residents.filter(function (r) {
      return r.textureId === g.id || r.regimeIds.indexOf(g.id) >= 0 || r.optionIds.indexOf(g.id) >= 0;
    }).length;
  }

  function valeurEdition(ed) { return [ed.nom, ed.abrege, ed.couleur, ed.nature, ed.affecte].join('|'); }
  function edition(id, nom, abrege, couleur, nature, affecte) {
    var ed = { id: id, nom: nom, abrege: abrege, couleur: couleur, nature: nature, affecte: affecte, erreur: '' };
    ed.init = valeurEdition(ed);
    return ed;
  }

  R.Pages.regimes = {
    titre: function () { return 'Régimes'; },
    modifie: function () { var ed = App.etat.regimeEdit; return !!ed && valeurEdition(ed) !== ed.init; },
    abandonner: function () { App.etat.regimeEdit = null; },
    rendu: function () {
      var d = App.donnees, liste = d.referentiels.regimes;
      var ed = App.etat.regimeEdit || null;

      function enregistrer() {
        if (!ed.nom.trim()) { ed.erreur = 'Le nom est obligatoire.'; App.rendre(); return; }
        App.modifier(function () {
          var g;
          if (ed.id) {
            g = liste.filter(function (x) { return x.id === ed.id; })[0];
            // Passage régime ↔ option : on déplace l'identifiant chez les résidents.
            if (g.nature !== ed.nature) {
              d.residents.forEach(function (r) {
                var de = g.nature === 'regime' ? 'regimeIds' : 'optionIds', vers = ed.nature === 'regime' ? 'regimeIds' : 'optionIds';
                if (r[de].indexOf(g.id) >= 0) { r[de] = r[de].filter(function (x) { return x !== g.id; }); r[vers].push(g.id); }
              });
            }
          } else {
            g = { id: R.Referentiel.idLibre(R.Referentiel.slug(ed.nom), liste.map(function (x) { return x.id; })) };
            liste.push(g);
          }
          g.nom = ed.nom.trim(); g.abrege = ed.abrege.trim(); g.couleur = ed.couleur; g.nature = ed.nature;
          if (g.nature === 'option') g.affecte = ed.affecte; else delete g.affecte;
          App.etat.regimeEdit = null;
        });
      }
      function supprimer(g) {
        if (PROTEGES.indexOf(g.id) >= 0) { window.alert('« ' + g.nom + ' » est utilisé par les calculs : il peut être renommé mais pas supprimé.'); return; }
        var n = utilisations(d, g);
        if (g.nature === 'texture' && n) { window.alert('Impossible : ' + O.pluriel(n, 'résident a', 'résidents ont') + ' cette texture. Changez-la dans leur fiche d’abord.'); return; }
        if (!window.confirm('Supprimer « ' + g.nom + ' » ?' + (n ? '\nIl sera retiré de ' + O.pluriel(n, 'résident') + '.' : ''))) return;
        App.modifier(function () {
          d.referentiels.regimes = liste.filter(function (x) { return x.id !== g.id; });
          d.residents.forEach(function (r) {
            r.regimeIds = r.regimeIds.filter(function (x) { return x !== g.id; });
            r.optionIds = r.optionIds.filter(function (x) { return x !== g.id; });
          });
          App.etat.regimeEdit = null;
        });
      }

      var gabarit = 'grid-template-columns:28px minmax(0,1.4fr) minmax(0,1fr) 110px minmax(0,1.8fr) 260px';
      function formulaire() {
        var texture = ed.id && ed.nature === 'texture';
        return h('div', { class: 'ligne-reg edition', style: gabarit },
          h('input', { type: 'color', value: ed.couleur, 'aria-label': 'Couleur', oninput: function (e) { ed.couleur = e.target.value; App.signalerModif(); } }),
          h('input', { value: ed.nom, 'aria-label': 'Nom', placeholder: 'Nom', oninput: function (e) { ed.nom = e.target.value; App.signalerModif(); } }),
          h('input', { value: ed.abrege, 'aria-label': 'Abrégé pour la grille', placeholder: 'Abrégé (grille)', oninput: function (e) { ed.abrege = e.target.value; App.signalerModif(); } }),
          h('select', { 'aria-label': 'Nature', disabled: texture, onchange: function (e) { ed.nature = e.target.value; App.rendre(); } },
            NATURES.filter(function (n) { return texture || n.v !== 'texture' || !ed.id; }).map(function (n) {
              return h('option', { value: n.v, selected: n.v === ed.nature }, n.nom);
            })),
          ed.nature === 'option'
            ? h('select', { 'aria-label': 'Effet sur la production', onchange: function (e) { ed.affecte = e.target.value; App.signalerModif(); } },
              EFFETS.map(function (x) { return h('option', { value: x.v, selected: x.v === ed.affecte }, x.nom); }))
            : h('span', { class: 'petit' }, effet({ id: ed.id, nature: ed.nature })),
          h('span', { class: 'actions-visibles' },
            h('button', { class: 'btn btn-principal', onclick: enregistrer }, 'Enregistrer'),
            h('button', { class: 'btn', onclick: function () { App.etat.regimeEdit = null; App.rendre(); } }, 'Annuler'),
            ed.erreur ? h('span', { class: 'erreur' }, ed.erreur) : null));
      }

      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' },
          h('div', { class: 'titre-ligne' }, h('h1', null, 'Régimes, textures et options ', h('span', { class: 'pilule' }, liste.length)), App.indicateur())),
        h('div', { class: 'carte' },
          h('div', { class: 'ligne-reg entete', style: gabarit }, h('span'), h('span', null, 'Nom'), h('span', null, 'Abrégé (grille)'),
            h('span', null, 'Nature'), h('span', null, 'Effet sur la production'), h('span')),
          liste.map(function (g, i) {
            if (ed && ed.id === g.id) return formulaire();
            return h('div', { class: 'ligne-reg', style: gabarit },
              h('div', { class: 'carre petit-carre', style: 'background:' + g.couleur }),
              h('span', { class: 'gras' }, g.nom),
              h('span', { class: 'petit' }, g.abrege),
              h('span', null, h('span', { class: 'pilule' }, (NATURES.filter(function (n) { return n.v === g.nature; })[0] || {}).nom)),
              h('span', { class: 'petit' }, effet(g)),
              h('span', { class: 'actions-visibles' },
                h('button', { class: 'btn btn-icone', 'aria-label': 'Monter ' + g.nom, disabled: i === 0,
                  onclick: function () { App.modifier(function () { R.Referentiel.deplacer(liste, i, -1); }); } }, '↑'),
                h('button', { class: 'btn btn-icone', 'aria-label': 'Descendre ' + g.nom, disabled: i === liste.length - 1,
                  onclick: function () { App.modifier(function () { R.Referentiel.deplacer(liste, i, 1); }); } }, '↓'),
                h('button', { class: 'btn', onclick: function () {
                  if (!App.abandonner()) return;
                  App.etat.regimeEdit = edition(g.id, g.nom, g.abrege || '', g.couleur, g.nature, g.affecte || '');
                  App.rendre();
                } }, 'Éditer'),
                h('button', { class: 'btn btn-danger', onclick: function () { supprimer(g); } }, 'Supprimer')));
          }),
          ed && !ed.id ? formulaire() : h('button', { class: 'btn', style: 'align-self:flex-start;margin-top:6px', onclick: function () {
            if (!App.abandonner()) return;
            App.etat.regimeEdit = edition(null, '', '', '#dddddd', 'regime', '');
            App.rendre();
          } }, '+ Ajouter un régime ou une option')));
    }
  };
})(window.Recueil = window.Recueil || {});
