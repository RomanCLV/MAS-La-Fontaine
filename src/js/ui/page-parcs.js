/* Page Parcs : nom, couleur, ordre. Le Sport n'est pas un parc (page Activités). */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h, O = R.Outils, App = R.App;

  function slug(texte) {
    return texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'element';
  }
  function idLibre(base, existants) {
    var id = base, n = 2;
    while (existants.indexOf(id) >= 0) id = base + '_' + n++;
    return id;
  }

  function deplacer(liste, i, sens) {
    var j = i + sens;
    if (j < 0 || j >= liste.length) return;
    var x = liste[i]; liste[i] = liste[j]; liste[j] = x;
  }

  function edition(id, nom, couleur) {
    return { id: id, nom: nom, couleur: couleur, erreur: '', init: nom + '|' + couleur };
  }

  R.Pages.parcs = {
    titre: function () { return 'Parcs'; },
    modifie: function () { var ed = App.etat.parcEdit; return !!ed && ed.nom + '|' + ed.couleur !== ed.init; },
    abandonner: function () { App.etat.parcEdit = null; },
    rendu: function () {
      var d = App.donnees, parcs = d.referentiels.parcs;
      var ed = App.etat.parcEdit || null; // { id|null, nom, couleur, erreur }

      function nbResidents(id) { return d.residents.filter(function (r) { return r.parcId === id && !r.archive; }).length; }
      function nbTous(id) { return d.residents.filter(function (r) { return r.parcId === id; }).length; }

      function enregistrer() {
        if (!ed.nom.trim()) { ed.erreur = 'Le nom est obligatoire.'; App.rendre(); return; }
        App.modifier(function () {
          if (ed.id) {
            var p = M.parc(d, ed.id); p.nom = ed.nom.trim(); p.couleur = ed.couleur;
          } else {
            parcs.push({ id: idLibre(slug(ed.nom), parcs.map(function (p) { return p.id; })), nom: ed.nom.trim(), couleur: ed.couleur, ordre: parcs.length + 1 });
          }
          App.etat.parcEdit = null;
        });
      }
      function supprimer(p) {
        var n = nbTous(p.id);
        if (n) { window.alert('Impossible : ' + O.pluriel(n, 'résident est rattaché', 'résidents sont rattachés') + ' à ' + p.nom + ' (archivés compris). Changez-les de parc d’abord.'); return; }
        if (!window.confirm('Supprimer le parc ' + p.nom + ' ?')) return;
        App.modifier(function () {
          d.referentiels.parcs = parcs.filter(function (x) { return x.id !== p.id; });
          d.referentiels.parcs.forEach(function (x, i) { x.ordre = i + 1; });
          d.semaines.forEach(function (s) { delete s.salaries[p.id]; });
          App.etat.parcEdit = null;
        });
      }

      // Preset MAS La Fontaine : ajoute les parcs manquants, sans toucher aux autres.
      var manquants = M.parcsPresetManquants(d);
      function ajouterPreset() {
        if (!App.abandonner()) return;
        if (!window.confirm('Ajouter les parcs MAS La Fontaine manquants ?\n\n' + manquants.map(function (p) { return p.nom; }).join(', ') +
          '\n\nLes parcs existants ne sont pas modifiés.')) return;
        App.modifier(function () { M.ajouterParcsPreset(d); App.etat.parcEdit = null; });
      }

      function formulaire() {
        return h('div', { class: 'ligne-ref edition' },
          h('input', { type: 'color', value: ed.couleur, 'aria-label': 'Couleur', oninput: function (e) { ed.couleur = e.target.value; App.signalerModif(); } }),
          h('input', { value: ed.nom, 'aria-label': 'Nom du parc', placeholder: 'Nom du parc', style: 'flex-grow:1',
            oninput: function (e) { ed.nom = e.target.value; App.signalerModif(); } }),
          h('button', { class: 'btn btn-principal', onclick: enregistrer }, 'Enregistrer'),
          h('button', { class: 'btn', onclick: function () { App.etat.parcEdit = null; App.rendre(); } }, 'Annuler'),
          ed.erreur ? h('span', { class: 'erreur' }, ed.erreur) : null);
      }

      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' },
          h('div', { class: 'titre-ligne' }, h('h1', null, 'Parcs ', h('span', { class: 'pilule' }, parcs.length)), App.indicateur())),
        h('div', { class: 'carte', style: 'max-width:820px' },
          parcs.map(function (p, i) {
            if (ed && ed.id === p.id) return formulaire();
            return h('div', { class: 'ligne-ref' },
              h('div', { class: 'carre', style: 'background:' + p.couleur }),
              h('span', { class: 'gras', style: 'flex-grow:1' }, p.nom),
              h('span', { class: 'petit' }, O.pluriel(nbResidents(p.id), 'résident')),
              h('button', { class: 'btn btn-icone', 'aria-label': 'Monter ' + p.nom, disabled: i === 0,
                onclick: function () { App.modifier(function () { deplacer(parcs, i, -1); parcs.forEach(function (x, n) { x.ordre = n + 1; }); }); } }, '↑'),
              h('button', { class: 'btn btn-icone', 'aria-label': 'Descendre ' + p.nom, disabled: i === parcs.length - 1,
                onclick: function () { App.modifier(function () { deplacer(parcs, i, 1); parcs.forEach(function (x, n) { x.ordre = n + 1; }); }); } }, '↓'),
              h('button', { class: 'btn', onclick: function () { if (App.abandonner()) { App.etat.parcEdit = edition(p.id, p.nom, p.couleur); App.rendre(); } } }, 'Modifier'),
              h('button', { class: 'btn btn-danger', onclick: function () { supprimer(p); } }, 'Supprimer'));
          }),
          ed && !ed.id ? formulaire() : h('div', { class: 'rangee', style: 'margin-top:6px' },
            h('button', { class: 'btn', onclick: function () {
              if (App.abandonner()) { App.etat.parcEdit = edition(null, '', '#cccccc'); App.rendre(); }
            } }, '+ Ajouter un parc'),
            manquants.length ? h('button', { class: 'btn', onclick: ajouterPreset },
              manquants.length === M.PARCS_MAS_LA_FONTAINE.length ? 'Ajouter les parcs MAS La Fontaine'
                : 'Ajouter les parcs MAS La Fontaine manquants (' + manquants.length + ')') : null)));
    }
  };

  R.Referentiel = { slug: slug, idLibre: idLibre, deplacer: deplacer };
})(window.Recueil = window.Recueil || {});
