/* Aide à l'utilisation : menu « ? Aide », bouton « ? » des pages, fenêtre d'aide, touche F1, présentation de démarrage,
   fenêtre des nouveautés. Contenu : Recueil.Aide (js/aide/contenu.js), Recueil.Nouveautes ; maquettes : Recueil.Illustrations.
   Voir docs/aide.md. */
(function (R) {
  'use strict';
  var h = R.h, M = R.Modele, S = R.Stockage, A = R.Aide, N = R.Nouveautes, I = R.Illustrations, App = R.App;

  function lienGuide(section, texte, classe) {
    return h('a', { class: classe || 'lien-guide', href: A.lienGuide(section), target: '_blank', rel: 'noopener' }, texte);
  }

  // Fenêtre d'aide de la page de ce type (rien si la page n'a pas d'aide).
  function aidePage(type) {
    var p = A.PAGES[type];
    if (!p) return;
    var contenu = h('div', { class: 'aide-fen' },
      h('h2', null, 'Aide · ' + p.nom),
      h('p', { class: 'aide-quoi' }, I.texte(p.quoi)),
      I.faire(p.illu),
      h('ul', { class: 'aide-points' }, p.points.map(function (t) { return h('li', null, I.texte(t)); })),
      h('div', { class: 'aide-pied' }, lienGuide(p.guide, 'Lire le guide complet →')));
    App.fenetre(contenu, [{ texte: 'Fermer', valeur: 'ok', classe: 'btn-principal', focus: true }], function () {}, 'dialogue-aide');
  }

  function typeActif() { return App.donnees ? (App.ongletActif() || {}).type : null; }

  // Menu du bouton « ? Aide » (bandeau noir). Ouvert par App (App.menuOuvert === 'aide').
  function menu() {
    var type = typeActif(), p = type && A.PAGES[type];
    function fermer() { App.menuOuvert = false; App.rendre(); }
    return h('div', { class: 'menu-pages menu-aide', role: 'menu' },
      p ? h('button', { class: 'menu-item', role: 'menuitem', onclick: function () { fermer(); aidePage(type); } }, 'Aide sur cette page', h('span', { class: 'menu-note' }, p.nom)) : null,
      h('a', { class: 'menu-item', role: 'menuitem', href: A.lienGuide(), target: '_blank', rel: 'noopener',
        onclick: function () { setTimeout(fermer, 0); } }, 'Guide d’utilisation', h('span', { class: 'menu-note' }, 'nouvel onglet')),
      App.donnees ? h('button', { class: 'menu-item', role: 'menuitem', onclick: function () { fermer(); presentation('revue'); } }, 'Revoir la présentation') : null,
      h('button', { class: 'menu-item', role: 'menuitem', onclick: function () { fermer(); historique(); } }, 'Nouveautés', h('span', { class: 'menu-note' }, 'ce qui a changé')),
      h('div', { class: 'menu-version' }, 'Version ' + M.VERSION_APP));
  }

  // Ajoute le bouton « ? » à côté du titre de la page affichée (contenu = élément rendu par la page).
  function boutonTitre(contenu, type) {
    var p = A.PAGES[type], h1 = p && contenu.querySelector && contenu.querySelector('.page-tete h1, .fiche-tete h1');
    if (!h1) return;
    var titre = h('div', { class: 'titre-aide' });
    h1.replaceWith(titre);
    titre.append(h1, h('button', { class: 'btn-aide-page', title: 'Aide sur cette page (F1)', 'aria-label': 'Aide sur la page ' + p.nom,
      onclick: function () { aidePage(type); } }, '?'));
  }

  // Présentation de démarrage (carrousel). variante : 'mas' | 'vide' | 'revue' (texte des slides adapté à la base).
  function presentation(variante) {
    var slides = A.SLIDES, n = 0;
    var racine = h('div', { class: 'presentation' });
    function fermer() { var d = racine.closest('dialog'); if (d) d.close(); }
    function aller(page) { fermer(); App.ouvrir(page); }
    function rendre() {
      var s = slides[n], dernier = n === slides.length - 1;
      var t = typeof s.texte === 'string' ? s.texte : (s.texte[variante] || s.texte.vide);
      var suivant = h('button', { class: 'btn btn-principal', onclick: function () { if (dernier) fermer(); else { n++; rendre(); } } }, dernier ? 'Commencer' : 'Suivant');
      racine.replaceChildren.apply(racine, [
        h('div', { class: 'pres-haut' }, h('span', null, 'Présentation · ' + (n + 1) + ' / ' + slides.length),
          dernier ? null : h('button', { class: 'lien', onclick: fermer }, 'Passer')),
        h('h2', { class: 'pres-titre' }, s.titre),
        h('div', { class: 'pres-illu' }, I.faire(s.illu)),
        h('p', { class: 'pres-texte' }, I.texte(t)),
        s.aller ? h('div', { class: 'pres-aller' }, [s.aller, s.aller2].filter(Boolean).map(function (a) {
          return h('button', { class: 'btn', onclick: function () { aller(a.page); } }, a.texte);
        })) : null,
        h('div', { class: 'pres-points' }, slides.map(function (x, i) {
          return h('button', { class: 'pres-point' + (i === n ? ' on' : ''), 'aria-label': 'Aller à l’étape ' + (i + 1), onclick: function () { n = i; rendre(); } });
        })),
        h('div', { class: 'pres-nav' },
          h('button', { class: 'btn', disabled: n === 0, onclick: function () { n--; rendre(); } }, 'Précédent'), suivant)
      ].filter(Boolean));   // replaceChildren écrirait « null » pour un élément absent
      suivant.focus();
    }
    App.fenetre(racine, [], function () {}, 'dialogue-presentation');
    rendre();
  }

  // Fenêtre des nouveautés. annonce = true : après une mise à jour (« Quoi de neuf ? », versions données) ;
  // sinon historique de toutes les versions sorties. surFin : après la fermeture (Échap compris).
  function nouveautes(versions, annonce, surFin) {
    var racine;
    function voir(p) {
      var d = racine.closest('dialog');
      if (d) d.close();
      if (p.onglet === 'horsparc') App.ui.parcActif = R.Pages.semaine.ID_HORS_PARC;
      App.ouvrir(p.page);
    }
    racine = h('div', { class: 'aide-fen nouveautes' },
      h('h2', null, annonce ? 'Quoi de neuf ?' : 'Nouveautés'),
      annonce ? h('p', { class: 'aide-quoi' }, 'L’application a été mise à jour. Voici ce qui change pour vous :') : null,
      versions.map(function (v) {
        return h('section', { class: 'nouv-version' },
          h('h3', null, 'Version ' + v.version, h('span', { class: 'nouv-date' }, N.dateLongue(v.date))),
          h('ul', { class: 'nouv-points' }, v.points.map(function (p) {
            return h('li', null,
              h('span', { class: 'nouv-type nouv-' + p.type }, N.TYPES[p.type]),
              h('span', null, I.texte(p.texte),
                p.page && App.donnees ? h('button', { class: 'btn btn-petit', onclick: function () { voir(p); } }, 'Voir') : null,
                p.guide ? lienGuide(p.guide, 'En savoir plus', 'lien-guide nouv-lien') : null));
          })));
      }),
      annonce ? h('p', { class: 'petit' }, 'À relire quand vous voulez : bouton « ? Aide » › Nouveautés.') : null);
    App.fenetre(racine, [{ texte: annonce ? 'J’ai compris' : 'Fermer', valeur: 'ok', classe: 'btn-principal', focus: true }],
      surFin || function () {}, 'dialogue-aide');
  }
  function historique() { nouveautes(N.publiees(M.VERSION_APP), false); }

  // Au démarrage : annonce une seule fois, dans ce navigateur, les versions sorties depuis la dernière vue.
  // Rien de noté : base déjà présente = utilisée avant la 1.1 (pas encore de fenêtre) ; sinon premier démarrage, rien à annoncer.
  function annoncer() {
    var vue = S.versionVue() || (App.donnees ? '1.0' : M.VERSION_APP);
    var liste = N.aAnnoncer(vue, M.VERSION_APP);
    function vu() { S.sauverVersionVue(M.VERSION_APP); }
    if (liste.length && App.donnees) nouveautes(liste, true, vu);
    else vu();
  }

  // Touche F1 = aide de la page affichée (pas pendant qu'une fenêtre est ouverte).
  function init() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'F1' || !App.donnees || document.querySelector('dialog[open]')) return;
      e.preventDefault();
      aidePage(typeActif());
    });
  }

  R.AideUi = { aidePage: aidePage, menu: menu, boutonTitre: boutonTitre, presentation: presentation, init: init, lienGuide: lienGuide,
    nouveautes: historique, annoncer: annoncer };
})(window.Recueil = window.Recueil || {});
