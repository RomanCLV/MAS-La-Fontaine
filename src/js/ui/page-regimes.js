/* Page Régimes : trois tableaux (textures, régimes, options) ; nom, abrégé, services concernés, effet, couleur, ordre. */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h, O = R.Outils, App = R.App;
  var TABLES = [
    { nature: 'texture', titre: 'Textures', ajout: '+ Ajouter une texture' },
    { nature: 'regime', titre: 'Régimes & Allergies', ajout: '+ Ajouter un régime' },
    { nature: 'option', titre: 'Options', ajout: '+ Ajouter une option' }
  ];
  var NATURES = [{ v: 'regime', nom: 'Régime' }, { v: 'option', nom: 'Option' }]; // passage régime ↔ option
  var EFFETS = [
    { v: '', nom: 'Assiette individuelle (compté sur les plats)' },
    { v: 'plat', nom: '+1 plat chaud (double plat, EQ 2)' },
    { v: 'legumes', nom: 'Portion comptée à part' },
    { v: 'information', nom: 'Information : quantité par zone (hors production)' }
  ];
  var PROTEGES = [M.TEXTURE_DEFAUT, M.REGIME_SANS_PORC, M.REGIME_NETTOYAGE];

  function effet(g) {
    if (g.nature === 'texture') return g.id === M.TEXTURE_DEFAUT ? 'Texture par défaut' : 'Texture';
    if (g.nature === 'regime') {
      var t = 'Compté sur tous les convives';
      if (g.id === M.REGIME_SANS_PORC) t += ' ; inclut les salariés « sans porc »';
      if (g.id === M.REGIME_NETTOYAGE) t += ' ; inclut la ligne « Nettoyage sans viande »';
      return t;
    }
    return (EFFETS.filter(function (e) { return e.v === (g.affecte || ''); })[0] || EFFETS[0]).nom;
  }

  function utilisations(d, g) {
    return d.residents.filter(function (r) {
      return r.textureId === g.id || r.regimeIds.indexOf(g.id) >= 0 || r.optionIds.indexOf(g.id) >= 0;
    }).length;
  }

  // Ajoute / retire un service, en gardant l'ordre petit déjeuner, midi, soir.
  function basculer(services, id) {
    var on = services.indexOf(id) >= 0;
    return M.IDS_SERVICES.filter(function (x) { return x === id ? !on : services.indexOf(x) >= 0; });
  }

  // Monter / descendre parmi les éléments de même nature (l'ordre global du référentiel est conservé ailleurs).
  function deplacer(liste, g, sens) {
    var i = liste.indexOf(g), j = i + sens;
    while (j >= 0 && j < liste.length && liste[j].nature !== g.nature) j += sens;
    if (j < 0 || j >= liste.length) return;
    liste[i] = liste[j]; liste[j] = g;
  }

  function valeurEdition(ed) { return [ed.nom, ed.abrege, ed.couleur, ed.nature, ed.affecte, ed.services.join(',')].join('|'); }
  function edition(id, table, nom, abrege, couleur, nature, affecte, services) {
    var ed = { id: id, table: table, nom: nom, abrege: abrege, couleur: couleur, nature: nature, affecte: affecte,
      services: services.slice(), erreur: '' };
    ed.init = valeurEdition(ed);
    return ed;
  }

  function casesServices(services, changer, nom) {
    return h('span', { class: 'services-reg' }, M.SERVICES.map(function (s) {
      var on = services.indexOf(s.id) >= 0;
      return h('label', { class: 'choix' + (on ? ' on' : ''), title: s.nom },
        h('input', { type: 'checkbox', checked: on, 'aria-label': s.nom + (nom ? ' : ' + nom : ''), onchange: function () { changer(s.id); } }),
        s.court);
    }));
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
          g.services = ed.services.slice();
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

      var gabarit = 'grid-template-columns:44px minmax(0,1.4fr) minmax(0,1fr) 230px minmax(0,1.6fr) 260px';
      function formulaire() {
        var texture = ed.nature === 'texture';
        return h('div', { class: 'ligne-reg edition', style: gabarit },
          h('input', { type: 'color', value: ed.couleur, 'aria-label': 'Couleur', oninput: function (e) { ed.couleur = e.target.value; App.signalerModif(); } }),
          h('input', { value: ed.nom, 'aria-label': 'Nom', placeholder: 'Nom', oninput: function (e) { ed.nom = e.target.value; App.signalerModif(); } }),
          h('input', { value: ed.abrege, 'aria-label': 'Abrégé pour la grille', placeholder: 'Abrégé (grille)', oninput: function (e) { ed.abrege = e.target.value; App.signalerModif(); } }),
          casesServices(ed.services, function (id) { ed.services = basculer(ed.services, id); App.rendre(); }),
          texture ? h('span', { class: 'petit' }, effet({ id: ed.id, nature: 'texture' }))
            : h('span', { class: 'effet-reg' },
              h('select', { 'aria-label': 'Nature', onchange: function (e) { ed.nature = e.target.value; App.rendre(); } },
                NATURES.map(function (n) { return h('option', { value: n.v, selected: n.v === ed.nature }, n.nom); })),
              ed.nature === 'option'
                ? h('select', { 'aria-label': 'Effet sur la production', onchange: function (e) { ed.affecte = e.target.value; App.signalerModif(); } },
                  EFFETS.map(function (x) { return h('option', { value: x.v, selected: x.v === ed.affecte }, x.nom); }))
                : h('span', { class: 'petit' }, effet({ id: ed.id, nature: 'regime' }))),
          h('span', { class: 'actions-visibles' },
            h('button', { class: 'btn btn-principal', onclick: enregistrer }, 'Enregistrer'),
            h('button', { class: 'btn', onclick: function () { App.etat.regimeEdit = null; App.rendre(); } }, 'Annuler'),
            ed.erreur ? h('span', { class: 'erreur' }, ed.erreur) : null));
      }

      function ligne(g, premier, dernier) {
        if (ed && ed.id === g.id) return formulaire();
        return h('div', { class: 'ligne-reg', style: gabarit },
          h('div', { class: 'carre petit-carre', style: 'background:' + g.couleur }),
          h('span', { class: 'gras' }, g.nom),
          h('span', { class: 'petit' }, g.abrege),
          // Cases cochables directement (sans passer par « Éditer »).
          casesServices(g.services || M.SERVICES_REGIME_DEFAUT, function (id) {
            App.modifier(function () { g.services = basculer(g.services || M.SERVICES_REGIME_DEFAUT, id); });
          }, g.nom),
          h('span', { class: 'petit' }, effet(g)),
          h('span', { class: 'actions-visibles' },
            h('button', { class: 'btn btn-icone', 'aria-label': 'Monter ' + g.nom, disabled: premier,
              onclick: function () { App.modifier(function () { deplacer(liste, g, -1); }); } }, '↑'),
            h('button', { class: 'btn btn-icone', 'aria-label': 'Descendre ' + g.nom, disabled: dernier,
              onclick: function () { App.modifier(function () { deplacer(liste, g, 1); }); } }, '↓'),
            h('button', { class: 'btn', onclick: function () {
              if (!App.abandonner()) return;
              App.etat.regimeEdit = edition(g.id, g.nature, g.nom, g.abrege || '', g.couleur, g.nature, g.affecte || '',
                g.services || M.SERVICES_REGIME_DEFAUT);
              App.rendre();
            } }, 'Éditer'),
            h('button', { class: 'btn btn-danger', onclick: function () { supprimer(g); } }, 'Supprimer')));
      }

      function table(t) {
        var elts = liste.filter(function (g) { return g.nature === t.nature; });
        return h('div', { class: 'carte' },
          h('h2', { class: 'titre-carte' }, t.titre + ' ', h('span', { class: 'pilule' }, elts.length)),
          h('div', { class: 'ligne-reg entete', style: gabarit }, h('span'), h('span', null, 'Nom'), h('span', null, 'Abrégé (grille)'),
            h('span', null, 'Services concernés'), h('span', null, 'Effet sur la production'), h('span')),
          elts.map(function (g, i) { return ligne(g, i === 0, i === elts.length - 1); }),
          ed && !ed.id && ed.table === t.nature ? formulaire() : h('button', { class: 'btn', style: 'align-self:flex-start;margin-top:6px', onclick: function () {
            if (!App.abandonner()) return;
            App.etat.regimeEdit = edition(null, t.nature, '', '', '#dddddd', t.nature, '', M.SERVICES_REGIME_DEFAUT);
            App.rendre();
          } }, t.ajout));
      }

      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' },
          h('div', { class: 'titre-ligne' }, h('h1', null, 'Textures, Régimes & Allergies et Options ', h('span', { class: 'pilule' }, liste.length)), App.indicateur()),
          h('div', { class: 'petit' }, 'Services concernés : décochés, l’élément n’apparaît pas sur les feuilles de ce service ' +
            '(ex. pots gourmands : petit déjeuner seulement).')),
        TABLES.map(table));
    }
  };
})(window.Recueil = window.Recueil || {});
