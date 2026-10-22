/* Page Activités : activités de la semaine (jour, service, participants) et presets. */
(function (R) {
  'use strict';
  var M = R.Modele, C = R.Calc, h = R.h, O = R.Outils, App = R.App;

  function etat() { return App.etat.activites = App.etat.activites || { selection: null, b: null }; }

  function charger(a) {
    var e = etat();
    e.selection = a ? a.id : 'nouvelle';
    e.b = a ? M.copie(a) : { id: M.nouvelId('a'), nom: '', jour: 'jeu', service: 'midi', participantIds: [], presetId: null, couleur: M.COULEUR_ACTIVITE };
    e.erreur = ''; e.info = '';
    e.initial = JSON.stringify(e.b);
  }

  // Participants du brouillon b déjà inscrits à une autre activité sur le même créneau : [{ r, autre }].
  function conflits(d, s, b) {
    var autres = C.activitesDuCreneau(s, M.creneau(b.jour, b.service)).filter(function (a) { return a.id !== b.id; });
    return b.participantIds.map(function (id) {
      var autre = autres.filter(function (a) { return a.participantIds.indexOf(id) >= 0; })[0];
      return autre ? { r: M.resident(d, id), autre: autre } : null;
    }).filter(function (x) { return x && x.r; });
  }
  function libelleConflits(liste) {
    return liste.map(function (x) { return M.nomAffiche(x.r) + ' (« ' + x.autre.nom + ' »)'; }).join(', ');
  }
  // Après un changement de jour, de service ou de preset : retire les participants déjà pris ailleurs.
  function retirerConflits(d, s, e) {
    var liste = conflits(d, s, e.b);
    if (!liste.length) return;
    var ids = liste.map(function (x) { return x.r.id; });
    e.b.participantIds = e.b.participantIds.filter(function (id) { return ids.indexOf(id) < 0; });
    e.info = 'Déjà inscrits à une autre activité ' + M.jour(e.b.jour).nom.toLowerCase() + ' ' + M.service(e.b.service).court +
      ', donc retirés de celle-ci : ' + libelleConflits(liste) + '.';
  }

  // Brouillon différent de l'activité enregistrée (ou du formulaire vide pour une nouvelle).
  function modifie() {
    var e = App.etat.activites;
    if (!e || !e.b) return false;
    var a = App.semaineCourante().activites.filter(function (x) { return x.id === e.b.id; })[0];
    return JSON.stringify(e.b) !== (a ? JSON.stringify(a) : e.initial);
  }
  function abandonner() { var e = etat(); e.selection = null; e.b = null; e.erreur = ''; e.info = ''; }
  function peutChanger() { return App.abandonner({ type: 'activites' }); }

  function ouvrirActivite(id) {
    if (!peutChanger()) return;
    var s = App.semaineCourante();
    charger(s.activites.filter(function (a) { return a.id === id; })[0] || null);
    App.ouvrir('activites');
  }
  function nouvelle() {
    if (!peutChanger()) return;
    charger(null);
    App.ouvrir('activites');
  }

  function depuisPreset(b, p, d) {
    b.nom = p.nom;
    if (p.jours[0]) b.jour = p.jours[0];
    if (p.services[0]) b.service = p.services[0];
    b.participantIds = p.participantIds.filter(function (id) { var r = M.resident(d, id); return r && !r.archive; });
    b.couleur = p.couleur || M.COULEUR_ACTIVITE;
    b.presetId = p.id;
  }

  R.Pages.activites = {
    titre: function () { return 'Activités'; },
    modifie: modifie,
    abandonner: abandonner,
    rendu: function () {
      var d = App.donnees, s = App.semaineCourante(), e = etat();
      if (e.selection && e.selection !== 'nouvelle' && !s.activites.some(function (a) { return a.id === e.selection; })) { e.selection = null; e.b = null; }
      var b = e.b;

      function enregistrer() {
        if (!b.nom.trim()) { e.erreur = 'Donnez un nom à l’activité.'; App.rendre(); return; }
        var doublons = conflits(d, s, b);
        if (doublons.length) {
          e.erreur = 'Un résident ne peut faire qu’une activité par service. Décochez : ' + libelleConflits(doublons) + '.';
          App.rendre(); return;
        }
        b.nom = b.nom.trim();
        App.modifier(function () {
          var i = -1;
          s.activites.forEach(function (a, n) { if (a.id === b.id) i = n; });
          if (i >= 0) s.activites[i] = M.copie(b); else s.activites.push(M.copie(b));
          e.selection = b.id; e.erreur = ''; e.info = '';
        });
        App.toast('Activité ' + b.nom + ' enregistrée');
      }
      function retirer() {
        if (!window.confirm('Retirer l’activité « ' + b.nom + ' » de cette semaine ? Les participants reviennent dans leur parc.')) return;
        App.modifier(function () {
          s.activites = s.activites.filter(function (a) { return a.id !== b.id; });
          e.selection = null; e.b = null;
        });
      }
      function enregistrerPreset(mettreAJour) {
        if (!b.nom.trim()) { e.erreur = 'Donnez un nom à l’activité avant d’en faire un preset.'; App.rendre(); return; }
        App.modifier(function () {
          var p = mettreAJour ? d.presetsActivites.filter(function (x) { return x.id === b.presetId; })[0] : null;
          if (!p) {
            var noms = d.presetsActivites.map(function (x) { return x.nom; });
            var nom = b.nom.trim(), n = 2;
            while (noms.indexOf(nom) >= 0) nom = b.nom.trim() + ' ' + n++;
            p = { id: M.nouvelId('preset'), nom: nom };
            d.presetsActivites.push(p);
          }
          p.jours = [b.jour]; p.services = [b.service]; p.participantIds = b.participantIds.slice(); p.couleur = b.couleur;
          b.presetId = p.id;
          // L'activité enregistrée garde le lien vers son preset.
          s.activites.forEach(function (a) { if (a.id === b.id) a.presetId = p.id; });
        });
        App.toast(mettreAJour ? 'Preset mis à jour' : 'Preset enregistré');
      }

      // ---- Colonne de gauche ----
      var gauche = h('div', { class: 'carte colonne-gauche' },
        h('div', { class: 'gras grand' }, 'Semaine ' + M.numeroSemaine(s.debut).numero),
        h('select', { 'aria-label': 'Semaine', onchange: function (ev) {
          if (peutChanger()) { App.ui.semaine = ev.target.value; abandonner(); App.sauverUi(); }
          App.rendre();
        } },
          d.semaines.map(function (x) { return h('option', { value: x.id, selected: x.id === s.id }, O.titreSemaine(x)); })),
        s.activites.map(function (a) {
          return h('button', { class: 'carte-activite' + (e.selection === a.id ? ' choisie' : ''), style: 'border-left:6px solid ' + a.couleur, onclick: function () { if (peutChanger()) { charger(a); App.rendre(); } } },
            h('b', null, a.nom), h('br'), M.jour(a.jour).nom.toLowerCase() + ' · ' + M.service(a.service).court + ' · ' + O.pluriel(a.participantIds.length, 'participant'));
        }),
        h('button', { class: 'btn', onclick: function () { if (peutChanger()) { charger(null); App.rendre(); } } }, '+ Ajouter une activité'),
        h('div', { class: 'gras', style: 'margin-top:8px' }, 'Presets enregistrés'),
        d.presetsActivites.length ? null : h('div', { class: 'petit' }, 'Aucun preset.'),
        d.presetsActivites.map(function (p) {
          return h('div', { class: 'carte-preset' },
            h('div', null, p.nom, h('br'), h('span', { class: 'petit' },
              p.jours.map(function (j) { return M.jour(j) ? M.jour(j).nom.toLowerCase() : j; }).join(', ') + ' · ' + p.services.map(function (id) { return M.service(id).court; }).join(', ') + ' · ' +
              O.pluriel(p.participantIds.length, 'participant'))),
            h('button', { class: 'btn btn-icone', 'aria-label': 'Supprimer le preset ' + p.nom, title: 'Supprimer le preset', onclick: function () {
              if (!window.confirm('Supprimer le preset « ' + p.nom + ' » ? Les activités déjà créées ne changent pas.')) return;
              App.modifier(function () { d.presetsActivites = d.presetsActivites.filter(function (x) { return x.id !== p.id; }); });
            } }, '×'));
        }),
        // Preset MAS La Fontaine : ajoute les presets d'activité manquants (Sport jeudi midi).
        M.presetsActivitesManquants(d).length ? h('button', { class: 'btn', style: 'align-self:flex-start', onclick: function () {
          var noms = M.presetsActivitesManquants(d).map(function (p) { return p.nom; }).join(', ');
          if (!window.confirm('Ajouter les presets MAS La Fontaine manquants ?\n\n' + noms + '\n\nLes presets existants ne sont pas modifiés.')) return;
          App.modifier(function () { M.ajouterPresetsActivites(d); });
        } }, 'Ajouter les presets MAS La Fontaine') : null);

      // ---- Formulaire ----
      var droite;
      if (!b) {
        droite = h('div', { class: 'carte formulaire-activite' }, h('div', { class: 'petit' }, 'Choisissez une activité à gauche ou ajoutez-en une.'));
      } else {
        var c = M.creneau(b.jour, b.service);
        var preset = d.presetsActivites.filter(function (p) { return p.id === b.presetId; })[0];
        var groupes = d.referentiels.parcs.map(function (p) {
          return { parc: p, residents: d.residents.filter(function (r) { return !r.archive && r.parcId === p.id; }) };
        }).filter(function (g) { return g.residents.length; });

        droite = h('div', { class: 'carte formulaire-activite' },
          e.erreur ? h('div', { class: 'message message-ko', role: 'alert' }, e.erreur) : null,
          e.info ? h('div', { class: 'message message-attention', role: 'status' }, e.info) : null,
          h('div', { class: 'rangee bas' },
            h('div', { class: 'champ', style: 'flex:1 1 180px' }, h('label', { for: 'a-nom' }, 'Nom de l’activité'),
              h('input', { id: 'a-nom', value: b.nom, oninput: function (ev) { b.nom = ev.target.value; App.signalerModif(); } })),
            h('div', { class: 'champ' }, h('label', { for: 'a-couleur' }, 'Couleur'),
              h('input', { id: 'a-couleur', type: 'color', value: b.couleur, oninput: function (ev) { b.couleur = ev.target.value; App.signalerModif(); } })),
            h('div', { class: 'champ' }, h('label', { for: 'a-jour' }, 'Jour'),
              h('select', { id: 'a-jour', onchange: function (ev) { b.jour = ev.target.value; e.info = ''; retirerConflits(d, s, e); App.rendre(); } },
                M.JOURS.map(function (j) { return h('option', { value: j.id, selected: j.id === b.jour }, j.nom); }))),
            h('div', { class: 'champ' }, h('label', { for: 'a-svc' }, 'Service impacté'),
              h('select', { id: 'a-svc', onchange: function (ev) { b.service = ev.target.value; e.info = ''; retirerConflits(d, s, e); App.rendre(); } },
                M.SERVICES.map(function (x) { return h('option', { value: x.id, selected: x.id === b.service }, x.nom); })))),
          h('div', { class: 'bandeau bandeau-activites' },
            h('span', null, preset ? [h('b', null, 'Preset :'), ' « ' + preset.nom + ' » chargé'] : h('span', { class: 'petit' }, 'Aucun preset chargé.')),
            h('select', { 'aria-label': 'Charger un preset', style: 'margin-left:auto', disabled: !d.presetsActivites.length,
              onchange: function (ev) {
                var p = d.presetsActivites.filter(function (x) { return x.id === ev.target.value; })[0];
                if (p) { depuisPreset(b, p, d); e.info = ''; retirerConflits(d, s, e); App.rendre(); }
              } },
              h('option', { value: '' }, 'Charger un preset'),
              d.presetsActivites.map(function (p) { return h('option', { value: p.id }, p.nom); })),
            preset ? h('button', { class: 'btn', onclick: function () { enregistrerPreset(true); } }, 'Mettre à jour le preset') : null,
            h('button', { class: 'btn', onclick: function () { enregistrerPreset(false); } }, 'Enregistrer comme nouveau preset')),
          h('div', { class: 'gras grand' }, 'Participants ', h('span', { class: 'petit' }, '· ' + O.pluriel(b.participantIds.length, 'résident'))),
          groupes.map(function (g) {
            return h('div', { class: 'groupe-participants' },
              h('span', { class: 'etiquette-parc gras', style: 'background:' + g.parc.couleur + ';color:' + O.texteSur(g.parc.couleur) }, g.parc.nom),
              h('div', null, g.residents.map(function (r) {
                var on = b.participantIds.indexOf(r.id) >= 0;
                var autre = C.activitesDuCreneau(s, c).filter(function (a) { return a.id !== b.id && a.participantIds.indexOf(r.id) >= 0; })[0];
                var absent = C.presence(s, r, c).valeur === 0;
                var titre = autre ? 'Déjà inscrit à « ' + autre.nom + ' » sur ce service' + (on ? ' : à décocher' : '') : (absent ? 'Absent ce jour-là : ne sera compté nulle part' : '');
                return h('button', { class: 'participant' + (on ? ' on' : '') + (absent ? ' absent' : '') + (autre && on ? ' conflit' : ''), 'aria-pressed': on ? 'true' : 'false',
                  disabled: !!autre && !on, title: titre,
                  onclick: function () {
                    if (on) b.participantIds = b.participantIds.filter(function (x) { return x !== r.id; }); else b.participantIds.push(r.id);
                    App.rendre();
                  } }, M.nomAffiche(r) + (absent ? ' (absent)' : ''));
              })));
          }),
          h('div', { class: 'rangee boutons' },
            h('button', { class: 'btn btn-principal', onclick: enregistrer }, 'Enregistrer'),
            e.selection !== 'nouvelle' ? h('button', { class: 'btn btn-danger', style: 'margin-left:auto', onclick: retirer }, 'Retirer cette activité de la semaine') : null));
      }

      return h('div', { class: 'page page-large' },
        h('div', { class: 'page-tete' }, h('div', { class: 'titre-ligne' }, h('h1', null, 'Activités'), App.indicateur())),
        h('div', { class: 'deux-colonnes' }, gauche, droite));
    }
  };

  R.PageActivites = { ouvrirActivite: ouvrirActivite, nouvelle: nouvelle };
})(window.Recueil = window.Recueil || {});
