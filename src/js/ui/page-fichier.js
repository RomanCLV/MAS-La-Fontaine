/* Accueil (aucune donnée), page Importer et page Exporter. */
(function (R) {
  'use strict';
  var M = R.Modele, S = R.Stockage, h = R.h, O = R.Outils, App = R.App;

  function repartirDeZero() {
    function vider() { App.remplacerDonnees(M.baseVide(), 'base vide', { presentation: 'vide' }); }
    if (!App.donnees) { vider(); return; }
    App.confirmer('Repartir de zéro ?\n\nLa copie de travail est remplacée par une base vide : aucun parc, aucun résident, ' +
      'aucune activité, seulement la semaine en cours. Les textures, régimes et options reprennent la liste par défaut.' +
      (App.meta.nonExporte ? '\n\nAttention : la copie actuelle a des modifications non exportées, elles seront perdues.' : ''),
      vider, { ok: 'Repartir de zéro', danger: true });
  }

  // Champ fichier caché : un vrai bouton appelle .click() dessus.
  function champFichier(surFichier) {
    return h('input', { type: 'file', accept: '.json,application/json', class: 'cache', 'aria-hidden': 'true', tabindex: '-1',
      onchange: function (e) { var f = e.target.files[0]; e.target.value = ''; if (f) surFichier(f); } });
  }

  // Bouton « Ouvrir un fichier… ».
  function boutonFichier(texte, principal, surFichier) {
    var input = champFichier(surFichier);
    return h('span', null, input, h('button', { class: 'btn btn-grand' + (principal ? ' btn-principal' : ''), onclick: function () { input.click(); } }, texte));
  }

  // Grand bouton de l'accueil : titre + une ligne d'explication.
  function tuile(titre, detail, onclick, principale) {
    return h('button', { class: 'tuile' + (principale ? ' tuile-principale' : ''), onclick: onclick },
      h('span', { class: 'tuile-titre' }, titre), h('span', { class: 'tuile-detail' }, detail));
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
      var fichier = champFichier(lire);
      var illisible = App.copieIllisible;
      // Deux familles : reprendre des données existantes (plus tard : depuis Excel) / créer une base neuve.
      return h('div', { class: 'page' },
        h('div', { class: 'carte accueil' },
          h('h1', null, 'Bienvenue'),
          illisible ? h('div', { class: 'message message-ko', role: 'alert' },
            h('div', { class: 'gras' }, 'Les données enregistrées dans ce navigateur n’ont pas pu être lues : ' + illisible.erreur),
            h('div', null, 'Elles sont gardées telles quelles. Téléchargez-les pour pouvoir les faire récupérer, ' +
              'puis ouvrez votre dernier fichier exporté ou commencez une nouvelle base.'),
            h('div', { class: 'rangee' }, h('button', { class: 'btn', onclick: function () {
              S.telechargerTexte(illisible.texte, 'Recueil données illisibles ' + M.aujourdhui() + '.json');
            } }, 'Télécharger les données illisibles'))) : null,
          h('p', null, illisible ? 'Pour continuer :' : 'Aucune donnée dans ce navigateur pour l’instant. Pour commencer :'),
          e.lecture ? h('div', { class: 'message', role: 'status' }, 'Lecture de ' + e.nom + '…') : null,
          e.erreur ? h('div', { class: 'message message-ko', role: 'alert' }, e.nom + ' : ' + e.erreur) : null,
          h('section', { class: 'accueil-groupe', 'aria-labelledby': 'acc-reprendre' },
            h('h2', { id: 'acc-reprendre' }, 'Reprendre des données existantes'),
            h('div', { class: 'tuiles' },
              fichier,
              tuile('Ouvrir un fichier reçu…', 'Fichier .json exporté par l’application (par le client ou le prestataire).',
                function () { fichier.click(); }, true))),
          h('section', { class: 'accueil-groupe', 'aria-labelledby': 'acc-creer' },
            h('h2', { id: 'acc-creer' }, 'Créer une nouvelle base'),
            h('div', { class: 'tuiles' },
              tuile('MAS La Fontaine', 'Les 7 parcs et l’activité Sport du jeudi midi, prêts à remplir.',
                function () { App.remplacerDonnees(M.baseMasLaFontaine(), 'base MAS La Fontaine', { presentation: 'mas' }); }),
              tuile('Base vide', 'Aucun parc ni résident. Textures, régimes et options par défaut.', repartirDeZero))),
          h('section', { class: 'accueil-groupe', 'aria-labelledby': 'acc-aide' },
            h('h2', { id: 'acc-aide' }, 'Besoin d’aide ?'),
            h('div', { class: 'tuiles' },
              h('a', { class: 'tuile', href: R.Aide.lienGuide(), target: '_blank', rel: 'noopener' },
                h('span', { class: 'tuile-titre' }, 'Guide d’utilisation'),
                h('span', { class: 'tuile-detail' }, 'Comment fonctionne l’application, page par page (s’ouvre dans un nouvel onglet).')))),
          h('p', { class: 'petit accueil-version' }, 'Version ' + M.VERSION_APP + ' · ',
            h('button', { class: 'lien', onclick: function () { R.AideUi.nouveautes(); } }, 'Nouveautés'), ' · ',
            h('a', { href: R.Aide.lienGuide(), target: '_blank', rel: 'noopener' }, 'Guide d’utilisation'))));
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
              h('div', { class: 'gras' }, e.nom), h('div', null, O.resumeDonnees(e.donnees)),
              h('div', { class: 'rangee' },
                h('button', { class: 'btn btn-principal', onclick: function () { var d = e.donnees, n = e.nom; App.etat.import = null; App.remplacerDonnees(d, n); } },
                  'Remplacer la copie de travail'),
                h('button', { class: 'btn', onclick: function () { App.etat.import = null; App.rendre(); } }, 'Annuler'))) : null,
            m.nonExporte ? h('div', { class: 'message message-attention' }, 'Attention : la copie actuelle a des modifications non exportées. Exportez-la d’abord si vous voulez les garder.') : null),
          h('div', { class: 'carte carte-etape' },
            h('span', { class: 'etape' }, '2 · Copie de travail actuelle'),
            h('div', null, O.resumeDonnees(App.donnees)),
            h('div', { class: 'petit' }, 'Origine : ' + (m.fichier || 'inconnue') + (m.importeLe ? ' · importée le ' + O.dateCourte(new Date(m.importeLe).toISOString().slice(0, 10)) : '')),
            h('div', { class: 'petit' }, 'Enregistrée dans ce navigateur' + (m.sauveLe ? ' à ' + O.heure(m.sauveLe) : '') + '. Exportez régulièrement.'),
            h('div', { class: 'rangee' },
              h('button', { class: 'btn btn-danger', onclick: repartirDeZero }, 'Repartir de zéro (base vide)')))));
    }
  };

  R.Pages.export = {
    titre: function () { return 'Exporter'; },
    rendu: function () {
      var s = App.semaineCourante();
      var e = App.etat.export = App.etat.export || {};
      if (!e.nom || e.semaine !== s.id) { e.nom = S.nomExport(App.donnees, s); e.semaine = s.id; }
      var fsa = S.fichierLieDisponible();
      function fait(texte) { e.message = texte; e.erreur = ''; App.marquerExporte(); App.toast('Fichier exporté'); }
      function echec(err) { if (err && err.name === 'AbortError') return; e.erreur = 'Enregistrement impossible : ' + (err && err.message); App.rendre(); }
      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' }, h('h1', null, 'Fichier : exporter')),
        h('div', { class: 'cartes' },
          h('div', { class: 'carte carte-etape' },
            h('span', { class: 'etape' }, 'Export (client → prestataire)'),
            h('div', { class: 'grand gras' }, 'Exporter la copie de travail'),
            h('div', { class: 'champ' }, h('label', { for: 'x-semaine' }, 'Semaine envoyée (donne le nom du fichier)'),
              h('select', { id: 'x-semaine', onchange: function (ev) { App.choisirSemaine(ev.target.value); } },
                App.donnees.semaines.slice().reverse().map(function (x) { return h('option', { value: x.id, selected: x.id === s.id }, O.titreSemaine(x)); }))),
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
