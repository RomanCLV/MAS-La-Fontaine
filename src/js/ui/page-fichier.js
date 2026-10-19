/* Accueil (aucune donnée), page Importer et page Exporter. */
(function (R) {
  'use strict';
  var M = R.Modele, S = R.Stockage, h = R.h, O = R.Outils, App = R.App;

  function chargerDemarrage() {
    if (App.donnees && !window.confirm('Remplacer la copie de travail actuelle par les données de démarrage (semaine 42) ?')) return;
    App.remplacerDonnees(M.migrer(R.DONNEES_DEMARRAGE), 'données de démarrage (recueil_base_s42.json)');
  }

  function resume(d) {
    var s = d.semaines.map(function (x) { return 'S' + M.numeroSemaine(x.debut).numero; }).join(', ');
    return O.pluriel(d.semaines.length, 'semaine') + ' (' + s + ') · ' + O.pluriel(d.residents.filter(function (r) { return !r.archive; }).length, 'résident actif', 'résidents actifs') +
      ' · ' + O.pluriel(d.referentiels.parcs.length, 'parc');
  }

  // Bouton « Ouvrir un fichier… » (input file caché derrière un vrai bouton).
  function boutonFichier(texte, principal, surFichier) {
    var input = h('input', { type: 'file', accept: '.json,application/json', class: 'cache', 'aria-hidden': 'true', tabindex: '-1',
      onchange: function (e) { var f = e.target.files[0]; e.target.value = ''; if (f) surFichier(f); } });
    return h('span', null, input, h('button', { class: 'btn btn-grand' + (principal ? ' btn-principal' : ''), onclick: function () { input.click(); } }, texte));
  }

  function lire(f) {
    var e = App.etat.import = { nom: f.name, lecture: true };
    App.rendre();
    S.lireFichier(f).then(function (d) {
      e.lecture = false; e.donnees = d;
      if (!App.donnees) { App.remplacerDonnees(d, f.name); return; }
      App.rendre();
    }, function (err) {
      e.lecture = false; e.erreur = err.message;
      App.rendre();
    });
  }

  R.Pages.accueil = {
    titre: function () { return 'Accueil'; },
    rendu: function () {
      var e = App.etat.import || {};
      return h('div', { class: 'page' },
        h('div', { class: 'carte accueil' },
          h('h1', null, 'Bienvenue'),
          h('p', null, 'Aucune donnée dans ce navigateur pour l’instant. Pour commencer :'),
          e.erreur ? h('div', { class: 'message message-ko', role: 'alert' }, e.nom + ' : ' + e.erreur) : null,
          h('div', { class: 'rangee' },
            h('button', { class: 'btn btn-grand btn-principal', onclick: chargerDemarrage }, 'Charger les données de démarrage (semaine 42)'),
            boutonFichier('Ouvrir un fichier reçu (.json)…', false, lire))));
    }
  };

  R.Pages.import = {
    titre: function () { return 'Importer'; },
    rendu: function () {
      var e = App.etat.import || {};
      var m = App.meta;
      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' }, h('h1', null, 'Fichier : importer')),
        h('div', { class: 'cartes' },
          h('div', { class: 'carte carte-etape' },
            h('span', { class: 'etape' }, '1 · Ouvrir un fichier reçu'),
            h('div', { class: 'grand gras' }, 'Remplacer la copie de travail par un fichier'),
            boutonFichier('Ouvrir un fichier…', true, lire),
            e.lecture ? h('div', { class: 'petit' }, 'Lecture de ' + e.nom + '…') : null,
            e.erreur ? h('div', { class: 'message message-ko', role: 'alert' }, e.nom + ' : ' + e.erreur) : null,
            e.donnees ? h('div', { class: 'encadre' },
              h('div', { class: 'gras' }, e.nom), h('div', null, resume(e.donnees)),
              h('div', { class: 'rangee' },
                h('button', { class: 'btn btn-principal', onclick: function () { var d = e.donnees, n = e.nom; App.etat.import = null; App.remplacerDonnees(d, n); } },
                  'Remplacer la copie de travail'),
                h('button', { class: 'btn', onclick: function () { App.etat.import = null; App.rendre(); } }, 'Annuler'))) : null,
            m.nonExporte ? h('div', { class: 'message message-attention' }, 'Attention : la copie actuelle a des modifications non exportées. Exportez-la d’abord si vous voulez les garder.') : null),
          h('div', { class: 'carte carte-etape' },
            h('span', { class: 'etape' }, '2 · Copie de travail actuelle'),
            h('div', null, resume(App.donnees)),
            h('div', { class: 'petit' }, 'Origine : ' + (m.fichier || 'inconnue') + (m.importeLe ? ' · importée le ' + O.dateCourte(new Date(m.importeLe).toISOString().slice(0, 10)) : '')),
            h('div', { class: 'petit' }, 'Enregistrée dans ce navigateur' + (m.sauveLe ? ' à ' + O.heure(m.sauveLe) : '') + '. Exportez régulièrement.'),
            h('button', { class: 'btn', onclick: chargerDemarrage }, 'Recharger les données de démarrage (semaine 42)'))));
    }
  };

  R.Pages.export = {
    titre: function () { return 'Exporter'; },
    rendu: function () {
      var s = App.semaineCourante();
      var e = App.etat.export = App.etat.export || {};
      if (!e.nom || e.semaine !== s.id) { e.nom = S.nomExport(App.donnees, s); e.semaine = s.id; }
      var fsa = S.fichierLieDisponible();
      function fait(texte) { e.message = texte; e.erreur = ''; App.marquerExporte(); }
      function echec(err) { if (err && err.name === 'AbortError') return; e.erreur = 'Enregistrement impossible : ' + (err && err.message); App.rendre(); }
      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' }, h('h1', null, 'Fichier : exporter')),
        h('div', { class: 'cartes' },
          h('div', { class: 'carte carte-etape' },
            h('span', { class: 'etape' }, 'Export (client → prestataire)'),
            h('div', { class: 'grand gras' }, 'Exporter la copie de travail'),
            h('div', { class: 'champ' }, h('label', { for: 'x-semaine' }, 'Semaine envoyée (donne le nom du fichier)'),
              h('select', { id: 'x-semaine', onchange: function (ev) { App.choisirSemaine(ev.target.value); } },
                App.donnees.semaines.map(function (x) { return h('option', { value: x.id, selected: x.id === s.id }, O.titreSemaine(x)); }))),
            h('div', { class: 'champ' }, h('label', { for: 'x-nom' }, 'Nom du fichier'),
              h('input', { id: 'x-nom', value: e.nom, oninput: function (ev) { e.nom = ev.target.value; } })),
            h('button', { class: 'btn btn-grand btn-principal', onclick: function () {
              S.telecharger(App.donnees, e.nom.trim() || S.nomExport(App.donnees, s));
              fait('Fichier téléchargé : ' + e.nom + ' (dossier Téléchargements, ou dossier choisi par le navigateur).');
            } }, 'Télécharger le fichier'),
            fsa ? h('div', { class: 'rangee' },
              h('button', { class: 'btn', onclick: function () {
                S.enregistrerSous(App.donnees, e.nom).then(function () { fait('Enregistré dans ' + S.nomFichierLie() + '.'); }, echec);
              } }, 'Enregistrer sous… (choisir le dossier)'),
              S.nomFichierLie() ? h('button', { class: 'btn', onclick: function () {
                S.enregistrerLie(App.donnees).then(function () { fait('Fichier ' + S.nomFichierLie() + ' mis à jour.'); }, echec);
              } }, 'Enregistrer à nouveau dans ' + S.nomFichierLie()) : null) : null,
            e.message ? h('div', { class: 'message message-ok', role: 'status' }, e.message) : null,
            e.erreur ? h('div', { class: 'message message-ko', role: 'alert' }, e.erreur) : null,
            h('div', { class: 'encadre' }, 'Envoyez ensuite ce fichier au prestataire (clé USB, dossier partagé ou mail).'))));
    }
  };
})(window.Recueil = window.Recueil || {});
