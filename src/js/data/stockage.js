/* Copie de travail (stockage du navigateur) et échange de fichiers JSON. */
(function (R) {
  'use strict';
  var M = R.Modele;
  var CLE_DONNEES = 'recueil.donnees';
  var CLE_META = 'recueil.meta';
  var CLE_UI = 'recueil.ui';
  var fichierLie = null; // bonus File System Access (Chrome/Edge), gardé pour la session

  function lire(cle) {
    try {
      var t = window.localStorage.getItem(cle);
      return t ? JSON.parse(t) : null;
    } catch (e) { return null; }
  }
  function ecrire(cle, valeur) {
    try {
      window.localStorage.setItem(cle, JSON.stringify(valeur));
      return true;
    } catch (e) { return false; }
  }

  function chargerCopie() {
    var d = lire(CLE_DONNEES);
    if (!d) return null;
    try { return M.migrer(d); } catch (e) { return null; }
  }
  // Renvoie false si le navigateur refuse d'enregistrer (stockage bloqué ou plein).
  function sauverCopie(donnees, meta) {
    return ecrire(CLE_DONNEES, donnees) && ecrire(CLE_META, meta || {});
  }
  function meta() { return lire(CLE_META) || {}; }
  function lireUi() { return lire(CLE_UI) || {}; }
  function sauverUi(ui) { ecrire(CLE_UI, ui); }

  function lireFichier(file) {
    return new Promise(function (ok, ko) {
      var lecteur = new FileReader();
      lecteur.onload = function () {
        try {
          ok(M.migrer(JSON.parse(lecteur.result)));
        } catch (e) {
          ko(e instanceof SyntaxError ? new Error('Le fichier n\'est pas un JSON valide.') : e);
        }
      };
      lecteur.onerror = function () { ko(new Error('Lecture du fichier impossible.')); };
      lecteur.readAsText(file, 'utf-8');
    });
  }

  function texteExport(donnees) {
    var d = M.copie(donnees);
    d.exporteLe = M.aujourdhui();
    return JSON.stringify(d, null, 1);
  }

  var MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  function nomExport(donnees, semaine) {
    var fin = M.ajouterJours(semaine.debut, 6);
    var n = M.numeroSemaine(semaine.debut).numero;
    return 'MLF S' + n + ' - ' + (+semaine.debut.slice(8)) + ' au ' + (+fin.slice(8)) + ' ' +
      MOIS_COURTS[+fin.slice(5, 7) - 1].replace('.', '') + ' ' + fin.slice(0, 4) + '.json';
  }

  function telecharger(donnees, nom) {
    var blob = new Blob([texteExport(donnees)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = /\.json$/i.test(nom) ? nom : nom + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  // ---- Bonus Chrome/Edge : enregistrer dans un fichier choisi, puis le réécrire ----
  function fichierLieDisponible() { return typeof window.showSaveFilePicker === 'function'; }
  function nomFichierLie() { return fichierLie ? fichierLie.name : ''; }
  function ecrireFichierLie(donnees) {
    return fichierLie.createWritable().then(function (w) {
      return w.write(texteExport(donnees)).then(function () { return w.close(); });
    });
  }
  function enregistrerSous(donnees, nom) {
    return window.showSaveFilePicker({
      suggestedName: nom,
      types: [{ description: 'Fichier recueil (JSON)', accept: { 'application/json': ['.json'] } }]
    }).then(function (h) { fichierLie = h; return ecrireFichierLie(donnees); });
  }
  function enregistrerLie(donnees) { return ecrireFichierLie(donnees); }

  R.Stockage = {
    chargerCopie: chargerCopie, sauverCopie: sauverCopie, meta: meta, lireUi: lireUi, sauverUi: sauverUi,
    lireFichier: lireFichier, texteExport: texteExport, nomExport: nomExport, telecharger: telecharger,
    fichierLieDisponible: fichierLieDisponible, nomFichierLie: nomFichierLie,
    enregistrerSous: enregistrerSous, enregistrerLie: enregistrerLie
  };
})(window.Recueil = window.Recueil || {});
