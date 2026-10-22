/* Page Résidents : liste type TYPOLOGIE CONVIVES (éditer / archiver / supprimer au survol)
   ou tableau d'édition rapide des textures, régimes et options (enregistré d'un coup). */
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
      if (App.etat.residents) delete App.etat.residents.modifs[id];
    });
  }
  function confirmerSuppression(r) {
    return window.confirm('Supprimer définitivement ' + M.nomAffiche(r) + ' ?\nSes présences et participations seront effacées. ' +
      'Pour le garder en réserve, utilisez plutôt « Archiver ».');
  }

  function pastille(texte, couleur, classe) {
    return h('span', { class: classe || 'pastille', style: 'background:' + couleur + ';color:' + O.texteSur(couleur) }, texte);
  }

  function etat() {
    return App.etat.residents = App.etat.residents || { q: '', parc: '', archives: false, modifs: {} };
  }

  function filtrer(d, filtre) {
    var q = (filtre.q || '').toLowerCase();
    var liste = d.residents.filter(function (r) {
      if (!!r.archive !== !!filtre.archives) return false;
      if (filtre.parc && r.parcId !== filtre.parc) return false;
      return !q || M.nomAffiche(r).toLowerCase().indexOf(q) >= 0;
    });
    var ordre = {};
    d.referentiels.parcs.forEach(function (p, i) { ordre[p.id] = i; });
    function rang(r) { return ordre[r.parcId] === undefined ? 99 : ordre[r.parcId]; }
    return liste.sort(function (a, b) { return rang(a) - rang(b); });
  }

  function aucun(filtre) {
    return h('div', { class: 'vide-liste' }, filtre.archives ? 'Aucun résident archivé.' : 'Aucun résident trouvé.');
  }

  function cellParc(d, r) {
    var p = M.parc(d, r.parcId);
    return p ? pastille(p.nom, p.couleur, 'etiquette-parc') : h('span', { class: 'erreur' }, 'Parc inconnu');
  }

  // ---------- Vue liste ----------
  function lignes(d, filtre) {
    var refs = M.refs(d);
    var liste = filtrer(d, filtre);
    if (!liste.length) return aucun(filtre);
    return liste.map(function (r) {
      var t = refs[r.textureId];
      return h('div', { class: 'gr' },
        h('span', null, cellParc(d, r)),
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

  function vueListe(d, f) {
    return h('div', { class: 'liste' },
      h('div', { class: 'gr gr-entete' }, h('span', null, 'Parc'), h('span', null, 'Nom Prénom'), h('span', null, 'Texture'),
        h('span', null, 'Régimes et options'), h('span', null, 'Observation'), h('span')),
      h('div', { class: 'liste-corps' }, lignes(d, f)));
  }

  // ---------- Vue tableau (brouillon : f.modifs[id] = { textureId, regimeIds, optionIds }) ----------
  function valeurs(f, r) { return f.modifs[r.id] || r; }

  function memes(a, b) { return a.slice().sort().join('|') === b.slice().sort().join('|'); }

  function basculer(f, r, g) {
    var v = valeurs(f, r);
    var n = { textureId: v.textureId, regimeIds: v.regimeIds.slice(), optionIds: v.optionIds.slice() };
    if (g.nature === 'texture') n.textureId = g.id;
    else {
      var cle = g.nature === 'regime' ? 'regimeIds' : 'optionIds';
      if (n[cle].indexOf(g.id) >= 0) n[cle] = n[cle].filter(function (x) { return x !== g.id; }); else n[cle].push(g.id);
    }
    if (n.textureId === r.textureId && memes(n.regimeIds, r.regimeIds) && memes(n.optionIds, r.optionIds)) delete f.modifs[r.id];
    else f.modifs[r.id] = n;
    App.rendre();
  }

  function coche(v, g) {
    if (g.nature === 'texture') return v.textureId === g.id;
    return (g.nature === 'regime' ? v.regimeIds : v.optionIds).indexOf(g.id) >= 0;
  }

  function enregistrerTableau(f) {
    var ids = Object.keys(f.modifs);
    App.modifier(function (d) {
      ids.forEach(function (id) {
        var r = M.resident(d, id), v = f.modifs[id];
        if (!r) return;
        r.textureId = v.textureId; r.regimeIds = v.regimeIds.slice(); r.optionIds = v.optionIds.slice();
        // Une fiche ouverte sans modification se recharge avec les nouvelles valeurs.
        var b = App.brouillons['resident:' + id];
        if (b && !b.modifie) delete App.brouillons['resident:' + id];
      });
      f.modifs = {};
    });
    App.toast(O.pluriel(ids.length, 'résident enregistré', 'résidents enregistrés'));
  }

  function vueTableau(d, f) {
    var groupes = O.colonnesGroupees(M.groupesRegimes(d));
    var cols = groupes.colonnes;
    var gabarit = 'grid-template-columns:110px 200px repeat(' + cols.length + ',40px) minmax(160px,1fr)';
    var liste = filtrer(d, f);
    var bandeaux = groupes.bandeaux(gabarit, [h('div', { class: 'colle0' }), h('div', { class: 'colle1' })]);
    var entete = h('div', { class: 'g g-entete', style: gabarit },
      h('div', { class: 'gh gauche colle0' }, 'Parc'),
      h('div', { class: 'gh gauche colle1' }, 'NOM Prénom'),
      cols.map(function (g) {
        return h('div', { class: 'gh' + (g.nature === 'texture' ? ' texture' : '') + (groupes.debut(g) ? ' debut-groupe' : ''), style: 'background:' + g.couleur + ';color:' + O.texteSur(g.couleur), title: g.nom },
          h('span', { class: 'v' }, (g.abrege || g.nom).toUpperCase()));
      }),
      h('div', { class: 'gh gauche' }, 'OBSERVATION'));
    var corps = liste.map(function (r) {
      var v = valeurs(f, r);
      return h('div', { class: 'g g-ligne' + (f.modifs[r.id] ? ' modifiee' : ''), style: gabarit },
        h('div', { class: 'gc gauche colle0' }, cellParc(d, r)),
        h('div', { class: 'gc gauche gras colle1' },
          h('button', { class: 'crayon', 'aria-label': 'Ouvrir la fiche de ' + M.nomAffiche(r), title: 'Ouvrir la fiche',
            onclick: function () { App.ouvrir('resident', r.id); } }, O.iconeCrayon()),
          h('span', { class: 'coupe' }, M.nomAffiche(r))),
        cols.map(function (g) {
          var on = coche(v, g), avant = coche(r, g);
          return h('button', {
            class: 'tc' + (g.nature === 'texture' ? ' texture' : '') + (groupes.debut(g) ? ' debut-groupe' : '') + (on ? ' on' : '') + (on !== avant ? ' modif' : ''),
            style: on ? 'background:' + g.couleur + ';color:' + O.texteSur(g.couleur) : '',
            'aria-pressed': on ? 'true' : 'false', 'aria-label': M.nomAffiche(r) + ' · ' + g.nom, title: g.nom,
            onclick: function () { basculer(f, r, g); }
          }, on ? 'X' : '');
        }),
        h('div', { class: 'gc gauche obs', title: r.consigne }, r.consigne));
    });
    return h('div', { class: 'carte-grille tableau-res' },
      h('div', { class: 'defil', 'data-defil': 'tableau-res' },
        h('div', { class: 'grille' }, bandeaux, entete, liste.length ? corps : aucun(f))));
  }

  R.Pages.residents = {
    titre: function () { return 'Résidents'; },
    modifie: function () { return !!App.etat.residents && Object.keys(App.etat.residents.modifs).length > 0; },
    abandonner: function () { if (App.etat.residents) App.etat.residents.modifs = {}; },
    rendu: function () {
      var d = App.donnees, f = etat();
      var vue = App.ui.residentsVue === 'tableau' ? 'tableau' : 'liste';
      var actifs = d.residents.filter(function (r) { return !r.archive; }).length;
      var nbModifs = Object.keys(f.modifs).length;
      var zone = h('div', null, vue === 'tableau' ? vueTableau(d, f) : vueListe(d, f));
      // Nombre de résidents affichés, seulement quand un filtre est actif (sinon = actifs).
      function texteCompte() {
        if (!f.q && !f.parc && !f.archives) return '';
        return ' · ' + O.pluriel(filtrer(d, f).length, 'affiché');
      }
      var compte = h('span', null, texteCompte());
      function rafraichir() { zone.replaceChildren(vue === 'tableau' ? vueTableau(d, f) : vueListe(d, f)); compte.textContent = texteCompte(); }
      function choisirVue(v) { App.ui.residentsVue = v; App.sauverUi(); App.rendre(); }
      return h('div', { class: 'page page-large' },
        h('div', { class: 'page-tete' },
          h('div', { class: 'titre-ligne' }, h('h1', null, 'Résidents ', h('span', { class: 'sous' }, '· ' + actifs + ' actifs', compte)), App.indicateur()),
          h('div', { class: 'segments', role: 'group', 'aria-label': 'Affichage' },
            h('button', { class: 'segment' + (vue === 'liste' ? ' actif' : ''), 'aria-pressed': vue === 'liste' ? 'true' : 'false',
              onclick: function () { choisirVue('liste'); } }, 'Liste'),
            h('button', { class: 'segment' + (vue === 'tableau' ? ' actif' : ''), 'aria-pressed': vue === 'tableau' ? 'true' : 'false',
              onclick: function () { choisirVue('tableau'); } }, 'Tableau')),
          h('input', { type: 'search', placeholder: 'Rechercher un nom', 'aria-label': 'Rechercher un nom', value: f.q,
            oninput: function (e) { f.q = e.target.value; rafraichir(); } }),
          h('select', { 'aria-label': 'Parc', onchange: function (e) { f.parc = e.target.value; rafraichir(); } },
            h('option', { value: '' }, 'Tous les parcs'),
            d.referentiels.parcs.map(function (p) { return h('option', { value: p.id, selected: p.id === f.parc }, p.nom); })),
          h('label', { class: 'case' }, h('input', { type: 'checkbox', checked: f.archives,
            onchange: function (e) { f.archives = e.target.checked; rafraichir(); } }), ' Voir les archivés'),
          h('button', { class: 'btn btn-principal', onclick: function () { R.PageResident.nouveau(); } }, '+ Ajouter un résident')),
        nbModifs ? h('div', { class: 'rangee' },
          h('button', { class: 'btn btn-principal', onclick: function () { enregistrerTableau(f); } }, 'Enregistrer (' + O.pluriel(nbModifs, 'résident') + ')'),
          h('button', { class: 'btn', onclick: function () { f.modifs = {}; App.rendre(); } }, 'Annuler les modifications')) : null,
        zone);
    }
  };

  R.PageResidents = { supprimer: supprimer, confirmerSuppression: confirmerSuppression };
})(window.Recueil = window.Recueil || {});
