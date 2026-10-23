/* Page Régimes : trois tableaux (textures, régimes, options) ; nom, abrégé, services concernés, effet, couleur, ordre. */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h, O = R.Outils, App = R.App;
  // description : phrase courte sous le titre de chaque tableau, pour bien distinguer les trois natures (glossaire).
  var TABLES = [
    { nature: 'texture', titre: 'Textures', ajout: '+ Ajouter une texture',
      description: 'Consistance du plat servi (haché, mixé…). Un résident a une seule texture.' },
    { nature: 'regime', titre: 'Régimes & Allergies', ajout: '+ Ajouter un régime',
      description: 'Contraintes alimentaires impératives : ce que le résident ne doit pas manger (sans porc, diabétique, allergies…). Plusieurs possibles.' },
    { nature: 'option', titre: 'Options', ajout: '+ Ajouter une option',
      description: 'Changements sur l’assiette (enrichi, demi-portion, pots gourmands…) ou plat chaud en plus (double plat). Plusieurs possibles.' }
  ];
  // Options : deux effets seulement (affecte = 'plat' ou '').
  var EFFET_PLAT = '+1 plat chaud (EQ +1)', EFFET_ASSIETTE = 'Sur l’assiette (compté sur les plats)';
  var AIDE_PLAT = 'Coché : le résident reçoit un plat chaud entier en plus (ex. double plat). ' +
    'Décoché : l’option change seulement son assiette (ex. enrichi, demi-portion).';
  var PROTEGES = [M.TEXTURE_DEFAUT, M.REGIME_SANS_PORC, M.REGIME_NETTOYAGE];
  var AIDE_AFFICHE = 'Coché : la colonne est toujours présente dans la grille Semaine. ' +
    'Décoché : elle n’apparaît que si un résident du parc affiché a cet élément.';

  function effet(g) {
    if (g.nature === 'texture') return g.id === M.TEXTURE_DEFAUT ? 'Texture par défaut' : 'Texture';
    if (g.nature === 'regime') {
      var t = 'Compté sur tous les convives';
      if (g.id === M.REGIME_SANS_PORC) t += ' ; inclut les salariés « sans porc »';
      if (g.id === M.REGIME_NETTOYAGE) t += ' ; inclut la ligne « Nettoyage sans viande »';
      return t;
    }
    return g.affecte === 'plat' ? EFFET_PLAT : EFFET_ASSIETTE;
  }

  function utilisations(d, g) {
    return d.residents.filter(function (r) { return M.aRegime(r, g); }).length;
  }

  // Ajoute / retire un service, dans l'ordre des services (page Services ; archivés gardés).
  function basculer(services, id) {
    var on = services.indexOf(id) >= 0;
    return M.TOUS_SERVICES.map(function (s) { return s.id; }).filter(function (x) { return x === id ? !on : services.indexOf(x) >= 0; });
  }

  // Monter / descendre parmi les éléments de même nature (l'ordre global du référentiel est conservé ailleurs).
  function deplacer(liste, g, sens) {
    var i = liste.indexOf(g), j = i + sens;
    while (j >= 0 && j < liste.length && liste[j].nature !== g.nature) j += sens;
    if (j < 0 || j >= liste.length) return;
    liste[i] = liste[j]; liste[j] = g;
  }

  function valeurEdition(ed) { return [ed.nom, ed.abrege, ed.couleur, ed.nature, ed.affecte, ed.services.join(','), ed.visible].join('|'); }
  function edition(id, table, nom, abrege, couleur, nature, affecte, services, visible) {
    var ed = { id: id, table: table, nom: nom, abrege: abrege, couleur: couleur, nature: nature, affecte: affecte,
      services: services.slice(), visible: visible, erreur: '' };
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

  // Case « Toujours affiché » (colonne de la grille Semaine).
  function caseAffiche(on, changer, nom) {
    return h('label', { class: 'choix' + (on ? ' on' : ''), title: AIDE_AFFICHE },
      h('input', { type: 'checkbox', checked: on, 'aria-label': 'Toujours affiché' + (nom ? ' : ' + nom : ''), onchange: changer }),
      on ? 'Oui' : 'Non');
  }

  // Texture par défaut : pas de colonne dans la grille (les autres textures suffisent).
  function sansColonne() { return h('span', { class: 'petit', title: 'La texture par défaut n’a pas de colonne dans la grille Semaine.' }, '—'); }

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
          } else {
            g = { id: R.Referentiel.idLibre(R.Referentiel.slug(ed.nom), liste.map(function (x) { return x.id; })) };
            liste.push(g);
          }
          g.nom = ed.nom.trim(); g.abrege = ed.abrege.trim(); g.couleur = ed.couleur; g.nature = ed.nature;
          g.services = ed.services.slice();
          g.toujoursVisible = ed.visible;
          if (g.nature === 'option') g.affecte = ed.affecte; else delete g.affecte;
          App.etat.regimeEdit = null;
        });
        App.toast({ texture: 'Texture ', regime: 'Régime ', option: 'Option ' }[ed.nature] + ed.nom.trim() +
          (ed.nature === 'regime' ? ' enregistré' : ' enregistrée'));
        App.apresEnregistrement('regimes');
      }
      function supprimer(g) {
        if (PROTEGES.indexOf(g.id) >= 0) { App.alerte('« ' + g.nom + ' » est utilisé par les calculs : il peut être renommé mais pas supprimé.'); return; }
        var n = utilisations(d, g);
        if (g.nature === 'texture' && n) { App.alerte('Impossible : ' + O.pluriel(n, 'résident a', 'résidents ont') + ' cette texture. Changez-la dans leur fiche d’abord.'); return; }
        App.confirmer('Supprimer « ' + g.nom + ' » ?' + (n ? '\nIl sera retiré de ' + O.pluriel(n, 'résident') + '.' : ''), function () {
          App.modifier(function () {
            d.referentiels.regimes = d.referentiels.regimes.filter(function (x) { return x.id !== g.id; });
            d.residents.forEach(function (r) {
              r.regimeIds = r.regimeIds.filter(function (x) { return x !== g.id; });
              r.optionIds = r.optionIds.filter(function (x) { return x !== g.id; });
            });
            App.etat.regimeEdit = null;
          });
        }, { ok: 'Supprimer', danger: true });
      }

      var gabarit = 'grid-template-columns:44px minmax(0,1.4fr) minmax(0,1fr) 230px 100px minmax(0,1.6fr) 260px';
      function formulaire() {
        return h('div', { class: 'ligne-reg edition', style: gabarit },
          h('input', { type: 'color', value: ed.couleur, 'aria-label': 'Couleur', oninput: function (e) { ed.couleur = e.target.value; App.signalerModif(); } }),
          h('input', { value: ed.nom, 'aria-label': 'Nom', placeholder: 'Nom', oninput: function (e) { ed.nom = e.target.value; App.signalerModif(); } }),
          h('input', { value: ed.abrege, 'aria-label': 'Abrégé pour la grille', placeholder: 'Abrégé (grille)', oninput: function (e) { ed.abrege = e.target.value; App.signalerModif(); } }),
          casesServices(ed.services, function (id) { ed.services = basculer(ed.services, id); App.rendre(); }),
          ed.id === M.textureDefaut(d) ? sansColonne()
            : caseAffiche(ed.visible, function () { ed.visible = !ed.visible; App.rendre(); }),
          ed.nature === 'option'
            ? h('label', { class: 'choix' + (ed.affecte === 'plat' ? ' on' : ''), title: AIDE_PLAT },
              h('input', { type: 'checkbox', checked: ed.affecte === 'plat', 'aria-label': '+1 plat chaud',
                onchange: function () { ed.affecte = ed.affecte === 'plat' ? '' : 'plat'; App.rendre(); } }),
              EFFET_PLAT)
            : h('span', { class: 'petit' }, effet({ id: ed.id, nature: ed.nature })),
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
          g.id === M.textureDefaut(d) ? sansColonne() : caseAffiche(g.toujoursVisible !== false, function () {
            App.modifier(function () { g.toujoursVisible = g.toujoursVisible === false; });
          }, g.nom),
          h('span', { class: 'petit' }, effet(g)),
          h('span', { class: 'actions-visibles' },
            h('button', { class: 'btn btn-icone', 'aria-label': 'Monter ' + g.nom, disabled: premier,
              onclick: function () { App.modifier(function () { deplacer(liste, g, -1); }); } }, '↑'),
            h('button', { class: 'btn btn-icone', 'aria-label': 'Descendre ' + g.nom, disabled: dernier,
              onclick: function () { App.modifier(function () { deplacer(liste, g, 1); }); } }, '↓'),
            h('button', { class: 'btn', onclick: function () {
              App.abandonner(function () {
                App.etat.regimeEdit = edition(g.id, g.nature, g.nom, g.abrege || '', g.couleur, g.nature, g.affecte || '',
                  g.services || M.SERVICES_REGIME_DEFAUT, g.toujoursVisible !== false);
                App.rendre();
              });
            } }, 'Éditer'),
            h('button', { class: 'btn btn-danger', onclick: function () { supprimer(g); } }, 'Supprimer')));
      }

      function table(t) {
        var elts = liste.filter(function (g) { return g.nature === t.nature; });
        return h('div', { class: 'carte' },
          h('h2', { class: 'titre-carte' }, t.titre + ' ', h('span', { class: 'pilule' }, elts.length)),
          h('div', { class: 'petit' }, t.description),
          h('div', { class: 'ligne-reg entete', style: gabarit }, h('span'), h('span', null, 'Nom'), h('span', null, 'Abrégé (grille)'),
            h('span', null, 'Services concernés'), h('span', { title: AIDE_AFFICHE, class: 'aide' }, 'Toujours affiché ⓘ'),
            h('span', null, 'Effet sur la production'), h('span')),
          elts.map(function (g, i) { return ligne(g, i === 0, i === elts.length - 1); }),
          ed && !ed.id && ed.table === t.nature ? formulaire() : h('button', { class: 'btn', style: 'align-self:flex-start;margin-top:6px', onclick: function () {
            App.abandonner(function () {
              App.etat.regimeEdit = edition(null, t.nature, '', '', '#dddddd', t.nature, '', M.SERVICES_REGIME_DEFAUT, false);
              App.rendre();
            });
          } }, t.ajout));
      }

      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' },
          h('div', { class: 'titre-ligne' }, h('h1', null, 'Textures, Régimes & Allergies et Options ', h('span', { class: 'pilule' }, liste.length)), App.indicateur()),
          h('div', { class: 'petit' }, 'Services concernés (liste de la page Services) : décochés, l’élément n’apparaît pas sur les feuilles de ce service ' +
            '(ex. pots gourmands : petit déjeuner seulement). Toujours affiché : colonne présente dans la grille Semaine même si aucun résident du parc n’a l’élément.')),
        TABLES.map(table));
    }
  };
})(window.Recueil = window.Recueil || {});
