/* Page Options : données en cache (ce que l'application garde dans ce navigateur) et bouton pour les vider. */
(function (R) {
  'use strict';
  var S = R.Stockage, h = R.h, O = R.Outils, App = R.App;

  function taille(n) {
    if (n < 1024) return n + ' octets';
    if (n < 1024 * 1024) return 'environ ' + Math.round(n / 1024) + ' Ko';
    return 'environ ' + (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' Mo';
  }
  function quand(ts) {
    return ts ? O.dateCourte(new Date(ts - new Date(ts).getTimezoneOffset() * 60000).toISOString().slice(0, 10)) + ' à ' + O.heure(ts) : 'inconnu';
  }

  // Pages qui ont un bouton « Enregistrer » (type d'onglet → libellé, ce qui est enregistré).
  var PAGES_FERMABLES = [
    { type: 'resident', nom: 'Fiche résident', detail: 'la fiche d’un résident' },
    { type: 'residents', nom: 'Résidents', detail: 'le tableau des résidents' },
    { type: 'parcs', nom: 'Parcs', detail: 'un parc' },
    { type: 'regimes', nom: 'Régimes', detail: 'une texture, un régime ou une option' },
    { type: 'activites', nom: 'Activités', detail: 'une activité' }
  ];

  function basculerFermeture(type, on) {
    var liste = App.ui.fermerApres.filter(function (t) { return t !== type; });
    if (on) liste.push(type);
    App.ui.fermerApres = PAGES_FERMABLES.map(function (p) { return p.type; }).filter(function (t) { return liste.indexOf(t) >= 0; });
    App.sauverUi();
    App.rendre();
  }

  function vider() {
    var m = App.meta;
    var texte = 'Vider le cache local ?\n\nLa copie de travail est effacée de ce navigateur (semaines, résidents, parcs, activités), ' +
      'ainsi que les onglets ouverts et les préférences d’affichage. L’application revient à l’écran d’accueil.\n\n' +
      'Les fichiers .json déjà exportés ne sont pas touchés.' +
      (m.nonExporte ? '\n\nAttention : la copie actuelle a des modifications non exportées, elles seront perdues.' : '');
    App.confirmer(texte, function () {
      if (!App.viderCache()) {
        App.etat.options = { erreur: 'Le navigateur a refusé d’effacer le cache. Fermez les autres onglets de l’application et réessayez.' };
        App.rendre();
      }
    }, { ok: 'Vider le cache', danger: true });
  }

  R.Pages.options = {
    titre: function () { return 'Options'; },
    rendu: function () {
      var m = App.meta, e = App.etat.options || {}, avant = S.avantMigration();
      return h('div', { class: 'page' },
        h('div', { class: 'page-tete' }, h('h1', null, 'Options')),
        h('div', { class: 'cartes' },
          h('div', { class: 'carte carte-etape' },
            h('span', { class: 'etape' }, 'Enregistrement'),
            h('div', { class: 'grand gras' }, 'Fermer la page après avoir enregistré'),
            h('div', { class: 'petit' }, 'Cochez les pages dont l’onglet doit se fermer dès qu’un bouton « Enregistrer » a réussi. ' +
              'Pages non cochées (par défaut) : la page reste ouverte.'),
            h('fieldset', { class: 'groupe-choix colonne' }, h('legend', null, 'Pages'),
              PAGES_FERMABLES.map(function (p) {
                var on = App.ui.fermerApres.indexOf(p.type) >= 0;
                return h('label', { class: 'choix' + (on ? ' on' : '') },
                  h('input', { type: 'checkbox', checked: on, onchange: function (ev) { basculerFermeture(p.type, ev.target.checked); } }),
                  h('span', { class: 'gras' }, p.nom), h('span', { class: 'petit' }, '— après avoir enregistré ' + p.detail));
              }))),
          h('div', { class: 'carte carte-etape' },
            h('span', { class: 'etape' }, 'Données en cache'),
            h('div', { class: 'grand gras' }, 'Copie de travail gardée dans ce navigateur'),
            h('div', { class: 'petit' }, 'L’application enregistre automatiquement votre travail dans ce navigateur, sur ce poste, pour le retrouver à la réouverture. ' +
              'Ce cache n’est pas partagé avec les autres postes ni les autres navigateurs : pour transmettre les données, utilisez Exporter.'),
            h('div', { class: 'encadre' },
              h('div', null, h('span', { class: 'gras' }, 'Contenu : '), O.resumeDonnees(App.donnees)),
              h('div', null, h('span', { class: 'gras' }, 'Origine : '), m.fichier || 'inconnue'),
              h('div', null, h('span', { class: 'gras' }, 'Dernier enregistrement : '), quand(m.sauveLe)),
              h('div', null, h('span', { class: 'gras' }, 'Dernier export : '), m.exporteLe ? quand(m.exporteLe) : 'jamais'),
              h('div', null, h('span', { class: 'gras' }, 'Place occupée : '), taille(S.tailleCache()))),
            m.nonExporte ? h('div', { class: 'message message-attention' },
              'Attention : la copie actuelle a des modifications non exportées. Exportez-la d’abord si vous voulez les garder. ',
              h('button', { class: 'btn', onclick: function () { App.ouvrir('export'); } }, 'Exporter…')) : null,
            e.erreur ? h('div', { class: 'message message-ko', role: 'alert' }, e.erreur) : null,
            avant ? h('div', { class: 'petit' },
              'Copie gardée avant la dernière mise à jour du format des données (version ' + avant.version + ', le ' + quand(avant.le) + '). ',
              h('button', { class: 'btn', onclick: function () {
                S.telechargerTexte(JSON.stringify(avant.donnees, null, 1), 'Recueil avant mise à jour (version ' + avant.version + ').json');
              } }, 'Télécharger cette copie')) : null,
            h('div', { class: 'rangee' },
              h('button', { class: 'btn btn-danger', onclick: vider }, 'Vider le cache local')),
            h('div', { class: 'petit' }, 'Utile pour repartir d’une application propre, ou avant de laisser le poste à quelqu’un d’autre. ' +
              'Ensuite, l’écran d’accueil propose d’ouvrir un fichier ou de commencer avec une base vide.'))));
    }
  };
})(window.Recueil = window.Recueil || {});
