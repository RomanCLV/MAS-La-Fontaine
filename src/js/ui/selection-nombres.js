/* Cases de quantité de la page Semaine (onglet Hors parc, salariés des onglets de parc) : sélection « façon Excel ».
   Un clic sélectionne une case, glisser sélectionne un rectangle (lignes × créneaux affichés), Maj+clic l'étend ;
   on écrit en tapant un chiffre, en double-cliquant ou avec Entrée : le nombre va dans toutes les cases sélectionnées ;
   flèches = déplacer, Maj+flèches = étendre ; Suppr vide ; Échap désélectionne.
   Copier / couper / coller (Ctrl+C / X / V) internes à l'appli : pas de lien avec le presse-papiers du système.
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
  function borner(p, nl, nk) { return { i: Math.max(0, Math.min(nl - 1, p.i)), k: Math.max(0, Math.min(nk - 1, p.k)) }; }
  // Flèche : déplace la case active (sélection d'une seule case) ; avec Maj, déplace le coin opposé (sélection étendue).
  // nl × nk : taille de la grille (on reste dedans).
  function deplacer(s, di, dk, etendre, nl, nk) {
    if (etendre) return { ancre: s.ancre, fin: borner({ i: s.fin.i + di, k: s.fin.k + dk }, nl, nk) };
    var p = borner({ i: s.ancre.i + di, k: s.ancre.k + dk }, nl, nk);
    return { ancre: p, fin: p };
  }
  // Copier : valeurs du rectangle, ligne par ligne (lire(i, k) donne la valeur d'une case).
  function extraire(r, lire) {
    var b = [];
    for (var i = r.i0; i <= r.i1; i++) {
      var l = [];
      for (var k = r.k0; k <= r.k1; k++) l.push(lire(i, k));
      b.push(l);
    }
    return b;
  }
  // Coller le bloc copié dans la sélection r d'une grille nl × nk : à partir du coin haut-gauche, ce qui dépasse
  // de la grille est ignoré ; une seule valeur copiée remplit toute la sélection. Renvoie les cases { i, k, v }
  // à écrire et le rectangle collé (nouvelle sélection).
  function coller(r, bloc, nl, nk) {
    if (bloc.length === 1 && bloc[0].length === 1) {
      return { cases: cases(r).map(function (x) { return { i: x.i, k: x.k, v: bloc[0][0] }; }), rect: r };
    }
    var dest = { i0: r.i0, i1: Math.min(nl - 1, r.i0 + bloc.length - 1), k0: r.k0, k1: Math.min(nk - 1, r.k0 + bloc[0].length - 1) };
    return { cases: cases(dest).map(function (x) { return { i: x.i, k: x.k, v: bloc[x.i - r.i0][x.k - r.k0] }; }), rect: dest };
  }
  // Valeur saisie nettoyée comme avant : entier ≥ 0 (0 = case vide, entrée supprimée).
  function nettoyer(v) { return Math.max(0, Math.floor(+v || 0)); }

  // ---------- État (une seule sélection dans l'appli) ----------
  var sel = null;       // { cle, ancre, fin } ; cle = grille affichée (page, parc, semaine, créneaux affichés)
  var courant = null;   // dernière grille construite (celle affichée)
  var glisse = false;   // glissement de souris en cours
  var ecoute = false;   // écouteurs du document posés (seulement si une sélection est active)
  var MARGE = 30;       // px : près du bord de la grille, le glisser la fait défiler
  // Copie interne : { bloc, cle, rect (cases marquées en pointillés), coupe, source : cases à vider au collage
  // (couper), donnees }. Gardée au changement d'onglet (on peut coller dans un autre parc) ; Échap l'oublie.
  var pressePapiers = null;

  // opts : { cle, semaine, libelle et lieu (historique Ctrl+Z, cf. historique.js), creneaux (affichés),
  //   apres() : mise à jour sur place des totaux après une modification }.
  function grille(opts) {
    var g = { cle: opts.cle, semaine: opts.semaine, libelle: opts.libelle, lieu: opts.lieu, creneaux: opts.creneaux, apres: opts.apres,
      lignes: [], cellules: [], edition: null };
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
    var pp = pressePapiers;
    el.classList.toggle('copie', !!pp && pp.cle === g.cle && contient(pp.rect, i, k));
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
    if (g && avant && avant.cle === g.cle && g.edition) fermerEdition(g);  // avant sel = null : remet les aperçus
    sel = null;
    ecouter(false);
    if (!g || !avant || avant.cle !== g.cle) return;
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
    // Case sous le pointeur, ramené dans la zone visible des cases (on peut glisser au-delà du bord).
    function suivre() {
      var gauche = bordGauche(g, defil), droite = defil.getBoundingClientRect().right;
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
  // Bord gauche utile de la grille : après les colonnes collées (étiquettes), qui recouvrent les créneaux en défilant.
  function bordGauche(g, defil) {
    var d = defil.getBoundingClientRect().left;
    g.cellules[0][0].parentNode.querySelectorAll('.colle0, .colle1').forEach(function (el) {
      d = Math.max(d, el.getBoundingClientRect().right);
    });
    return d;
  }
  // Fait défiler la grille (et la page) pour que la case p soit visible.
  function montrer(g, p) {
    var el = g.cellules[p.i][p.k], defil = el.closest('.defil'), main = el.closest('main'), r = el.getBoundingClientRect();
    if (defil) {
      var gauche = bordGauche(g, defil), droite = defil.getBoundingClientRect().right;
      if (r.left < gauche) defil.scrollLeft -= gauche - r.left;
      else if (r.right > droite) defil.scrollLeft += r.right - droite;
    }
    if (main) {
      var m = main.getBoundingClientRect();
      if (r.top < m.top) main.scrollTop -= m.top - r.top;
      else if (r.bottom > m.bottom) main.scrollTop += r.bottom - m.bottom;
    }
  }
  function bouger(g, di, dk, etendre) {
    var n = deplacer(sel, di, dk, etendre, g.lignes.length, g.creneaux.length);
    choisir(g, n.ancre, n.fin);
    focaliser(g, n.ancre);
    montrer(g, n.fin);
  }
  var FLECHES = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

  function positionAu(g, x, y) {
    var i = g.cellules.length - 1, l0 = g.cellules[0], k = l0.length - 1, a;
    for (a = 0; a < g.cellules.length; a++) if (y < g.cellules[a][0].getBoundingClientRect().bottom) { i = a; break; }
    for (a = 0; a < l0.length; a++) if (x < l0[a].getBoundingClientRect().right) { k = a; break; }
    return { i: i, k: k };
  }

  // ---------- Saisie : dans la case active, écrite dans toutes les cases sélectionnées ----------
  // depart : chiffre tapé (il remplace la valeur) ou null (double-clic, Entrée, F2 : on modifie la valeur actuelle).
  // Pendant la frappe, les autres cases sélectionnées montrent en aperçu le nombre qui y sera écrit.
  function editer(g, depart) {
    if (g.edition || !sel) return;
    var p = sel.ancre, el = g.cellules[p.i][p.k], v = valeur(g, p.i, p.k);
    var champ = R.h('input', {
      class: 'nb nb-edition', type: 'text', inputmode: 'numeric', autocomplete: 'off',
      'aria-label': el.getAttribute('aria-label'), value: depart !== null ? depart : (v ? String(v) : ''),
      oninput: function () { var t = champ.value.replace(/\D/g, ''); if (t !== champ.value) champ.value = t; apercu(g); },
      // Les touches de la saisie ne remontent pas au document (sinon Entrée rouvrirait la saisie aussitôt).
      // Saisie commencée par un chiffre : une flèche valide et déplace la sélection (sinon elle déplace le curseur).
      onkeydown: function (e) {
        var fl = FLECHES[e.key];
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); valider(g); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); annuler(g); }
        else if (fl && depart !== null) {
          e.preventDefault(); e.stopPropagation();
          valider(g);
          if (sel) bouger(actuelle(g), fl[0], fl[1], e.shiftKey);
        }
      },
      // Clic ailleurs, autre fenêtre : la saisie est gardée (comme Excel).
      onblur: function () { if (g.edition && g.edition.champ === champ) valider(g); }
    });
    g.edition = { champ: champ };
    el.textContent = '';
    el.appendChild(champ);
    champ.focus({ preventScroll: true });
    if (depart === null) champ.select();
    apercu(g);
  }
  function apercu(g) {
    var n = nettoyer(g.edition.champ.value);
    cases(rectangle(sel.ancre, sel.fin)).forEach(function (x) {
      if (x.i === sel.ancre.i && x.k === sel.ancre.k) return;
      var el = g.cellules[x.i][x.k];
      el.classList.add('nb-apercu');
      el.textContent = n ? String(n) : '';
    });
  }
  function fermerEdition(g) {
    var ed = g.edition;
    g.edition = null;
    ed.champ.remove();
    if (sel) cases(rectangle(sel.ancre, sel.fin)).forEach(function (x) {
      g.cellules[x.i][x.k].classList.remove('nb-apercu');
      afficher(g, x.i, x.k);
    });
  }
  function valider(g) {
    if (!g.edition) return;
    var n = nettoyer(g.edition.champ.value);
    fermerEdition(g);
    if (!sel) return;
    focaliser(g, sel.ancre);
    ecrire(g, cases(rectangle(sel.ancre, sel.fin)).map(function (x) { return { i: x.i, k: x.k, v: n }; }));
  }
  function annuler(g) {
    if (!g.edition) return;
    fermerEdition(g);
    if (sel) focaliser(g, sel.ancre);
  }

  // Changement d'une case pour l'historique (Ctrl+Z) : lire / écrire sa valeur, v = nouvelle valeur.
  function changement(lire, ecrireCase, c, v) {
    return { lire: function () { return lire(c); }, ecrire: function (n) { ecrireCase(c, n); }, v: v };
  }
  // Écrit les valeurs { i, k, v } en un seul enregistrement (annulable) ; renvoie le nombre de cases changées.
  // avant : changements à faire d'abord (couper : cases d'origine vidées).
  function ecrire(g, liste, avant) {
    var n = R.Historique.modifier(g.semaine, g.libelle, g.lieu, (avant || []).concat(liste.map(function (x) {
      return changement(g.lignes[x.i].lire, g.lignes[x.i].ecrire, g.creneaux[x.k], x.v);
    })), { sansRendu: true });
    if (!n) return 0;
    g.cellules.forEach(function (l, i) { l.forEach(function (el, k) { afficher(g, i, k); }); });
    if (g.apres) g.apres();
    return n;
  }
  function vider(g) {
    var n = ecrire(g, cases(rectangle(sel.ancre, sel.fin)).map(function (x) { return { i: x.i, k: x.k, v: 0 }; }));
    if (n > 1) R.App.toast(n + ' cases vidées');
  }

  // ---------- Copier / couper / coller (internes) ----------
  // Couper : comme Excel, les cases d'origine ne sont vidées qu'au collage (rien n'est perdu sans coller).
  function copier(g, coupe) {
    var r = rectangle(sel.ancre, sel.fin), n = (r.i1 - r.i0 + 1) * (r.k1 - r.k0 + 1);
    pressePapiers = {
      bloc: extraire(r, function (i, k) { return valeur(g, i, k); }), cle: g.cle, rect: r, coupe: coupe, donnees: R.App.donnees,
      source: coupe ? cases(r).map(function (x) { return { i: x.i, k: x.k, lire: g.lignes[x.i].lire, ecrire: g.lignes[x.i].ecrire, c: g.creneaux[x.k] }; }) : []
    };
    dessiner(g);
    R.App.toast(n + (n > 1 ? ' cases ' : ' case ') + (coupe ? 'coupée' : 'copiée') + (n > 1 ? 's' : '') + ' : Ctrl+V pour coller');
  }
  function collerIci(g) {
    var pp = pressePapiers;
    if (!pp) return;
    var res = coller(rectangle(sel.ancre, sel.fin), pp.bloc, g.lignes.length, g.creneaux.length);
    // Couper : cases d'origine vidées d'abord, sauf celles que le collage recouvre (si les données n'ont pas été remplacées).
    var vider = pp.donnees !== R.App.donnees ? [] : pp.source.filter(function (x) {
      return !(pp.cle === g.cle && contient(res.rect, x.i, x.k));
    }).map(function (x) { return changement(x.lire, x.ecrire, x.c, 0); });
    if (pp.coupe) pressePapiers = null;
    choisir(g, { i: res.rect.i0, k: res.rect.k0 }, { i: res.rect.i1, k: res.rect.k1 });
    focaliser(g, sel.ancre);
    ecrire(g, res.cases, vider);
  }

  // ---------- Clavier et clic ailleurs : écoutés seulement quand une sélection est active ----------
  function clavier(e) {
    var g = courant;
    if (!sel || !g || sel.cle !== g.cle || e.altKey) return;
    if (document.querySelector('dialog[open]')) return;
    // Jamais pendant une saisie ni quand le focus est dans un autre champ (recherche…) ou sur un bouton.
    var a = document.activeElement;
    if (a && a !== document.body && !estCase(g, a)) return;
    if (e.ctrlKey || e.metaKey) {
      var touche = e.key.toLowerCase();
      if (touche === 'c' || touche === 'x') { e.preventDefault(); copier(g, touche === 'x'); }
      else if (touche === 'v') { e.preventDefault(); collerIci(g); }
      return;
    }
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); editer(g, e.key); }
    else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); editer(g, null); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); vider(g); }
    // Échap : plus de sélection, et la copie en attente est oubliée (comme Excel).
    else if (e.key === 'Escape') { e.preventDefault(); pressePapiers = null; effacer(); }
    else if (FLECHES[e.key]) { e.preventDefault(); bouger(g, FLECHES[e.key][0], FLECHES[e.key][1], e.shiftKey); }
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
    logique: { rectangle: rectangle, contient: contient, cases: cases, borner: borner, deplacer: deplacer, extraire: extraire, coller: coller, nettoyer: nettoyer }
  };
})(window.Recueil = window.Recueil || {});
