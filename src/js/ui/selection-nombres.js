/* Cases de quantité de la page Semaine (onglet Hors parc, salariés des onglets de parc) : sélection « façon Excel ».
   Un clic sélectionne une case, glisser sélectionne un rectangle (lignes × créneaux affichés), Maj+clic l'étend ;
   on écrit en tapant un chiffre, en double-cliquant ou avec Entrée ; Suppr vide ; Échap désélectionne.
   Les cases de présence des parcs ont leur propre gestion (page-semaine.js, presser) : ne pas les mélanger.
   La sélection est gardée en coordonnées (n° de ligne, n° de créneau affiché) : elle survit à un re-rendu. */
(function (R) {
  'use strict';

  // ---------- Logique pure (testée dans tests.html) ----------
  // Position : { i: n° de ligne, k: n° de créneau affiché }. Sélection : { ancre (case active), fin (coin opposé) }.
  function rectangle(a, b) {
    return { i0: Math.min(a.i, b.i), i1: Math.max(a.i, b.i), k0: Math.min(a.k, b.k), k1: Math.max(a.k, b.k) };
  }
  function contient(r, i, k) { return i >= r.i0 && i <= r.i1 && k >= r.k0 && k <= r.k1; }
  // Cases du rectangle, ligne par ligne.
  function cases(r) {
    var l = [];
    for (var i = r.i0; i <= r.i1; i++) for (var k = r.k0; k <= r.k1; k++) l.push({ i: i, k: k });
    return l;
  }
  // Valeur saisie nettoyée comme avant : entier ≥ 0 (0 = case vide, entrée supprimée).
  function nettoyer(v) { return Math.max(0, Math.floor(+v || 0)); }

  // ---------- État (une seule sélection dans l'appli) ----------
  var sel = null;       // { cle, ancre, fin } ; cle = grille affichée (page, parc, semaine, créneaux affichés)
  var courant = null;   // dernière grille construite (celle affichée)
  var glisse = false;   // glissement de souris en cours
  var ecoute = false;   // écouteurs du document posés (seulement si une sélection est active)
  var MARGE = 30;       // px : près du bord de la grille, le glisser la fait défiler

  // opts : { cle, creneaux (affichés), apres() : mise à jour sur place des totaux après une modification }.
  function grille(opts) {
    var g = { cle: opts.cle, creneaux: opts.creneaux, apres: opts.apres, lignes: [], cellules: [], edition: null };
    if (sel && sel.cle !== g.cle) effacer();
    courant = g;
    // lire(c) / ecrire(c, n) : accès au champ de la semaine pour le créneau c. Renvoie le n° de la ligne.
    g.ligne = function (libelle, lire, ecrire) {
      g.lignes.push({ libelle: libelle, lire: lire, ecrire: ecrire });
      g.cellules.push([]);
      return g.lignes.length - 1;
    };
    g.cellule = function (i, k, classe) { return cellule(g, i, k, classe); };
    return g;
  }

  function cellule(g, i, k, classe) {
    var el = R.h('div', {
      class: 'gc nbc ' + (classe || ''), tabindex: '0',
      'aria-label': g.lignes[i].libelle + ' · ' + R.Calc.libelleCreneaux([g.creneaux[k]]),
      onpointerdown: function (e) { presser(g, e, i, k); },
      ondblclick: function () { var a = actuelle(g); if (sel && sel.cle === a.cle) editer(a, null); },
      // Tab depuis le clavier : la case qui reçoit le focus devient la sélection.
      onfocus: function () { if (!glisse && !(sel && sel.cle === g.cle && contient(rectangle(sel.ancre, sel.fin), i, k))) choisir(g, { i: i, k: k }, { i: i, k: k }); }
    });
    g.cellules[i][k] = el;
    afficher(g, i, k);
    dessinerCase(g, i, k);
    return el;
  }
  // La grille a pu être reconstruite pendant un évènement (ligne de texture apparue) : on prend la nouvelle.
  function actuelle(g) { return courant && courant.cle === g.cle ? courant : g; }
  function estCase(g, el) { return !!el && g.cellules.some(function (l) { return l.indexOf(el) >= 0; }); }
  function valeur(g, i, k) { return g.lignes[i].lire(g.creneaux[k]); }
  function afficher(g, i, k) {
    var v = valeur(g, i, k);
    g.cellules[i][k].textContent = v ? String(v) : '';
  }

  // ---------- Dessin de la sélection ----------
  // Cases sélectionnées sur fond bleu clair, case active en blanc, cadre autour du rectangle.
  function dessinerCase(g, i, k) {
    var el = g.cellules[i][k], r = sel && sel.cle === g.cle ? rectangle(sel.ancre, sel.fin) : null;
    var dedans = !!r && contient(r, i, k);
    el.classList.toggle('sel', dedans);
    el.classList.toggle('ancre', dedans && sel.ancre.i === i && sel.ancre.k === k);
    el.classList.toggle('sel-h', dedans && i === r.i0);
    el.classList.toggle('sel-b', dedans && i === r.i1);
    el.classList.toggle('sel-g', dedans && k === r.k0);
    el.classList.toggle('sel-d', dedans && k === r.k1);
    el.setAttribute('aria-selected', dedans ? 'true' : 'false');
  }
  function dessiner(g) {
    g.cellules.forEach(function (l, i) { l.forEach(function (el, k) { dessinerCase(g, i, k); }); });
  }

  function choisir(g, ancre, fin) {
    sel = { cle: g.cle, ancre: ancre, fin: fin };
    ecouter(true);
    dessiner(g);
  }
  // Désélectionne (Échap, clic ailleurs, changement d'onglet, de page, de semaine) ; une saisie en cours est abandonnée.
  function effacer() {
    var g = courant, avant = sel;
    sel = null;
    ecouter(false);
    if (!g || !avant || avant.cle !== g.cle) return;
    if (g.edition) fermerEdition(g);
    dessiner(g);
  }
  function focaliser(g, p) {
    var el = g.cellules[p.i] && g.cellules[p.i][p.k];
    if (el && el.isConnected) el.focus({ preventScroll: true });
  }

  // ---------- Souris : clic, Maj+clic, glisser (rectangle), défilement près du bord ----------
  function presser(g, e, i, k) {
    if (e.button !== 0) return;
    g = actuelle(g);
    if (g.edition) {
      if (e.target === g.edition.champ) return;
      valider(g);
      g = actuelle(g);
    }
    e.preventDefault();
    var ancre = e.shiftKey && sel && sel.cle === g.cle ? sel.ancre : { i: i, k: k };
    glisse = true;
    choisir(g, ancre, { i: i, k: k });
    focaliser(g, ancre);

    var defil = g.cellules[i][k].closest('.defil');
    var x = e.clientX, y = e.clientY, vitesse = 0, anim = 0;
    // Bord gauche utile : après les colonnes collées (étiquettes), qui recouvrent les créneaux en défilant.
    function bordGauche() {
      var d = defil.getBoundingClientRect().left;
      g.cellules[0][0].parentNode.querySelectorAll('.colle0, .colle1').forEach(function (el) {
        d = Math.max(d, el.getBoundingClientRect().right);
      });
      return d;
    }
    // Case sous le pointeur, ramené dans la zone visible des cases (on peut glisser au-delà du bord).
    function suivre() {
      var gauche = bordGauche(), droite = defil.getBoundingClientRect().right;
      var fin = positionAu(g, Math.max(gauche + 1, Math.min(droite - 1, x)), y);
      if (fin.i !== sel.fin.i || fin.k !== sel.fin.k) { sel.fin = fin; dessiner(g); }
      vitesse = x < gauche + MARGE ? -Math.min(20, Math.ceil((gauche + MARGE - x) / 3))
        : x > droite - MARGE ? Math.min(20, Math.ceil((x - droite + MARGE) / 3)) : 0;
      if (vitesse && !anim) anim = requestAnimationFrame(defiler);
    }
    function defiler() {
      anim = 0;
      if (!vitesse || !glisse) return;
      var avant = defil.scrollLeft;
      defil.scrollLeft += vitesse;
      if (defil.scrollLeft !== avant) suivre();
    }
    function bouger(ev) { x = ev.clientX; y = ev.clientY; if (sel) suivre(); }
    function relacher() {
      glisse = false;
      if (anim) cancelAnimationFrame(anim);
      document.removeEventListener('pointermove', bouger);
      document.removeEventListener('pointerup', relacher);
      document.removeEventListener('pointercancel', relacher);
    }
    document.addEventListener('pointermove', bouger);
    document.addEventListener('pointerup', relacher);
    document.addEventListener('pointercancel', relacher);
  }
  function positionAu(g, x, y) {
    var i = g.cellules.length - 1, l0 = g.cellules[0], k = l0.length - 1, a;
    for (a = 0; a < g.cellules.length; a++) if (y < g.cellules[a][0].getBoundingClientRect().bottom) { i = a; break; }
    for (a = 0; a < l0.length; a++) if (x < l0[a].getBoundingClientRect().right) { k = a; break; }
    return { i: i, k: k };
  }

  // ---------- Saisie dans la case active ----------
  // depart : chiffre tapé (il remplace la valeur) ou null (double-clic, Entrée : on modifie la valeur actuelle).
  function editer(g, depart) {
    if (g.edition || !sel) return;
    var p = sel.ancre, el = g.cellules[p.i][p.k], v = valeur(g, p.i, p.k);
    var champ = R.h('input', {
      class: 'nb nb-edition', type: 'text', inputmode: 'numeric', autocomplete: 'off',
      'aria-label': el.getAttribute('aria-label'), value: depart !== null ? depart : (v ? String(v) : ''),
      oninput: function () { var t = champ.value.replace(/\D/g, ''); if (t !== champ.value) champ.value = t; },
      // Les touches de la saisie ne remontent pas au document (sinon Entrée rouvrirait la saisie aussitôt).
      onkeydown: function (e) {
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); valider(g); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); annuler(g); }
      },
      // Clic ailleurs, autre fenêtre : la saisie est gardée (comme Excel).
      onblur: function () { if (g.edition && g.edition.champ === champ) valider(g); }
    });
    g.edition = { champ: champ };
    el.textContent = '';
    el.appendChild(champ);
    champ.focus({ preventScroll: true });
    if (depart === null) champ.select();
  }
  function fermerEdition(g) {
    var ed = g.edition;
    g.edition = null;
    ed.champ.remove();
    if (sel) afficher(g, sel.ancre.i, sel.ancre.k);
  }
  function valider(g) {
    if (!g.edition) return;
    var n = nettoyer(g.edition.champ.value);
    fermerEdition(g);
    if (!sel) return;
    focaliser(g, sel.ancre);
    ecrire(g, [{ i: sel.ancre.i, k: sel.ancre.k, v: n }]);
  }
  function annuler(g) {
    if (!g.edition) return;
    fermerEdition(g);
    if (sel) focaliser(g, sel.ancre);
  }

  // Écrit les valeurs { i, k, v } en un seul enregistrement ; renvoie le nombre de cases changées.
  function ecrire(g, liste) {
    var a = liste.filter(function (x) { return valeur(g, x.i, x.k) !== x.v; });
    if (!a.length) return 0;
    R.App.modifier(function () {
      a.forEach(function (x) { g.lignes[x.i].ecrire(g.creneaux[x.k], x.v); });
    }, { sansRendu: true });
    a.forEach(function (x) { afficher(g, x.i, x.k); });
    if (g.apres) g.apres();
    return a.length;
  }
  function vider(g) {
    var n = ecrire(g, cases(rectangle(sel.ancre, sel.fin)).map(function (x) { return { i: x.i, k: x.k, v: 0 }; }));
    if (n > 1) R.App.toast(n + ' cases vidées');
  }

  // ---------- Clavier et clic ailleurs : écoutés seulement quand une sélection est active ----------
  function clavier(e) {
    var g = courant;
    if (!sel || !g || sel.cle !== g.cle || e.altKey || e.ctrlKey || e.metaKey) return;
    if (document.querySelector('dialog[open]')) return;
    // Jamais pendant une saisie ni quand le focus est dans un autre champ (recherche…) ou sur un bouton.
    var a = document.activeElement;
    if (a && a !== document.body && !estCase(g, a)) return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); editer(g, e.key); }
    else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); editer(g, null); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); vider(g); }
    else if (e.key === 'Escape') { e.preventDefault(); effacer(); }
  }
  function ailleurs(e) {
    var g = courant;
    if (!g || estCase(g, e.target.closest && e.target.closest('.nbc'))) return;
    if (g.edition && e.target === g.edition.champ) return;
    if (e.target.classList && e.target.classList.contains('defil')) return;  // barre de défilement de la grille
    if (g.edition) valider(g);
    effacer();
  }
  // Le focus part ailleurs (Tab vers un bouton, la recherche, une fenêtre) : on désélectionne.
  function focusAilleurs(e) {
    var g = courant;
    if (g && !estCase(g, e.target) && !(g.edition && e.target === g.edition.champ)) effacer();
  }
  function ecouter(oui) {
    if (oui === ecoute) return;
    ecoute = oui;
    var f = oui ? 'addEventListener' : 'removeEventListener';
    document[f]('keydown', clavier);
    document[f]('pointerdown', ailleurs, true);
    document[f]('focusin', focusAilleurs);
  }

  // Appelé à la fin de chaque App.rendre : grille disparue (autre onglet, page, semaine) ⇒ plus de sélection ;
  // grille reconstruite ⇒ la case active reprend le focus (si rien d'autre ne l'a).
  function apresRendu() {
    var g = courant;
    if (!g) return;
    if (!g.cellules.length || !g.cellules[0][0] || !g.cellules[0][0].isConnected) {
      effacer();
      courant = null;
      return;
    }
    var a = document.activeElement;
    if (sel && sel.cle === g.cle && (!a || a === document.body)) focaliser(g, sel.ancre);
  }

  R.SelectionNombres = {
    grille: grille,
    apresRendu: apresRendu,
    logique: { rectangle: rectangle, contient: contient, cases: cases, nettoyer: nettoyer }
  };
})(window.Recueil = window.Recueil || {});
