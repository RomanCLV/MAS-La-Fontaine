/* Copie de travail (stockage du navigateur) et échange de fichiers JSON. */
(function (R) {
  'use strict';
  var M = R.Modele;
  var CLE_DONNEES = 'recueil.donnees';
  var CLE_META = 'recueil.meta';
  var CLE_UI = 'recueil.ui';
  var CLE_AVANT_MIGRATION = 'recueil.donnees.avant-migration'; // { le, version, donnees } : cache d'avant la dernière migration
  var CLES = [CLE_DONNEES, CLE_META, CLE_UI, CLE_AVANT_MIGRATION];
  var fichierLie = null; // bonus File System Access (Chrome/Edge), gardé pour la session

  function lireTexte(cle) {
    try { return window.localStorage.getItem(cle) || ''; } catch (e) { return ''; }
  }
  function lire(cle) {
    try {
      var t = lireTexte(cle);
      return t ? JSON.parse(t) : null;
    } catch (e) { return null; }
  }
  function ecrire(cle, valeur) {
    try {
      window.localStorage.setItem(cle, JSON.stringify(valeur));
      return true;
    } catch (e) { return false; }
  }

  // Copie de travail, migrée au format de cette version de l'application.
  // Renvoie { donnees } ; { donnees: null } si le cache est vide ; { donnees: null, erreur, texte } s'il est illisible :
  // rien n'est alors effacé (l'application propose de télécharger le texte brut avant de le remplacer).
  // Ancienne version : l'original est d'abord gardé dans CLE_AVANT_MIGRATION, puis le cache est réécrit migré.
  function chargerCopie() {
    var texte = lireTexte(CLE_DONNEES);
    if (!texte) return { donnees: null };
    var brut, d;
    try {
      brut = JSON.parse(texte);
      d = M.migrer(brut);
    } catch (e) {
      return { donnees: null, erreur: e instanceof SyntaxError ? 'les données ne sont pas un JSON valide.' : e.message, texte: texte };
    }
    var version = Math.floor(+brut.version) || 1;
    if (version < M.VERSION && ecrire(CLE_AVANT_MIGRATION, { le: Date.now(), version: version, donnees: brut })) ecrire(CLE_DONNEES, d);
    return { donnees: d };
  }
  // Cache d'avant la dernière migration (ou null) : { le, version, donnees }.
  function avantMigration() { return lire(CLE_AVANT_MIGRATION); }
  // Renvoie false si le navigateur refuse d'enregistrer (stockage bloqué ou plein).
  function sauverCopie(donnees, meta) {
    return ecrire(CLE_DONNEES, donnees) && ecrire(CLE_META, meta || {});
  }
  function meta() { return lire(CLE_META) || {}; }
  function lireUi() { return lire(CLE_UI) || {}; }
  function sauverUi(ui) { ecrire(CLE_UI, ui); }

  // Cache local = tout ce que l'application garde dans ce navigateur (copie de travail, infos, affichage,
  // copie d'avant migration). Taille approximative en caractères (≈ octets) ; vider() efface tout.
  function tailleCache() {
    var n = 0;
    CLES.forEach(function (cle) { n += lireTexte(cle).length; });
    return n;
  }
  function vider() {
    try {
      CLES.forEach(function (cle) { window.localStorage.removeItem(cle); });
      return true;
    } catch (e) { return false; }
  }

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

  function telecharger(donnees, nom) { telechargerTexte(texteExport(donnees), nom); }
  // Texte tel quel (cache illisible, copie d'avant migration), sans passer par migrer.
  function telechargerTexte(texte, nom) {
    var blob = new Blob([texte], { type: 'application/json' });
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
    chargerCopie: chargerCopie, avantMigration: avantMigration, sauverCopie: sauverCopie, meta: meta, lireUi: lireUi, sauverUi: sauverUi,
    tailleCache: tailleCache, vider: vider,
    lireFichier: lireFichier, texteExport: texteExport, nomExport: nomExport, telecharger: telecharger, telechargerTexte: telechargerTexte,
    fichierLieDisponible: fichierLieDisponible, nomFichierLie: nomFichierLie,
    enregistrerSous: enregistrerSous, enregistrerLie: enregistrerLie
  };
})(window.Recueil = window.Recueil || {});
