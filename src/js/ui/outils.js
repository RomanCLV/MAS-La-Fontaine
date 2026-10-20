/* Outils d'affichage partagés (interface et impression). */
(function (R) {
  'use strict';
  var M = R.Modele;

  // Crée un élément : h('div', {class: 'x', onclick: fn}, 'texte', autreElement, [liste]).
  // Le texte passe par textContent : aucune donnée n'est interprétée comme du HTML.
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'class') el.className = v;
        else if (k === 'style') el.style.cssText = v;
        else if (k === 'value' || k === 'checked' || k === 'selected' || k === 'disabled') el[k] = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) ajouter(el, arguments[i]);
    return el;
  }
  function ajouter(el, enfant) {
    if (enfant === null || enfant === undefined || enfant === false) return;
    if (Array.isArray(enfant)) { enfant.forEach(function (e) { ajouter(el, e); }); return; }
    el.appendChild(enfant instanceof Node ? enfant : document.createTextNode(String(enfant)));
  }

  // Icône crayon (trait, sans emoji).
  function iconeCrayon() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '14'); svg.setAttribute('height', '14'); svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', 'M4 20h4L19 9l-4-4L4 16v4z');
    svg.appendChild(p);
    return svg;
  }

  // Texte noir ou blanc selon la couleur de fond (lisibilité des couleurs administrées).
  function texteSur(fond) {
    var m = /^#?([0-9a-f]{6})$/i.exec(fond || '');
    if (!m) return '#111';
    var n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 140 ? '#111' : '#fff';
  }

  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  function jourMois(iso) { return +iso.slice(8, 10); }
  function dateLongue(iso) { return jourMois(iso) + ' ' + MOIS[+iso.slice(5, 7) - 1] + ' ' + iso.slice(0, 4); }
  function dateCourte(iso) { return ('0' + jourMois(iso)).slice(-2) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4); }
  function titreSemaine(s) {
    var fin = M.ajouterJours(s.debut, 6);
    return 'Semaine ' + M.numeroSemaine(s.debut).numero + ' · du ' + jourMois(s.debut) + ' au ' + jourMois(fin) + ' ' +
      MOIS_C[+fin.slice(5, 7) - 1] + ' ' + fin.slice(0, 4);
  }
  function heure(ts) {
    var d = new Date(ts);
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function pluriel(n, mot, motPluriel) { return n + ' ' + (n > 1 ? (motPluriel || mot + 's') : mot); }
  // « 2 semaines (S42, S43) · 30 résidents actifs · 5 parcs »
  function resumeDonnees(d) {
    var s = d.semaines.map(function (x) { return 'S' + M.numeroSemaine(x.debut).numero; }).join(', ');
    return pluriel(d.semaines.length, 'semaine') + ' (' + s + ') · ' + pluriel(d.residents.filter(function (r) { return !r.archive; }).length, 'résident actif', 'résidents actifs') +
      ' · ' + pluriel(d.referentiels.parcs.length, 'parc');
  }

  // Colonnes des tableaux résidents (textures, régimes, options) : groupes = Modele.groupesRegimes.
  // colonnes : liste à plat ; debut(g) : vrai pour la 1re colonne d'un groupe (trait de séparation) ;
  // bandeaux(gabarit, avant) : ligne au-dessus des en-têtes, un bloc par groupe ; avant = cellules des colonnes qui précèdent.
  function colonnesGroupees(groupes) {
    var debuts = groupes.map(function (gr) { return gr.regimes[0].id; });
    return {
      colonnes: [].concat.apply([], groupes.map(function (gr) { return gr.regimes; })),
      debut: function (g) { return debuts.indexOf(g.id) >= 0; },
      bandeaux: function (gabarit, avant) {
        return h('div', { class: 'g g-groupes', style: gabarit }, avant,
          groupes.map(function (gr) {
            return h('div', { class: 'gg', style: 'grid-column:span ' + gr.regimes.length, title: gr.nom }, gr.nom.toUpperCase());
          }));
      }
    };
  }

  R.h = h;
  R.Outils = {
    iconeCrayon: iconeCrayon, texteSur: texteSur, dateLongue: dateLongue, dateCourte: dateCourte,
    titreSemaine: titreSemaine, heure: heure, pluriel: pluriel, resumeDonnees: resumeDonnees, MOIS: MOIS, colonnesGroupees: colonnesGroupees
  };
})(window.Recueil = window.Recueil || {});
