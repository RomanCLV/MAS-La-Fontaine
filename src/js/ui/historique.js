/* Annuler / rétablir (Ctrl+Z / Ctrl+Y ou Ctrl+Maj+Z) les saisies de cases de la page Semaine :
   cases de présence des résidents et cases de quantité (salariés, Hors parc), dans un même historique.
   Un historique par semaine, en mémoire seulement (perdu en fermant la page), 100 actions au plus.
   Une action = une liste de changements { ecrire(v), avant, apres } : annuler réécrit « avant », rétablir « apres ». */
(function (R) {
  'use strict';

  var MAX = 100;

  // ---------- Logique pure (testée dans tests.html) ----------
  // Pile d'actions : une nouvelle action efface ce qui pouvait être rétabli.
  function pile() {
    var faites = [], defaites = [];
    return {
      ajouter: function (a) { faites.push(a); if (faites.length > MAX) faites.shift(); defaites = []; },
      annuler: function () { var a = faites.pop(); if (a) defaites.push(a); return a; },
      refaire: function () { var a = defaites.pop(); if (a) faites.push(a); return a; },
      tailles: function () { return [faites.length, defaites.length]; }
    };
  }
  // changements : [{ lire(), ecrire(v), v }] → changements réels { ecrire, avant, apres } (cases déjà à la bonne valeur ignorées).
  function preparer(changements) {
    return changements.filter(function (x) { return x.lire() !== x.v; })
      .map(function (x) { return { ecrire: x.ecrire, avant: x.lire(), apres: x.v }; });
  }
  // Annuler : dans l'ordre inverse (une case changée deux fois retrouve sa toute première valeur).
  function appliquer(liste, sens) {
    (sens === 'avant' ? liste.slice().reverse() : liste).forEach(function (x) { x.ecrire(x[sens]); });
  }

  // ---------- Historique des semaines ----------
  var piles = {}, donnees = null;
  // Données remplacées (import, nouvelle base) : l'historique ne vaut plus rien.
  function verifier() {
    if (donnees !== R.App.donnees) { piles = {}; donnees = R.App.donnees; }
  }

  // Enregistre une saisie de la semaine s : un seul App.modifier, ajouté à l'historique.
  // libelle : « présences », « salariés »… ; lieu : onglet de la page Semaine (id du parc, '@horsparc'), ou null.
  // Rien ne change : pas d'enregistrement (mais re-rendu, sauf { sansRendu }). Renvoie le nombre de cases changées.
  function modifier(s, libelle, lieu, changements, opts) {
    verifier();
    var liste = preparer(changements);
    if (!liste.length) {
      if (!(opts && opts.sansRendu)) R.App.rendre();
      return 0;
    }
    R.App.modifier(function () { appliquer(liste, 'apres'); }, opts);
    (piles[s.id] = piles[s.id] || pile()).ajouter({ libelle: libelle, lieu: lieu, changements: liste });
    return liste.length;
  }

  // Ctrl+Z (refaire = false) / Ctrl+Y (true) sur la page Semaine : semaine affichée, retour sur l'onglet de la saisie.
  function annuler(refaire) {
    var App = R.App, o = App.ongletActif();
    verifier();
    var p = piles[o.id], a = p && (refaire ? p.refaire() : p.annuler());
    if (!a) return;
    var lieu = a.lieu === '@horsparc' ? 'Hors parc' : a.lieu && R.Modele.parc(App.donnees, a.lieu) ? R.Modele.parc(App.donnees, a.lieu).nom : '';
    if (lieu && !(App.etat.rechercheSemaine || '').trim()) { App.ui.parcActif = a.lieu; App.sauverUi(); }
    App.modifier(function () { appliquer(a.changements, refaire ? 'apres' : 'avant'); });
    App.toast((refaire ? 'Rétabli : ' : 'Annulé : ') + a.libelle + (lieu ? ' (' + lieu + ')' : '') + ', ' +
      R.Outils.pluriel(a.changements.length, 'case'));
  }

  // Clavier : seulement sur la page Semaine, jamais dans un champ (la saisie d'un nombre garde son propre Ctrl+Z)
  // ni quand une fenêtre de dialogue est ouverte.
  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || !R.App || !R.App.donnees) return;
    var t = e.key.toLowerCase();
    if (t !== 'z' && t !== 'y') return;
    var o = R.App.ongletActif(), a = document.activeElement;
    if (!o || o.type !== 'semaine' || document.querySelector('dialog[open]')) return;
    if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return;
    e.preventDefault();
    annuler(t === 'y' || e.shiftKey);
  });

  R.Historique = { modifier: modifier, annuler: annuler, logique: { pile: pile, preparer: preparer, appliquer: appliquer } };
})(window.Recueil = window.Recueil || {});
