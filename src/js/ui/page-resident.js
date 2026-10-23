/* Fiche résident (onglet) : identité, parc, texture, régimes et allergies, options, consigne, absences. */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h, O = R.Outils, App = R.App;
  function absenceVide() { return { debut: '', fin: '', services: M.IDS_SERVICES.slice() }; }
  function libelleServices(services) {
    if (services.length === M.IDS_SERVICES.length) return 'Tous les services';
    return services.map(function (id) { return M.service(id).nom; }).join(', ');
  }

  function brouillon(o) {
    var k = App.cle(o);
    if (!App.brouillons[k]) {
      var r = M.resident(App.donnees, o.id);
      App.brouillons[k] = { r: M.copie(r), nouveau: false, modifie: false, erreur: '' };
    }
    return App.brouillons[k];
  }

  // parcIdVoulu (facultatif) : parc imposé, sinon parc actif, sinon le premier.
  function nouveau(parcIdVoulu) {
    var d = App.donnees;
    var parcId = parcIdVoulu && M.parc(d, parcIdVoulu) ? parcIdVoulu
      : App.ui.parcActif && M.parc(d, App.ui.parcActif) ? App.ui.parcActif : (d.referentiels.parcs[0] || {}).id;
    var r = M.residentVide(parcId);
    r.textureId = M.textureDefaut(d);
    App.brouillons['resident:' + r.id] = { r: r, nouveau: true, modifie: false, erreur: '' };
    App.ouvrir('resident', r.id);
  }

  function libelleAbsence(a) {
    var auj = M.aujourdhui();
    if (a.fin < auj) return 'Passée';
    if (a.debut > auj) return 'À venir';
    return 'En cours';
  }

  R.Pages.resident = {
    modifie: function (o) { var b = App.brouillons[App.cle(o)]; return !!(b && b.modifie); },
    abandonner: function (o) { delete App.brouillons[App.cle(o)]; },
    titre: function (o) {
      var b = App.brouillons[App.cle(o)];
      var r = b ? b.r : M.resident(App.donnees, o.id);
      if (!r) return 'Résident';
      return '✎ ' + (b && b.nouveau && !(r.nom || r.prenom) ? 'Nouveau résident' : M.nomAffiche(r));
    },
    rendu: function (o) {
      var d = App.donnees, k = App.cle(o);
      var b = brouillon(o), r = b.r;
      var p = M.parc(d, r.parcId);
      function modifie() {
        if (!b.modifie) { b.modifie = true; App.signalerModif(); }
      }
      function champ(id, libelle, cleR) {
        return h('div', { class: 'champ' }, h('label', { for: id }, libelle),
          h('input', { id: id, value: r[cleR], oninput: function (e) { r[cleR] = e.target.value; modifie(); } }));
      }
      var coches = function (nature, cleR) {
        return M.parNature(d, nature).map(function (g) {
          var on = r[cleR].indexOf(g.id) >= 0;
          return h('label', { class: 'choix' + (on ? ' on' : '') },
            h('input', { type: 'checkbox', checked: on, onchange: function (e) {
              if (e.target.checked) r[cleR].push(g.id); else r[cleR] = r[cleR].filter(function (x) { return x !== g.id; });
              b.modifie = true; App.rendre();
            } }),
            g.nom.toUpperCase());
        });
      };

      function enregistrer() {
        if (!(r.nom || '').trim() && !(r.prenom || '').trim()) { b.erreur = 'Indiquez au moins un nom ou un prénom.'; App.rendre(); return; }
        if (!M.parc(d, r.parcId)) {
          b.erreur = d.referentiels.parcs.length ? 'Choisissez un parc.' : 'Aucun parc : créez d’abord un parc dans la page Parcs.';
          App.rendre(); return;
        }
        r.nom = r.nom.trim(); r.prenom = r.prenom.trim(); r.consigne = (r.consigne || '').trim();
        var copie = M.copie(r);
        App.modifier(function () {
          var i = -1;
          d.residents.forEach(function (x, n) { if (x.id === copie.id) i = n; });
          if (i >= 0) d.residents[i] = copie; else d.residents.push(copie);
        }, { sansRendu: true });
        delete App.brouillons[k];
        App.rendre();
        App.toast('Fiche de ' + M.nomAffiche(copie) + ' enregistrée');
        App.apresEnregistrement(k);
      }
      function annuler() {
        if (b.nouveau) { b.modifie = false; App.fermer(k); return; }
        delete App.brouillons[k];
        App.rendre();
      }
      // Fenêtre de saisie : l'absence n'existe qu'après « Ajouter l'absence » (pas de dates oubliées dans la fiche).
      function ajouterAbsence() {
        var a = absenceVide();
        var zoneErreur = h('div', { class: 'message message-ko', role: 'alert', hidden: true });
        var champAu = h('input', { id: 'f-au', type: 'date', onchange: function (e) { a.fin = e.target.value; } });
        function erreur(texte) { zoneErreur.textContent = texte; zoneErreur.hidden = false; return false; }
        var formulaire = h('div', { class: 'absence-saisie' },
          h('div', { class: 'gras grand' }, 'Nouvelle absence'),
          zoneErreur,
          h('div', { class: 'rangee bas' },
            h('div', { class: 'champ' }, h('label', { for: 'f-du' }, 'Du'),
              h('input', { id: 'f-du', type: 'date', autofocus: true, onchange: function (e) {
                a.debut = e.target.value;
                // Absence d'un jour : la fin reprend le début tant qu'elle est vide ou avant.
                if (a.debut && (!a.fin || a.fin < a.debut)) { a.fin = a.debut; champAu.value = a.debut; }
              } })),
            h('div', { class: 'champ' }, h('label', { for: 'f-au' }, 'Au (inclus)'), champAu)),
          h('fieldset', { class: 'groupe-choix' }, h('legend', null, 'Services'),
            M.SERVICES.map(function (x) {
              return h('label', { class: 'choix on' }, h('input', { type: 'checkbox', checked: true, onchange: function (e) {
                e.target.parentNode.classList.toggle('on', e.target.checked);
                var liste = e.target.checked ? a.services.concat([x.id]) : a.services.filter(function (id) { return id !== x.id; });
                a.services = M.IDS_SERVICES.filter(function (id) { return liste.indexOf(id) >= 0; });
              } }), x.nom);
            })));
        App.fenetre(formulaire, [
          { texte: 'Annuler', valeur: '' },
          { texte: '+ Ajouter l’absence', valeur: 'ok', classe: 'btn-principal', avant: function () {
            if (!a.debut || !a.fin) return erreur('Indiquez les deux dates de l’absence.');
            if (a.fin < a.debut) return erreur('La date de fin est avant la date de début.');
            if (!a.services.length) return erreur('Cochez au moins un service.');
          } }
        ], function (choix) {
          if (choix !== 'ok') return;
          r.absences.push({ debut: a.debut, fin: a.fin, services: a.services.slice() });
          r.absences.sort(function (x, y) { return x.debut < y.debut ? -1 : 1; });
          b.modifie = true;
          App.rendre();
        });
      }

      return h('div', { class: 'page' },
        h('div', { class: 'fiche' },
          h('div', { class: 'fiche-tete' },
            h('div', { class: 'titre-ligne' }, h('h1', null, b.nouveau ? 'Nouveau résident' : 'Fiche résident'), App.indicateur(o)),
            r.archive ? h('span', { class: 'badge' }, 'Archivé') : null,
            p ? h('span', { class: 'etiquette-parc gras', style: 'background:' + p.couleur + ';color:' + O.texteSur(p.couleur) }, p.nom) : null),
          b.erreur ? h('div', { class: 'message message-ko', role: 'alert' }, b.erreur) : null,
          h('div', { class: 'rangee' },
            champ('f-prenom', 'Prénom', 'prenom'),
            champ('f-nom', 'Nom', 'nom'),
            h('div', { class: 'champ' }, h('label', { for: 'f-parc' }, 'Parc'),
              h('select', { id: 'f-parc', onchange: function (e) { r.parcId = e.target.value; b.modifie = true; App.rendre(); } },
                d.referentiels.parcs.map(function (x) { return h('option', { value: x.id, selected: x.id === r.parcId }, x.nom); })))),
          h('fieldset', { class: 'groupe-choix' }, h('legend', null, 'Texture'),
            M.parNature(d, 'texture').map(function (g) {
              return h('label', { class: 'choix' + (r.textureId === g.id ? ' on' : '') },
                h('input', { type: 'radio', name: 'texture-' + r.id, checked: r.textureId === g.id,
                  onchange: function () { r.textureId = g.id; b.modifie = true; App.rendre(); } }),
                g.nom);
            })),
          h('fieldset', { class: 'groupe-choix' }, h('legend', null, 'Régimes et allergies'), coches('regime', 'regimeIds')),
          h('fieldset', { class: 'groupe-choix' }, h('legend', null, 'Options'), coches('option', 'optionIds')),
          h('div', { class: 'champ' }, h('label', { for: 'f-consigne' }, 'Consigne (étiquette du chariot)'),
            h('input', { id: 'f-consigne', value: r.consigne, oninput: function (e) { r.consigne = e.target.value; modifie(); } })),
          h('div', { class: 'absences' },
            h('div', { class: 'gras grand' }, 'Absences'),
            r.absences.length ? null : h('div', { class: 'petit' }, 'Aucune absence enregistrée.'),
            r.absences.map(function (a, i) {
              return h('div', { class: 'absence' },
                h('span', { class: 'gras', style: 'width:70px' }, libelleAbsence(a)),
                h('span', null, 'du ', h('b', null, O.dateCourte(a.debut)), ' au ', h('b', null, O.dateCourte(a.fin))),
                h('span', { class: 'choix choix-info' }, libelleServices(a.services)),
                h('button', { class: 'btn', style: 'margin-left:auto', onclick: function () {
                  r.absences.splice(i, 1); b.modifie = true; App.rendre();
                } }, 'Retirer'));
            }),
            h('div', null, h('button', { class: 'btn gras', onclick: ajouterAbsence }, '+ Ajouter une absence'))),
          h('div', { class: 'rangee boutons' },
            h('button', { class: 'btn btn-principal', onclick: enregistrer }, 'Enregistrer'),
            h('button', { class: 'btn', onclick: annuler }, b.nouveau ? 'Annuler' : 'Annuler les modifications'),
            b.nouveau ? null : h('button', { class: 'btn', style: 'margin-left:auto', onclick: function () {
              var id = r.id;
              App.modifier(function () { var x = M.resident(d, id); x.archive = !x.archive; }, { sansRendu: true });
              b.r.archive = !b.r.archive;
              App.rendre();
            } }, r.archive ? 'Réactiver' : 'Archiver'),
            b.nouveau ? null : h('button', { class: 'btn btn-danger', onclick: function () {
              R.PageResidents.confirmerSuppression(r, function () {
                b.modifie = false;
                R.PageResidents.supprimer(r.id);
                App.fermer(k);
              });
            } }, 'Supprimer ce résident'))));
    }
  };

  R.PageResident = { nouveau: nouveau };
})(window.Recueil = window.Recueil || {});
