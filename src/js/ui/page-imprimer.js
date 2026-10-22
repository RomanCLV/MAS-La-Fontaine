/* Page Imprimer : choix des feuilles, aperçu, impression A4 paysage. */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h, O = R.Outils, App = R.App, F = R.Feuilles;

  function choix() {
    var c = App.ui.impression;
    if (!c || !Array.isArray(c.jours)) {
      c = App.ui.impression = { cuisine: true, chariot: true, jours: M.JOURS.map(function (j) { return j.id; }), services: M.IDS_SERVICES.slice() };
    }
    // Ancien nom « feuille chef » mémorisé dans le navigateur.
    if (c.cuisine === undefined) { c.cuisine = c.chef !== false; delete c.chef; }
    return c;
  }

  // Remplit #impression (hors application) avec les feuilles choisies.
  function preparer() {
    var zone = document.getElementById('impression');
    if (!App.donnees) { zone.replaceChildren(); return 0; }
    var r = F.construire(App.donnees, App.semaineCourante(), choix());
    zone.replaceChildren(r.fragment);
    return r.nombre;
  }

  function imprimer() {
    if (!preparer()) { App.alerte('Aucune feuille à imprimer avec ces choix.'); return; }
    window.print();
  }

  R.Pages.imprimer = {
    titre: function () { return 'Imprimer'; },
    rendu: function () {
      var d = App.donnees, s = App.semaineCourante(), c = choix();
      function maj() { App.sauverUi(); App.rendre(); }
      function bascule(liste, v) {
        var i = liste.indexOf(v);
        if (i >= 0) liste.splice(i, 1); else liste.push(v);
      }
      var apercu = F.construire(d, s, c);
      return h('div', { class: 'page page-large' },
        h('div', { class: 'page-tete' },
          h('h1', null, 'Imprimer'),
          h('select', { 'aria-label': 'Semaine', onchange: function (e) { App.ui.semaine = e.target.value; maj(); } },
            d.semaines.map(function (x) { return h('option', { value: x.id, selected: x.id === s.id }, O.titreSemaine(x)); })),
          h('button', { class: 'btn btn-grand btn-principal', onclick: imprimer, disabled: !apercu.nombre },
            'Imprimer ' + O.pluriel(apercu.nombre, 'feuille'))),
        h('div', { class: 'carte choix-impression' },
          h('div', { class: 'rangee' },
            h('span', { class: 'gras' }, 'Feuilles :'),
            h('label', { class: 'choix' + (c.cuisine ? ' on' : '') }, h('input', { type: 'checkbox', checked: c.cuisine, onchange: function () { c.cuisine = !c.cuisine; maj(); } }), 'Feuille cuisine'),
            h('label', { class: 'choix' + (c.chariot ? ' on' : '') }, h('input', { type: 'checkbox', checked: c.chariot, onchange: function () { c.chariot = !c.chariot; maj(); } }), 'Feuilles chariot'),
            h('span', { class: 'gras', style: 'margin-left:16px' }, 'Services :'),
            M.SERVICES.map(function (x) {
              var on = c.services.indexOf(x.id) >= 0;
              return h('label', { class: 'choix' + (on ? ' on' : '') }, h('input', { type: 'checkbox', checked: on, onchange: function () { bascule(c.services, x.id); maj(); } }), x.nom);
            })),
          h('div', { class: 'rangee' },
            h('span', { class: 'gras' }, 'Jours :'),
            M.JOURS.map(function (j) {
              var on = c.jours.indexOf(j.id) >= 0;
              return h('label', { class: 'choix' + (on ? ' on' : '') }, h('input', { type: 'checkbox', checked: on, onchange: function () { bascule(c.jours, j.id); maj(); } }),
                j.nom + ' ' + O.dateCourte(M.dateDuJour(s, j.id)).slice(0, 5));
            }),
            h('button', { class: 'lien', onclick: function () { c.jours = M.JOURS.map(function (j) { return j.id; }); maj(); } }, 'Tous'),
            h('button', { class: 'lien', onclick: function () { c.jours = []; maj(); } }, 'Aucun')),
          h('div', { class: 'petit' }, 'Fenêtre d’impression : orientation paysage, « graphiques d’arrière-plan » cochés pour les couleurs.')),
        h('div', { class: 'petit' }, 'Aperçu (' + O.pluriel(apercu.nombre, 'feuille') + ')'),
        h('div', { class: 'apercu', 'data-defil': 'apercu' }, apercu.fragment));
    }
  };

  R.Impression = { preparer: preparer, imprimer: imprimer };
})(window.Recueil = window.Recueil || {});
