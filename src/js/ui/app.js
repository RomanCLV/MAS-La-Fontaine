/* Application à onglets : état, sauvegarde automatique, barre du haut, menu Pages, rendu. */
(function (R) {
  'use strict';
  var M = R.Modele, S = R.Stockage, h = R.h, O = R.Outils;
  R.Pages = R.Pages || {};

  // null = séparateur dans le menu Pages.
  var MENU = [
    { type: 'semaine', nom: 'Semaine' },
    { type: 'parcs', nom: 'Parcs' },
    { type: 'services', nom: 'Services' },
    { type: 'regimes', nom: 'Régimes' },
    { type: 'residents', nom: 'Résidents' },
    { type: 'activites', nom: 'Activités' },
    null,
    { type: 'import', nom: 'Fichier : Importer' },
    { type: 'export', nom: 'Fichier : Exporter' },
    null,
    { type: 'options', nom: 'Options' }
  ];
  var MAX_FERMES = 8;

  var App = {
    donnees: null,
    meta: {},
    ui: null,
    brouillons: {},   // brouillons non enregistrés, par clé d'onglet
    etat: {},         // états d'écran temporaires (filtres, éditions en ligne…)
    menuOuvert: false,   // false, 'pages' (bouton ☰ Pages) ou 'plus' (bouton + de la barre d'onglets)
    erreurSauvegarde: false,
    copieIllisible: null // { erreur, texte } : cache présent mais illisible, gardé tant qu'on ne le remplace pas
  };

  function cle(o) { return o.type + (o.id ? ':' + o.id : ''); }
  App.cle = cle;

  // Page fixe = page du menu Pages (Semaine comprise) : jamais dans « Fermés récemment », on la rouvre par le menu.
  function fixe(o) { return MENU.some(function (p) { return p && p.type === o.type; }); }

  // ---------- Démarrage ----------
  App.demarrer = function () {
    var copie = S.chargerCopie();
    App.donnees = copie.donnees;
    App.copieIllisible = copie.erreur ? { erreur: copie.erreur, texte: copie.texte } : null;
    App.meta = S.meta();
    App.ui = etatUi(S.lireUi());
    if (App.donnees) App.nettoyerOnglets();
    document.addEventListener('click', function (e) {
      if (App.menuOuvert && !e.target.closest('.menu-pages, .btn-pages, .btn-plus')) { App.menuOuvert = false; App.rendre(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && App.menuOuvert) { App.menuOuvert = false; App.rendre(); }
    });
    window.addEventListener('beforeprint', function () { if (R.Impression) R.Impression.preparer(); });
    window.addEventListener('beforeunload', function (e) {
      if (App.donnees && App.ui.onglets.some(function (o) { return App.modifieOnglet(o); })) { e.preventDefault(); e.returnValue = ''; }
    });
    App.rendre();
  };

  function etatUi(ui) {
    return {
      onglets: Array.isArray(ui.onglets) ? ui.onglets : [],
      actif: ui.actif || '',
      fermes: Array.isArray(ui.fermes) ? ui.fermes : [],
      semaine: ui.semaine || '',
      parcActif: ui.parcActif || '',
      residentsVue: ui.residentsVue || 'liste',
      servicesMasques: Array.isArray(ui.servicesMasques) ? ui.servicesMasques : [],  // grille Semaine ; un service ajouté est affiché
      impression: ui.impression || null,
      fermerApres: Array.isArray(ui.fermerApres) ? ui.fermerApres : []   // types de page à fermer après « Enregistrer »
    };
  }

  // Services affichés dans la grille Semaine (simple affichage) : tous sauf les masqués, jamais aucun.
  App.servicesVisibles = function () {
    var v = M.IDS_SERVICES.filter(function (id) { return App.ui.servicesMasques.indexOf(id) < 0; });
    return v.length ? v : M.IDS_SERVICES.slice();
  };

  // Retire les onglets dont l'objet n'existe plus ; garantit un onglet ouvert.
  App.nettoyerOnglets = function () {
    var d = App.donnees;
    if (!M.semaine(d, App.ui.semaine)) App.ui.semaine = d.semaines[d.semaines.length - 1].id;
    function existe(o) {
      if (!R.Pages[o.type]) return false;
      if (o.type === 'semaine') return !!M.semaine(d, o.id);
      if (o.type === 'resident') return !!M.resident(d, o.id) || !!App.brouillons[cle(o)];
      return true;
    }
    App.ui.onglets = App.ui.onglets.filter(existe);
    App.ui.fermes = App.ui.fermes.filter(function (o) { return existe(o) && !fixe(o); });
    if (!App.ui.onglets.length) App.ui.onglets.push({ type: 'semaine', id: App.ui.semaine });
    if (!App.ui.onglets.some(function (o) { return cle(o) === App.ui.actif; })) definirActif(cle(App.ui.onglets[0]));
  };

  // Change l'onglet actif ; un onglet Semaine devient aussi la semaine courante (export, impression, activités).
  function definirActif(k) {
    App.ui.actif = k;
    var o = App.ongletActif();
    if (o && o.type === 'semaine') App.ui.semaine = o.id;
  }

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
    definirActif(k);
    App.menuOuvert = false;
    App.sauverUi();
    App.rendre(true);
  };

  App.fermer = function (k) {
    var i = -1;
    App.ui.onglets.forEach(function (o, n) { if (cle(o) === k) i = n; });
    if (i < 0) { delete App.brouillons[k]; return; }
    var o = App.ui.onglets[i];
    if (App.modifieOnglet(o)) {
      App.confirmer('Fermer cet onglet sans enregistrer les modifications ?', function () { fermerSansQuestion(o, k); }, { ok: 'Fermer sans enregistrer', danger: true });
      return;
    }
    fermerSansQuestion(o, k);
  };
  // Après un bouton « Enregistrer » réussi : ferme l'onglet si son type de page est coché dans Options.
  App.apresEnregistrement = function (k) { if (App.ui.fermerApres.indexOf(k.split(':')[0]) >= 0) App.fermer(k); };
  function fermerSansQuestion(o, k) {
    var i = -1;
    App.ui.onglets.forEach(function (x, n) { if (cle(x) === k) i = n; });
    if (i < 0) return;
    if (R.Pages[o.type].abandonner) R.Pages[o.type].abandonner(o);
    delete App.brouillons[k];
    App.ui.onglets.splice(i, 1);
    if (!fixe(o) && (o.type !== 'resident' || M.resident(App.donnees, o.id))) {
      App.ui.fermes = [o].concat(App.ui.fermes.filter(function (x) { return cle(x) !== k; })).slice(0, MAX_FERMES);
    }
    if (!App.ui.onglets.length) App.ui.onglets.push({ type: 'semaine', id: App.ui.semaine });
    if (App.ui.actif === k) definirActif(cle(App.ui.onglets[Math.max(0, i - 1)] || App.ui.onglets[0]));
    App.sauverUi();
    App.rendre(true);
  }

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

  // ---------- Modifications non enregistrées (brouillons des pages) ----------
  // Une page signale un brouillon par modifie(onglet) et sait l'effacer par abandonner(onglet).
  App.modifieOnglet = function (o) {
    var p = o && R.Pages[o.type];
    try { return !!(p && p.modifie && p.modifie(o)); } catch (e) { return false; }
  };
  // Avant de remplacer un brouillon : confirmation si besoin, puis suite() si on peut continuer.
  App.abandonner = function (suite, o) {
    o = o || App.ongletActif();
    if (!App.modifieOnglet(o)) { suite(); return; }
    App.confirmer('Abandonner les modifications non enregistrées ?', function () {
      if (R.Pages[o.type].abandonner) R.Pages[o.type].abandonner(o);
      suite();
    }, { ok: 'Abandonner', danger: true });
  };
  App.indicateur = function (o) {
    return h('span', { class: 'non-enregistre', role: 'status', hidden: !App.modifieOnglet(o || App.ongletActif()) }, 'Modifications non enregistrées');
  };
  // Mise à jour légère pendant la frappe (sans re-rendu, pour garder le focus).
  App.signalerModif = function () {
    App.rendreOnglets();
    var m = App.modifieOnglet(App.ongletActif());
    document.querySelectorAll('#app .non-enregistre').forEach(function (el) { el.hidden = !m; });
  };

  // ---------- Modifications et sauvegarde ----------
  // fn(donnees) modifie les données ; sauvegarde immédiate ; re-rendu sauf { sansRendu: true }.
  App.modifier = function (fn, opts) {
    fn(App.donnees);
    M.appliquerServices(App.donnees);
    App.meta.sauveLe = Date.now();
    App.meta.nonExporte = true;
    App.erreurSauvegarde = !S.sauverCopie(App.donnees, App.meta);
    if (opts && opts.sansRendu) App.rendreBarre();
    else App.rendre();
  };

  // Petit message en bas de l'écran, effacé après quelques secondes (hors de #app : survit aux re-rendus).
  // Après un « Enregistrer » ; si la sauvegarde dans le navigateur a échoué, message d'erreur à la place.
  App.toast = function (texte, erreur) {
    if (!erreur && App.erreurSauvegarde) { texte = 'Enregistrement impossible dans ce navigateur : exportez le fichier'; erreur = true; }
    var zone = document.getElementById('toasts');
    if (!zone) {
      zone = h('div', { id: 'toasts', class: 'toasts', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(zone);
    }
    var t = h('div', { class: 'toast' + (erreur ? ' toast-ko' : '') }, (erreur ? '✕ ' : '✓ ') + texte);
    zone.appendChild(t);
    setTimeout(function () { t.classList.add('sortie'); }, erreur ? 5000 : 2500);
    setTimeout(function () { t.remove(); }, erreur ? 5400 : 2900);
  };

  // ---------- Boîtes de dialogue ----------
  // Remplacent window.confirm / window.alert : le navigateur propose de les bloquer (« Ne plus autoriser ce site
  // à vous solliciter ») et confirm() répond alors toujours « non » sans rien afficher. Une page ne peut pas lire
  // ce réglage : on affiche donc nos propres fenêtres, que le navigateur ne bloque jamais.
  // Le texte passe par textContent ; les \n font des retours à la ligne. contenu : texte ou élément (formulaire).
  // Bouton { avant: fn } : fn() renvoie false pour garder la fenêtre ouverte (saisie à corriger).
  function dialogue(contenu, boutons, surFin) {
    var fini = false;
    function finir(choix) {
      if (fini) return;
      fini = true;
      if (d.open) d.close();
      d.remove();
      surFin(choix);
    }
    // Échap ferme la fenêtre (événement close) : vaut « Annuler ».
    var d = h('dialog', { class: 'dialogue', onclose: function () { finir(''); } },
      typeof contenu === 'string' ? h('p', { class: 'dialogue-texte' }, contenu) : contenu,
      h('div', { class: 'dialogue-boutons' }, boutons.map(function (b) {
        return h('button', { class: 'btn ' + (b.classe || ''), autofocus: b.focus, onclick: function () {
          if (b.avant && b.avant() === false) return;
          finir(b.valeur);
        } }, b.texte);
      })));
    document.body.appendChild(d);
    d.showModal();
  }
  App.fenetre = dialogue;
  // suite() n'est appelée que si l'utilisateur confirme. opts : { ok: 'Supprimer', danger: true }.
  App.confirmer = function (texte, suite, opts) {
    opts = opts || {};
    dialogue(texte, [
      { texte: 'Annuler', valeur: '', focus: !!opts.danger },
      { texte: opts.ok || 'OK', valeur: 'ok', classe: opts.danger ? 'btn-danger-plein' : 'btn-principal', focus: !opts.danger }
    ], function (choix) { if (choix === 'ok') suite(); });
  };
  App.alerte = function (texte) {
    dialogue(texte, [{ texte: 'OK', valeur: 'ok', classe: 'btn-principal', focus: true }], function () {});
  };

  App.remplacerDonnees = function (donnees, origine) {
    // Cache illisible : on ne l'écrase qu'après confirmation (l'accueil propose de le télécharger avant).
    if (App.copieIllisible) {
      App.confirmer('Remplacer les données illisibles de ce navigateur ?\n\nElles seront effacées. ' +
        'Si vous ne l’avez pas encore fait, annulez et cliquez d’abord sur « Télécharger les données illisibles » : ' +
        'ce fichier permettra peut-être de les récupérer.',
        function () { App.copieIllisible = null; App.remplacerDonnees(donnees, origine); }, { ok: 'Remplacer', danger: true });
      return;
    }
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

  // Efface tout ce que l'application garde dans ce navigateur, puis retour à l'écran d'accueil.
  // Renvoie false si le navigateur a refusé.
  App.viderCache = function () {
    if (!S.vider()) return false;
    App.donnees = null;
    App.meta = {};
    App.brouillons = {};
    App.etat = {};
    App.menuOuvert = false;
    App.erreurSauvegarde = false;
    App.copieIllisible = null;
    App.ui = etatUi({});
    App.rendre(true);
    return true;
  };

  App.marquerExporte = function () {
    App.meta.nonExporte = false;
    App.meta.exporteLe = Date.now();
    S.sauverCopie(App.donnees, App.meta);
    App.rendre();
  };

  App.sauverUi = function () { S.sauverUi(App.ui); };

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
        class: 'btn-pages', 'aria-expanded': App.menuOuvert === 'pages' ? 'true' : 'false',
        onclick: function () { App.menuOuvert = App.menuOuvert === 'pages' ? false : 'pages'; App.rendre(); }
      }, '☰ Pages ▾') : null,
      h('div', { class: 'barre-titre' }, 'Recueil Alimentation · MAS La Fontaine'),
      App.donnees ? etat : null,
      App.donnees && App.meta.nonExporte ? h('button', { class: 'etat etat-attention', onclick: function () { App.ouvrir('export'); } },
        'Modifications non exportées') : null,
      App.donnees ? h('div', { class: 'barre-fichier' },
        h('button', { class: 'btn-barre', onclick: function () { App.ouvrir('import'); } }, 'Importer'),
        h('button', { class: 'btn-barre', onclick: function () { App.ouvrir('export'); } }, 'Exporter')) : null,
      App.menuOuvert === 'pages' ? menuPages() : null);
  }

  function menuPages() {
    var actifType = (App.ongletActif() || {}).type;
    return h('div', { class: 'menu-pages', role: 'menu' },
      MENU.map(function (p) {
        if (!p) return h('div', { class: 'menu-sep', role: 'separator' });
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
        return h('div', { class: 'onglet' + (actif ? ' actif' : ''), 'data-cle': k, onpointerdown: function (e) { glisserOnglet(e, k); } },
          h('button', { class: 'onglet-titre', role: 'tab', 'aria-selected': actif ? 'true' : 'false', onclick: function () { App.activer(k); } },
            titreOnglet(o) + (App.modifieOnglet(o) ? ' •' : '')),
          h('button', { class: 'onglet-fermer', 'aria-label': 'Fermer l’onglet ' + titreOnglet(o), onclick: function () { App.fermer(k); } }, '×'));
      }),
      // « + » : même menu que « ☰ Pages », ouvert sous le bouton.
      h('div', { class: 'onglet-plus' },
        h('button', { class: 'btn-plus', title: 'Ouvrir une page', 'aria-label': 'Ouvrir une page',
          'aria-expanded': App.menuOuvert === 'plus' ? 'true' : 'false',
          onclick: function () { App.menuOuvert = App.menuOuvert === 'plus' ? false : 'plus'; App.rendre(); } }, '+'),
        App.menuOuvert === 'plus' ? menuPages() : null));
  }

  // Glisser-déposer d'un onglet pour changer l'ordre : le glissement commence après quelques pixels
  // (un simple clic active toujours l'onglet) ; un trait bleu montre où il sera posé ; Échap annule.
  function glisserOnglet(e, k) {
    if (e.button !== 0 || e.target.closest('.onglet-fermer')) return;
    var x0 = e.clientX, y0 = e.clientY, source = e.currentTarget, glisse = false, cible = null, apres = false;
    function effacerTrait() {
      document.querySelectorAll('.onglet.depot-avant, .onglet.depot-apres').forEach(function (el) {
        el.classList.remove('depot-avant', 'depot-apres');
      });
    }
    function bouger(ev) {
      if (!glisse) {
        if (Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 6) return;
        glisse = true;
        source.classList.add('glisse');
        document.body.classList.add('glisse-onglet');
      }
      var el = document.elementFromPoint(ev.clientX, ev.clientY);
      var o = el && el.closest('.onglet');
      if (!o) return;
      var r = o.getBoundingClientRect();
      cible = o.getAttribute('data-cle');
      apres = ev.clientX > r.left + r.width / 2;
      effacerTrait();
      if (o !== source) o.classList.add(apres ? 'depot-apres' : 'depot-avant');
    }
    function arreter(annule) {
      document.removeEventListener('pointermove', bouger);
      document.removeEventListener('pointerup', relacher);
      document.removeEventListener('pointercancel', annuler);
      document.removeEventListener('keydown', echap);
      if (!glisse) return;
      effacerTrait();
      source.classList.remove('glisse');
      document.body.classList.remove('glisse-onglet');
      // Le clic qui suit le relâchement ne doit pas activer un onglet.
      window.addEventListener('click', bloquerClic, true);
      setTimeout(function () { window.removeEventListener('click', bloquerClic, true); }, 0);
      if (annule || !cible || cible === k) return;
      var liste = App.ui.onglets, i = liste.findIndex(function (o) { return cle(o) === k; });
      var deplace = liste.splice(i, 1)[0];
      var j = liste.findIndex(function (o) { return cle(o) === cible; });
      liste.splice(apres ? j + 1 : j, 0, deplace);
      App.sauverUi();
      App.rendreOnglets();
    }
    function bloquerClic(ev) { ev.stopPropagation(); ev.preventDefault(); }
    function relacher() { arreter(false); }
    function annuler() { arreter(true); }
    function echap(ev) { if (ev.key === 'Escape') arreter(true); }
    document.addEventListener('pointermove', bouger);
    document.addEventListener('pointerup', relacher);
    document.addEventListener('pointercancel', annuler);
    document.addEventListener('keydown', echap);
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
    // Seul le contenu de l'onglet défile (barre et onglets restent en haut).
    var ancien = racine.querySelector(':scope > .contenu');
    var x = ancien ? ancien.scrollLeft : 0, y = ancien ? ancien.scrollTop : 0;
    var defil = {};
    racine.querySelectorAll('[data-defil]').forEach(function (el) { defil[el.getAttribute('data-defil')] = el.scrollLeft; });

    // Services en vigueur = ceux des données affichées (un fichier lu pour l'import a pu les changer).
    M.appliquerServices(App.donnees);
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
    var main = h('main', { class: 'contenu' }, contenu);
    parties.push(main);
    racine.replaceChildren.apply(racine, parties);
    document.title = (App.donnees ? titreOnglet(App.ongletActif()) + ' · ' : '') + 'Recueil Alimentation';

    if (!hautDePage) {
      main.scrollLeft = x;
      main.scrollTop = y;
      racine.querySelectorAll('[data-defil]').forEach(function (el) {
        var v = defil[el.getAttribute('data-defil')];
        if (v) el.scrollLeft = v;
      });
    }
  };

  R.App = App;
})(window.Recueil = window.Recueil || {});
