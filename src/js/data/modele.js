/* Modèle de données : constantes, dates, création d'objets, migration.
   Pur : aucun accès à l'écran ni au stockage (testé par tests.html). */
(function (R) {
  'use strict';

  var VERSION = 2; // 2 : nettoyage séparé en standard (nettoyage) et sans viande (nettoyageSansViande)
  var APP = 'recueil-alimentation-mas-la-fontaine';

  var JOURS = [
    { id: 'lun', nom: 'Lundi', court: 'lun.' },
    { id: 'mar', nom: 'Mardi', court: 'mar.' },
    { id: 'mer', nom: 'Mercredi', court: 'mer.' },
    { id: 'jeu', nom: 'Jeudi', court: 'jeu.' },
    { id: 'ven', nom: 'Vendredi', court: 'ven.' },
    { id: 'sam', nom: 'Samedi', court: 'sam.' },
    { id: 'dim', nom: 'Dimanche', court: 'dim.' }
  ];
  var SERVICES = [
    { id: 'midi', nom: 'Midi' },
    { id: 'soir', nom: 'Soir' }
  ];
  var CRENEAUX = [];
  JOURS.forEach(function (j) {
    SERVICES.forEach(function (s) { CRENEAUX.push(j.id + '_' + s.id); });
  });

  // Identifiants du référentiel utilisés par les calculs.
  var TEXTURE_DEFAUT = 'normal';
  var REGIME_SANS_PORC = 'sans_porc';   // salariés « sans porc »
  var REGIME_NETTOYAGE = 'sans_viande'; // ligne « Nettoyage sans viande » (halal : œufs/poisson)
  var COULEUR_ACTIVITE = '#2d6cb5';     // couleur par défaut d'une activité (bleu de l'interface)

  function creneau(jour, service) { return jour + '_' + service; }
  function decoupeCreneau(c) {
    var p = c.split('_');
    return { jour: p[0], service: p[1] };
  }
  function indexJour(jourId) {
    for (var i = 0; i < JOURS.length; i++) if (JOURS[i].id === jourId) return i;
    return -1;
  }
  function jour(jourId) { return JOURS[indexJour(jourId)]; }
  function service(serviceId) {
    return serviceId === 'soir' ? SERVICES[1] : SERVICES[0];
  }

  // ---- Dates ISO "AAAA-MM-JJ", calculées en UTC (pas d'effet heure d'été) ----
  function versJours(iso) {
    var p = iso.split('-');
    return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  }
  function depuisJours(n) {
    return new Date(n * 86400000).toISOString().slice(0, 10);
  }
  function ajouterJours(iso, n) { return depuisJours(versJours(iso) + n); }
  function jourSemaineIso(iso) { // 1 = lundi … 7 = dimanche
    var d = new Date(versJours(iso) * 86400000).getUTCDay();
    return d === 0 ? 7 : d;
  }
  function lundiDe(iso) { return ajouterJours(iso, 1 - jourSemaineIso(iso)); }
  function dateDuJour(semaine, jourId) { return ajouterJours(semaine.debut, indexJour(jourId)); }
  function dateDuCreneau(semaine, c) { return dateDuJour(semaine, decoupeCreneau(c).jour); }
  function numeroSemaine(iso) {
    var jeudi = ajouterJours(lundiDe(iso), 3);
    var annee = +jeudi.slice(0, 4);
    var premierJeudi = ajouterJours(lundiDe(annee + '-01-04'), 3);
    return { annee: annee, numero: 1 + Math.round((versJours(jeudi) - versJours(premierJeudi)) / 7) };
  }
  function idSemaine(debut) {
    var n = numeroSemaine(debut);
    return n.annee + '-S' + (n.numero < 10 ? '0' : '') + n.numero;
  }
  function aujourdhui() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  // ---- Création ----
  function nouvelId(prefixe) {
    return prefixe + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function semaineVide(debut) {
    var lundi = lundiDe(debut);
    return {
      id: idSemaine(lundi), debut: lundi, presences: {}, activites: [],
      salaries: {}, sodexo: {}, direction: {}, nettoyage: {}, nettoyageSansViande: {}, temoins: {}, alertesTraitees: []
    };
  }

  // Nouvelle semaine : reprend les effectifs fixes (salariés, Sodexo, direction, nettoyage, plats témoins),
  // pas les présences ni les activités (les presets servent à les recréer).
  function semaineSuivante(semaine) {
    var s = semaineVide(ajouterJours(semaine.debut, 7));
    s.salaries = copie(semaine.salaries || {});
    s.sodexo = copie(semaine.sodexo || {});
    s.direction = copie(semaine.direction || {});
    s.nettoyage = copie(semaine.nettoyage || {});
    s.nettoyageSansViande = copie(semaine.nettoyageSansViande || {});
    s.temoins = copie(semaine.temoins || {});
    return s;
  }

  function residentVide(parcId) {
    return {
      id: nouvelId('r'), nom: '', prenom: '', parcId: parcId || '', textureId: TEXTURE_DEFAUT,
      regimeIds: [], optionIds: [], consigne: '', archive: false, absences: []
    };
  }

  function nomAffiche(r) {
    return ((r.nom || '') + ' ' + (r.prenom || '')).trim() || '(sans nom)';
  }

  function copie(o) { return JSON.parse(JSON.stringify(o)); }

  // ---- Migration / normalisation d'un fichier importé ----
  function tableau(v) { return Array.isArray(v) ? v : []; }
  function objet(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function nombre(v) { v = +v; return isFinite(v) && v > 0 ? Math.floor(v) : 0; }

  function migrer(entree) {
    if (!entree || typeof entree !== 'object') throw new Error('Ce fichier ne contient pas de données lisibles.');
    if (entree.app !== APP) throw new Error('Ce fichier n\'est pas un fichier « Recueil Alimentation ».');
    if (+entree.version > VERSION) {
      throw new Error('Ce fichier vient d\'une version plus récente de l\'application (version ' + entree.version + ').');
    }
    var ancienne = (+entree.version || 1) < 2;
    var d = copie(entree);
    d.version = VERSION;
    d.etablissement = d.etablissement || 'MAS La Fontaine';
    d.referentiels = objet(d.referentiels);
    d.referentiels.parcs = tableau(d.referentiels.parcs).map(function (p, i) {
      return { id: String(p.id), nom: p.nom || p.id, couleur: p.couleur || '#dddddd', ordre: p.ordre || i + 1 };
    });
    d.referentiels.parcs.sort(function (a, b) { return a.ordre - b.ordre; });
    d.referentiels.regimes = tableau(d.referentiels.regimes).map(function (g) {
      var n = { id: String(g.id), nom: g.nom || g.id, abrege: g.abrege || '', couleur: g.couleur || '#dddddd' };
      n.nature = (g.nature === 'texture' || g.nature === 'option') ? g.nature : 'regime';
      if (n.nature === 'option') n.affecte = g.affecte || '';
      return n;
    });
    d.residents = tableau(d.residents).map(function (r) {
      return {
        id: String(r.id), nom: r.nom || '', prenom: r.prenom || '', parcId: r.parcId || '',
        textureId: r.textureId || TEXTURE_DEFAUT,
        regimeIds: tableau(r.regimeIds).slice(), optionIds: tableau(r.optionIds).slice(),
        consigne: r.consigne || '', archive: !!r.archive,
        absences: tableau(r.absences).filter(function (a) { return a && a.debut && a.fin; }).map(function (a) {
          return { debut: a.debut, fin: a.fin, services: tableau(a.services).length ? a.services.slice() : ['midi', 'soir'] };
        })
      };
    });
    d.presetsActivites = tableau(d.presetsActivites).map(function (p) {
      return { id: String(p.id), nom: p.nom || '', jours: tableau(p.jours), services: tableau(p.services), participantIds: tableau(p.participantIds),
        couleur: p.couleur || COULEUR_ACTIVITE };
    });
    d.semaines = tableau(d.semaines).map(function (s) {
      var n = {
        id: s.id || idSemaine(s.debut), debut: lundiDe(s.debut),
        presences: objet(s.presences), activites: tableau(s.activites).map(function (a) {
          return { id: a.id || nouvelId('a'), nom: a.nom || 'Activité', jour: a.jour || 'lun', service: a.service || 'midi',
            participantIds: tableau(a.participantIds), presetId: a.presetId || null, couleur: a.couleur || COULEUR_ACTIVITE };
        }),
        salaries: objet(s.salaries), sodexo: {}, direction: {}, nettoyage: {}, nettoyageSansViande: {}, temoins: {},
        alertesTraitees: tableau(s.alertesTraitees)
      };
      // Sodexo : ancien format possible = un nombre par créneau.
      Object.keys(objet(s.sodexo)).forEach(function (c) {
        var v = s.sodexo[c];
        n.sodexo[c] = typeof v === 'object' && v ? { standard: nombre(v.standard), sansPorc: nombre(v.sansPorc) } : { standard: nombre(v), sansPorc: 0 };
      });
      Object.keys(objet(s.direction)).forEach(function (c) { n.direction[c] = nombre(s.direction[c]); });
      // Version 1 : tout le nettoyage était « sans viande » → passe dans nettoyageSansViande.
      var nettoyageSV = ancienne ? s.nettoyage : s.nettoyageSansViande;
      if (!ancienne) Object.keys(objet(s.nettoyage)).forEach(function (c) { n.nettoyage[c] = nombre(s.nettoyage[c]); });
      Object.keys(objet(nettoyageSV)).forEach(function (c) { n.nettoyageSansViande[c] = nombre(nettoyageSV[c]); });
      Object.keys(objet(s.temoins)).forEach(function (c) { n.temoins[c] = nombre(s.temoins[c]); });
      return n;
    });
    d.semaines.sort(function (a, b) { return a.debut < b.debut ? -1 : 1; });
    if (!d.semaines.length) d.semaines.push(semaineVide(aujourdhui()));
    return d;
  }

  // ---- Accès pratiques ----
  function refs(donnees) {
    var m = {};
    donnees.referentiels.regimes.forEach(function (g) { m[g.id] = g; });
    return m;
  }
  function parc(donnees, id) {
    return donnees.referentiels.parcs.filter(function (p) { return p.id === id; })[0] || null;
  }
  function resident(donnees, id) {
    return donnees.residents.filter(function (r) { return r.id === id; })[0] || null;
  }
  function semaine(donnees, id) {
    return donnees.semaines.filter(function (s) { return s.id === id; })[0] || null;
  }
  function parNature(donnees, nature) {
    return donnees.referentiels.regimes.filter(function (g) { return g.nature === nature; });
  }
  // Régimes rangés par nature (textures, régimes, options), ordre du référentiel dans chaque groupe.
  // filtre(g) facultatif. Renvoie les groupes non vides : [{ nature, nom, regimes }].
  var GROUPES = [{ nature: 'texture', nom: 'Textures' }, { nature: 'regime', nom: 'Régimes' }, { nature: 'option', nom: 'Options' }];
  function groupesRegimes(donnees, filtre) {
    return GROUPES.map(function (gr) {
      return { nature: gr.nature, nom: gr.nom, regimes: parNature(donnees, gr.nature).filter(function (g) { return !filtre || filtre(g); }) };
    }).filter(function (gr) { return gr.regimes.length; });
  }
  function textureDefaut(donnees) {
    var t = parNature(donnees, 'texture');
    var n = t.filter(function (g) { return g.id === TEXTURE_DEFAUT; })[0];
    return n ? n.id : (t[0] ? t[0].id : TEXTURE_DEFAUT);
  }

  R.Modele = {
    VERSION: VERSION, APP: APP, JOURS: JOURS, SERVICES: SERVICES, CRENEAUX: CRENEAUX,
    TEXTURE_DEFAUT: TEXTURE_DEFAUT, REGIME_SANS_PORC: REGIME_SANS_PORC, REGIME_NETTOYAGE: REGIME_NETTOYAGE, COULEUR_ACTIVITE: COULEUR_ACTIVITE,
    creneau: creneau, decoupeCreneau: decoupeCreneau, indexJour: indexJour, jour: jour, service: service,
    ajouterJours: ajouterJours, lundiDe: lundiDe, dateDuJour: dateDuJour, dateDuCreneau: dateDuCreneau,
    numeroSemaine: numeroSemaine, idSemaine: idSemaine, aujourdhui: aujourdhui,
    nouvelId: nouvelId, semaineVide: semaineVide, semaineSuivante: semaineSuivante, residentVide: residentVide,
    nomAffiche: nomAffiche, copie: copie, migrer: migrer,
    refs: refs, parc: parc, resident: resident, semaine: semaine, parNature: parNature, groupesRegimes: groupesRegimes, textureDefaut: textureDefaut
  };
})(window.Recueil = window.Recueil || {});
