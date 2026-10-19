/* Application à onglets : état, sauvegarde automatique, barre du haut, menu Pages, rendu. */
(function (R) {
  'use strict';
  var M = R.Modele, S = R.Stockage, h = R.h, O = R.Outils;
  R.Pages = R.Pages || {};

  var MENU = [
    { type: 'semaine', nom: 'Semaine (saisie)' },
    { type: 'residents', nom: 'Résidents' },
    { type: 'parcs', nom: 'Parcs' },
    { type: 'activites', nom: 'Activités' },
    { type: 'regimes', nom: 'Régimes' },
    { type: 'import', nom: 'Fichier : importer' },
    { type: 'export', nom: 'Fichier : exporter' },
    { type: 'imprimer', nom: 'Imprimer' }
  ];
  var MAX_FERMES = 8;

  var App = {
    donnees: null,
    meta: {},
    ui: null,
    brouillons: {},   // brouillons non enregistrés, par clé d'onglet
    etat: {},         // états d'écran temporaires (filtres, éditions en ligne…)
    menuOuvert: false,
    erreurSauvegarde: false
  };

  function cle(o) { return o.type + (o.id ? ':' + o.id : ''); }
  App.cle = cle;

  // ---------- Démarrage ----------
  App.demarrer = function () {
    App.donnees = S.chargerCopie();
    App.meta = S.meta();
    var ui = S.lireUi();
    App.ui = {
      onglets: Array.isArray(ui.onglets) ? ui.onglets : [],
      actif: ui.actif || '',
      fermes: Array.isArray(ui.fermes) ? ui.fermes : [],
      manager: !!ui.manager,
      semaine: ui.semaine || '',
      parcActif: ui.parcActif || '',
      residentsVue: ui.residentsVue || 'liste',
      impression: ui.impression || null
    };
    if (App.donnees) App.nettoyerOnglets();
    document.addEventListener('click', function (e) {
      if (App.menuOuvert && !e.target.closest('.menu-pages, .btn-pages')) { App.menuOuvert = false; App.rendre(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && App.menuOuvert) { App.menuOuvert = false; App.rendre(); }
    });
    window.addEventListener('beforeprint', function () { if (R.Impression) R.Impression.preparer(); });
    App.rendre();
  };

  // Retire les onglets dont l'objet n'existe plus ; garantit un onglet ouvert.
  App.nettoyerOnglets = function () {
    var d = App.donnees;
    if (!M.semaine(d, App.ui.semaine)) App.ui.semaine = d.semaines[d.semaines.length - 1].id;
    App.ui.onglets = App.ui.onglets.filter(function (o) {
      if (!R.Pages[o.type]) return false;
      if (o.type === 'semaine') return !!M.semaine(d, o.id);
      if (o.type === 'resident') return !!M.resident(d, o.id) || !!App.brouillons[cle(o)];
      return true;
    });
    if (!App.ui.onglets.length) App.ui.onglets.push({ type: 'semaine', id: App.ui.semaine });
    if (!App.ui.onglets.some(function (o) { return cle(o) === App.ui.actif; })) App.ui.actif = cle(App.ui.onglets[0]);
  };

  // ---------- Onglets ----------
  App.ouvrir = function (type, id) {
    if (type === 'semaine' && !id) id = App.ui.semaine;
    var o = { type: type };
    if (id) o.id = id;
    var k = cle(o);
    if (!App.ui.onglets.some(function (x) { return cle(x) === k; })) App.ui.onglets.push(o);
    App.ui.fermes = App.ui.fermes.filter(function (x) { return cle(x) !== k; });
    App.activer(k);
  };

  App.activer = function (k) {
    App.ui.actif = k;
    var o = App.ongletActif();
    if (o && o.type === 'semaine') App.ui.semaine = o.id;
    App.menuOuvert = false;
    App.sauverUi();
    App.rendre(true);
  };

  App.fermer = function (k) {
    var b = App.brouillons[k];
    if (b && b.modifie && !window.confirm('Fermer cet onglet sans enregistrer les modifications ?')) return;
    delete App.brouillons[k];
    var i = -1;
    App.ui.onglets.forEach(function (o, n) { if (cle(o) === k) i = n; });
    if (i < 0) return;
    var o = App.ui.onglets.splice(i, 1)[0];
    if (o.type !== 'resident' || M.resident(App.donnees, o.id)) {
      App.ui.fermes = [o].concat(App.ui.fermes.filter(function (x) { return cle(x) !== k; })).slice(0, MAX_FERMES);
    }
    if (!App.ui.onglets.length) App.ui.onglets.push({ type: 'semaine', id: App.ui.semaine });
    if (App.ui.actif === k) App.ui.actif = cle(App.ui.onglets[Math.max(0, i - 1)] || App.ui.onglets[0]);
    App.sauverUi();
    App.rendre(true);
  };

  // Remplace l'identifiant d'un onglet (ex. nouveau résident enregistré).
  App.renommerOnglet = function (ancienne, o) {
    App.ui.onglets = App.ui.onglets.map(function (x) { return cle(x) === ancienne ? o : x; });
    if (App.ui.actif === ancienne) App.ui.actif = cle(o);
    App.sauverUi();
  };

  App.ongletActif = function () {
    return App.ui.onglets.filter(function (o) { return cle(o) === App.ui.actif; })[0] || null;
  };

  App.semaineCourante = function () {
    return M.semaine(App.donnees, App.ui.semaine) || App.donnees.semaines[App.donnees.semaines.length - 1];
  };
  App.choisirSemaine = function (id) {
    App.ui.semaine = id;
    App.sauverUi();
    App.rendre();
  };

  // ---------- Modifications et sauvegarde ----------
  // fn(donnees) modifie les données ; sauvegarde immédiate ; re-rendu sauf { sansRendu: true }.
  App.modifier = function (fn, opts) {
    fn(App.donnees);
    App.meta.sauveLe = Date.now();
    App.meta.nonExporte = true;
    App.erreurSauvegarde = !S.sauverCopie(App.donnees, App.meta);
    if (opts && opts.sansRendu) App.rendreBarre();
    else App.rendre();
  };

  App.remplacerDonnees = function (donnees, origine) {
    App.donnees = donnees;
    App.brouillons = {};
    App.etat = {};
    App.meta = { sauveLe: Date.now(), nonExporte: false, fichier: origine || '', importeLe: Date.now() };
    App.erreurSauvegarde = !S.sauverCopie(App.donnees, App.meta);
    var derniere = donnees.semaines[donnees.semaines.length - 1];
    App.ui.semaine = derniere.id;
    App.ui.onglets = [{ type: 'semaine', id: derniere.id }];
    App.ui.fermes = [];
    App.ui.actif = 'semaine:' + derniere.id;
    App.sauverUi();
    App.rendre(true);
  };

  App.marquerExporte = function () {
    App.meta.nonExporte = false;
    App.meta.exporteLe = Date.now();
    S.sauverCopie(App.donnees, App.meta);
    App.rendre();
  };

  App.sauverUi = function () { S.sauverUi(App.ui); };

  App.basculerManager = function () {
    App.ui.manager = !App.ui.manager;
    App.sauverUi();
    App.rendre();
  };

  // ---------- Rendu ----------
  function barre() {
    var etat;
    if (App.erreurSauvegarde) {
      etat = h('span', { class: 'etat etat-ko' }, 'Enregistrement impossible dans ce navigateur : exportez le fichier');
    } else {
      etat = h('span', { class: 'etat' }, App.meta.sauveLe ? 'Enregistré à ' + O.heure(App.meta.sauveLe) : 'Enregistré');
    }
    return h('div', { class: 'barre' },
      App.donnees ? h('button', {
        class: 'btn-pages', 'aria-expanded': App.menuOuvert ? 'true' : 'false',
        onclick: function () { App.menuOuvert = !App.menuOuvert; App.rendre(); }
      }, '☰ Pages ▾') : null,
      h('div', { class: 'barre-titre' }, 'Recueil Alimentation · MAS La Fontaine'),
      App.donnees ? etat : null,
      App.donnees && App.meta.nonExporte ? h('button', { class: 'etat etat-attention', onclick: function () { App.ouvrir('export'); } },
        'Modifications non exportées') : null,
      App.donnees ? h('button', { class: 'btn-manager' + (App.ui.manager ? ' actif' : ''), 'aria-pressed': App.ui.manager ? 'true' : 'false',
        onclick: App.basculerManager }, 'Mode manager : ' + (App.ui.manager ? 'oui' : 'non')) : null,
      App.menuOuvert ? menuPages() : null);
  }

  function menuPages() {
    var actifType = (App.ongletActif() || {}).type;
    return h('div', { class: 'menu-pages', role: 'menu' },
      MENU.map(function (p) {
        var ouvert = App.ui.onglets.some(function (o) { return o.type === p.type; });
        return h('button', { class: 'menu-item' + (actifType === p.type ? ' courant' : ''), role: 'menuitem',
          onclick: function () { App.ouvrir(p.type); } },
          p.nom, ouvert ? h('span', { class: 'menu-note' }, 'ouvert') : null);
      }),
      App.ui.fermes.length ? h('div', { class: 'menu-titre' }, 'Fermés récemment') : null,
      App.ui.fermes.map(function (o) {
        return h('button', { class: 'menu-item menu-ferme', role: 'menuitem', onclick: function () { App.ouvrir(o.type, o.id); } }, titreOnglet(o));
      }));
  }

  function titreOnglet(o) {
    var p = R.Pages[o.type];
    try { return p ? p.titre(o) : o.type; } catch (e) { return o.type; }
  }

  function barreOnglets() {
    return h('div', { class: 'onglets', role: 'tablist' },
      App.ui.onglets.map(function (o) {
        var k = cle(o), actif = k === App.ui.actif;
        return h('div', { class: 'onglet' + (actif ? ' actif' : '') },
          h('button', { class: 'onglet-titre', role: 'tab', 'aria-selected': actif ? 'true' : 'false', onclick: function () { App.activer(k); } },
            titreOnglet(o) + (App.brouillons[k] && App.brouillons[k].modifie ? ' •' : '')),
          h('button', { class: 'onglet-fermer', 'aria-label': 'Fermer l’onglet ' + titreOnglet(o), onclick: function () { App.fermer(k); } }, '×'));
      }));
  }

  App.rendreOnglets = function () {
    var ancienne = document.querySelector('#app > .onglets');
    if (ancienne) ancienne.replaceWith(barreOnglets());
  };

  App.rendreBarre = function () {
    var ancienne = document.querySelector('#app > .barre');
    if (ancienne) ancienne.replaceWith(barre());
  };

  // hautDePage : true quand on change d'onglet (sinon la position de défilement est conservée).
  App.rendre = function (hautDePage) {
    var racine = document.getElementById('app');
    var x = window.scrollX, y = window.scrollY;
    var defil = {};
    racine.querySelectorAll('[data-defil]').forEach(function (el) { defil[el.getAttribute('data-defil')] = el.scrollLeft; });

    var contenu;
    if (!App.donnees) {
      contenu = R.Pages.accueil.rendu();
    } else {
      var o = App.ongletActif();
      try {
        contenu = R.Pages[o.type].rendu(o);
      } catch (e) {
        contenu = h('div', { class: 'page' }, h('div', { class: 'message message-ko' }, 'Erreur d’affichage : ' + e.message));
        if (window.console) console.error(e);
      }
    }
    var parties = [barre()];
    if (App.donnees) parties.push(barreOnglets());
    parties.push(h('main', { class: 'contenu' }, contenu));
    racine.replaceChildren.apply(racine, parties);
    document.title = (App.donnees ? titreOnglet(App.ongletActif()) + ' · ' : '') + 'Recueil Alimentation';

    if (hautDePage) window.scrollTo(0, 0);
    else {
      window.scrollTo(x, y);
      racine.querySelectorAll('[data-defil]').forEach(function (el) {
        var v = defil[el.getAttribute('data-defil')];
        if (v) el.scrollLeft = v;
      });
    }
  };

  R.App = App;
})(window.Recueil = window.Recueil || {});
