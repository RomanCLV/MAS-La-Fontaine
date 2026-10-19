/* Page Résidents : liste type TYPOLOGIE CONVIVES ; éditer / archiver / supprimer au survol. */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h, O = R.Outils, App = R.App;

  // Supprime un résident partout (présences, activités, presets).
  function supprimer(id) {
    App.modifier(function (d) {
      d.residents = d.residents.filter(function (r) { return r.id !== id; });
      d.semaines.forEach(function (s) {
        delete s.presences[id];
        s.activites.forEach(function (a) { a.participantIds = a.participantIds.filter(function (x) { return x !== id; }); });
      });
      d.presetsActivites.forEach(function (p) { p.participantIds = p.participantIds.filter(function (x) { return x !== id; }); });
    });
  }
  function confirmerSuppression(r) {
    return window.confirm('Supprimer définitivement ' + M.nomAffiche(r) + ' ?\nSes présences et participations seront effacées. ' +
      'Pour le garder en réserve, utilisez plutôt « Archiver ».');
  }

  function pastille(texte, couleur, classe) {
    return h('span', { class: classe || 'pastille', style: 'background:' + couleur + ';color:' + O.texteSur(couleur) }, texte);
  }

  function lignes(d, filtre) {
    var refs = M.refs(d);
    var q = (filtre.q || '').toLowerCase();
    var liste = d.residents.filter(function (r) {
      if (!!r.archive !== !!filtre.archives) return false;
      if (filtre.parc && r.parcId !== filtre.parc) return false;
      return !q || M.nomAffiche(r).toLowerCase().indexOf(q) >= 0;
    });
    var ordre = {};
    d.referentiels.parcs.forEach(function (p, i) { ordre[p.id] = i; });
    liste.sort(function (a, b) { return (ordre[a.parcId] === undefined ? 99 : ordre[a.parcId]) - (ordre[b.parcId] === undefined ? 99 : ordre[b.parcId]); });
    if (!liste.length) return h('div', { class: 'vide-liste' }, filtre.archives ? 'Aucun résident archivé.' : 'Aucun résident trouvé.');
    return liste.map(function (r) {
      var p = M.parc(d, r.parcId);
      var t = refs[r.textureId];
      return h('div', { class: 'gr' },
        h('span', null, p ? pastille(p.nom, p.couleur, 'etiquette-parc') : h('span', { class: 'erreur' }, 'Parc inconnu')),
        h('span', { class: 'gras' }, M.nomAffiche(r)),
        h('span', null, t ? pastille(t.nom, t.couleur, 'etiquette-parc gras') : r.textureId),
        h('span', null, r.regimeIds.concat(r.optionIds).map(function (id) {
          return refs[id] ? pastille(refs[id].nom, refs[id].couleur, 'pilule') : null;
        })),
        h('span', { class: 'petit' }, r.consigne),
        h('span', { class: 'actions' },
          h('button', { class: 'btn', onclick: function () { App.ouvrir('resident', r.id); } }, 'Éditer'),
          h('button', { class: 'btn', onclick: function () { App.modifier(function () { r.archive = !r.archive; }); } }, r.archive ? 'Réactiver' : 'Archiver'),
          h('button', { class: 'btn btn-danger', onclick: function () { if (confirmerSuppression(r)) supprimer(r.id); } }, 'Supprimer')));
    });
  }

  R.Pages.residents = {
    titre: function () { return 'Résidents'; },
    rendu: function () {
      var d = App.donnees;
      var f = App.etat.residents = App.etat.residents || { q: '', parc: '', archives: false };
      var actifs = d.residents.filter(function (r) { return !r.archive; }).length;
      var zone = h('div', { class: 'liste-corps' }, lignes(d, f));
      function rafraichir() { zone.replaceChildren.apply(zone, [].concat(lignes(d, f))); }
      return h('div', { class: 'page page-large' },
        h('div', { class: 'page-tete' },
          h('h1', null, 'Résidents ', h('span', { class: 'sous' }, '· ' + actifs + ' actifs')),
          h('input', { type: 'search', placeholder: 'Rechercher un nom', 'aria-label': 'Rechercher un nom', value: f.q,
            oninput: function (e) { f.q = e.target.value; rafraichir(); } }),
          h('select', { 'aria-label': 'Parc', onchange: function (e) { f.parc = e.target.value; rafraichir(); } },
            h('option', { value: '' }, 'Tous les parcs'),
            d.referentiels.parcs.map(function (p) { return h('option', { value: p.id, selected: p.id === f.parc }, p.nom); })),
          h('label', { class: 'case' }, h('input', { type: 'checkbox', checked: f.archives,
            onchange: function (e) { f.archives = e.target.checked; rafraichir(); } }), ' Voir les archivés'),
          h('button', { class: 'btn btn-principal', onclick: function () { R.PageResident.nouveau(); } }, '+ Ajouter un résident')),
        h('div', { class: 'liste' },
          h('div', { class: 'gr gr-entete' }, h('span', null, 'Parc'), h('span', null, 'Nom Prénom'), h('span', null, 'Texture'),
            h('span', null, 'Régimes et options'), h('span', null, 'Observation'), h('span')),
          zone),
        h('div', { class: 'petit' }, 'Éditer ouvre la fiche dans un nouvel onglet. Archiver = le résident disparaît de la saisie et des feuilles mais reste récupérable (« Voir les archivés »). Boutons visibles au survol de la ligne.'));
    }
  };

  R.PageResidents = { supprimer: supprimer, confirmerSuppression: confirmerSuppression };
})(window.Recueil = window.Recueil || {});
