/* Page Services : services de base (petit déjeuner, midi, soir : fixes) et services additionnels
   (nom, abrégé, type, jours, ordre, archivage ; suppression refusée s'ils sont utilisés). */
(function (R) {
  'use strict';
  var M = R.Modele, h = R.h, O = R.Outils, App = R.App;
  var TYPE_REPAS = 'Repas', TYPE_PRESENCE = 'Présence seule';
  var AIDE_TYPE = 'Repas : comme midi et soir (plats en plus, textures, régimes, options). ' +
    'Présence seule : comme le petit déjeuner (on compte les présents, sans plat en plus).';

  // Identifiant sans « _ » (séparateur des créneaux « jour_service »).
  function idLibre(nom, existants) {
    var base = R.Referentiel.slug(nom).replace(/_/g, '-'), id = base, n = 2;
    while (existants.indexOf(id) >= 0) id = base + '-' + n++;
    return id;
  }

  function libelleJours(jours) {
    if (jours.length === M.JOURS.length) return 'Tous les jours';
    return jours.map(function (j) { return M.jour(j).court; }).join(' ');
  }

  // Phrase « 2 semaines (saisies), 1 activité… » ; vide si rien n'utilise le service.
  function texteUtilisations(u) {
    var parts = [];
    if (u.semaines) parts.push(O.pluriel(u.semaines, 'semaine') + ' (saisies de présence ou de nombres)');
    if (u.activites) parts.push(O.pluriel(u.activites, 'activité'));
    if (u.presets) parts.push(O.pluriel(u.presets, 'preset d’activité', 'presets d’activité'));
    if (u.absences) parts.push(O.pluriel(u.absences, 'absence de résident', 'absences de résidents'));
    return parts.join(', ');
  }

  function valeurEdition(ed) { return [ed.nom, ed.court, ed.presenceSeule, ed.jours.join(',')].join('|'); }
  function edition(id, nom, court, presenceSeule, jours) {
    var ed = { id: id, nom: nom, court: court, presenceSeule: presenceSeule, jours: jours.slice(), erreur: '' };
    ed.init = valeurEdition(ed);
    return ed;
  }

  R.Pages.services = {
    titre: function () { return 'Services'; },
    modifie: function () { var ed = App.etat.serviceEdit; return !!ed && valeurEdition(ed) !== ed.init; },
    abandonner: function () { App.etat.serviceEdit = null; },
    rendu: function () {
      var d = App.donnees, liste = d.referentiels.services;
      var ed = App.etat.serviceEdit || null;

      function enregistrer() {
        var nom = ed.nom.trim();
        if (!nom) { ed.erreur = 'Le nom est obligatoire.'; App.rendre(); return; }
        if (liste.some(function (s) { return s.id !== ed.id && s.nom.trim().toUpperCase() === nom.toUpperCase(); })) {
          ed.erreur = 'Un service porte déjà ce nom.'; App.rendre(); return;
        }
        if (!ed.jours.length) { ed.erreur = 'Cochez au moins un jour.'; App.rendre(); return; }
        App.modifier(function () {
          var s;
          if (ed.id) {
            s = liste.filter(function (x) { return x.id === ed.id; })[0];
          } else {
            s = { id: idLibre(nom, liste.map(function (x) { return x.id; })), base: false, archive: false };
            liste.push(s);
            // Textures, régimes et options : concernés comme à midi (repas) ou au petit déjeuner (présence seule).
            var modele = ed.presenceSeule ? 'petitdej' : 'midi';
            d.referentiels.regimes.forEach(function (g) {
              if (g.services.indexOf(modele) < 0) return;
              g.services = liste.map(function (x) { return x.id; }).filter(function (x) { return x === s.id || g.services.indexOf(x) >= 0; });
            });
          }
          s.nom = nom; s.court = ed.court.trim() || nom; s.presenceSeule = ed.presenceSeule; s.jours = ed.jours.slice();
          App.etat.serviceEdit = null;
        });
        App.toast('Service ' + nom + ' enregistré');
        App.apresEnregistrement('services');
      }
      function supprimer(s) {
        var u = texteUtilisations(M.utilisationsService(d, s.id));
        if (u) {
          App.alerte('Impossible de supprimer « ' + s.nom + ' » : utilisé par ' + u + '.\n\n' +
            'Archivez-le plutôt : il disparaît de la grille, des feuilles et des listes, et ses saisies sont gardées.');
          return;
        }
        App.confirmer('Supprimer le service « ' + s.nom + ' » ?', function () {
          App.modifier(function () {
            d.referentiels.services = d.referentiels.services.filter(function (x) { return x.id !== s.id; });
            d.referentiels.regimes.forEach(function (g) { g.services = g.services.filter(function (x) { return x !== s.id; }); });
            App.etat.serviceEdit = null;
          });
        }, { ok: 'Supprimer', danger: true });
      }

      var gabarit = 'grid-template-columns:minmax(0,1.3fr) minmax(0,0.8fr) 220px minmax(0,1.7fr) 330px';
      function choixType(presenceSeule, libelle) {
        var on = ed.presenceSeule === presenceSeule;
        return h('label', { class: 'choix' + (on ? ' on' : ''), title: AIDE_TYPE },
          h('input', { type: 'radio', name: 'type-service', checked: on, onchange: function () { ed.presenceSeule = presenceSeule; App.rendre(); } }),
          libelle);
      }
      function formulaire() {
        return h('div', { class: 'ligne-reg edition', style: gabarit },
          h('input', { value: ed.nom, 'aria-label': 'Nom du service', placeholder: 'Nom (ex. Goûter)', oninput: function (e) { ed.nom = e.target.value; App.signalerModif(); } }),
          h('input', { value: ed.court, 'aria-label': 'Abrégé pour la grille', placeholder: 'Abrégé (grille)', oninput: function (e) { ed.court = e.target.value; App.signalerModif(); } }),
          h('span', { class: 'services-reg' }, choixType(false, TYPE_REPAS), choixType(true, TYPE_PRESENCE)),
          h('span', { class: 'services-reg' }, M.JOURS.map(function (j) {
            var on = ed.jours.indexOf(j.id) >= 0;
            return h('label', { class: 'choix' + (on ? ' on' : ''), title: j.nom },
              h('input', { type: 'checkbox', checked: on, 'aria-label': j.nom, onchange: function () {
                ed.jours = M.IDS_JOURS.filter(function (x) { return x === j.id ? !on : ed.jours.indexOf(x) >= 0; });
                App.rendre();
              } }), j.court);
          })),
          h('span', { class: 'actions-visibles' },
            h('button', { class: 'btn btn-principal', onclick: enregistrer }, 'Enregistrer'),
            h('button', { class: 'btn', onclick: function () { App.etat.serviceEdit = null; App.rendre(); } }, 'Annuler'),
            ed.erreur ? h('span', { class: 'erreur' }, ed.erreur) : null));
      }

      function ligne(s, i) {
        if (ed && ed.id === s.id) return formulaire();
        return h('div', { class: 'ligne-reg' + (s.archive ? ' archivee' : ''), style: gabarit },
          h('span', null, h('span', { class: 'gras' }, s.nom), s.archive ? [' ', h('span', { class: 'badge' }, 'Archivé')] : null),
          h('span', { class: 'petit' }, s.court),
          h('span', { class: 'petit', title: AIDE_TYPE }, s.presenceSeule ? TYPE_PRESENCE : TYPE_REPAS),
          h('span', { class: 'petit' }, libelleJours(s.jours)),
          s.base ? h('span', { class: 'petit' }, 'Service de base (fixe)') : h('span', { class: 'actions-visibles' },
            h('button', { class: 'btn btn-icone', 'aria-label': 'Monter ' + s.nom, disabled: i === 0,
              onclick: function () { App.modifier(function () { R.Referentiel.deplacer(liste, i, -1); }); } }, '↑'),
            h('button', { class: 'btn btn-icone', 'aria-label': 'Descendre ' + s.nom, disabled: i === liste.length - 1,
              onclick: function () { App.modifier(function () { R.Referentiel.deplacer(liste, i, 1); }); } }, '↓'),
            h('button', { class: 'btn', onclick: function () {
              App.abandonner(function () { App.etat.serviceEdit = edition(s.id, s.nom, s.court, s.presenceSeule, s.jours); App.rendre(); });
            } }, 'Éditer'),
            h('button', { class: 'btn', onclick: function () { App.modifier(function () { s.archive = !s.archive; }); } }, s.archive ? 'Réactiver' : 'Archiver'),
            h('button', { class: 'btn btn-danger', onclick: function () { supprimer(s); } }, 'Supprimer')));
      }

      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' },
          h('div', { class: 'titre-ligne' }, h('h1', null, 'Services ', h('span', { class: 'pilule' }, liste.length)), App.indicateur()),
          h('div', { class: 'petit' }, 'Petit déjeuner, midi et soir sont les services de base : toujours là, tous les jours. ' +
            'Un service ajouté (goûter, collation, repas de fête…) a sa colonne dans la grille Semaine pour chaque jour coché, ' +
            'ses salariés, ses feuilles cuisine et chariot. Les flèches le placent entre les services de base (ordre de la journée).'),
          h('div', { class: 'petit' }, 'Présence par défaut à un service ajouté : présent si le résident est présent au service voisin ' +
            '(juste avant ou juste après), absent s’il est absent aux deux. Une absence de la fiche ou une case saisie passe avant.')),
        h('div', { class: 'carte' },
          h('div', { class: 'ligne-reg entete', style: gabarit }, h('span', null, 'Nom'), h('span', null, 'Abrégé (grille)'),
            h('span', { title: AIDE_TYPE, class: 'aide' }, 'Type ⓘ'), h('span', null, 'Jours'), h('span')),
          liste.map(ligne),
          ed && !ed.id ? formulaire() : h('button', { class: 'btn', style: 'align-self:flex-start;margin-top:6px', onclick: function () {
            App.abandonner(function () { App.etat.serviceEdit = edition(null, '', '', false, M.IDS_JOURS); App.rendre(); });
          } }, '+ Ajouter un service')));
    }
  };
})(window.Recueil = window.Recueil || {});
