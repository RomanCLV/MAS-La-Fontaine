/* Modèle de données : constantes, dates, création d'objets, migration.
   Pur : aucun accès à l'écran ni au stockage (testé par tests.html). */
(function (R) {
  'use strict';

  var VERSION = 4; // 2 : nettoyage séparé en standard (nettoyage) et sans viande (nettoyageSansViande)
                   // 3 : service petit déjeuner (absences « midi et soir » étendues au petit déjeuner)
                   // 4 : services concernés par chaque texture / régime / option (regimes[].services)
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
  // Identifiant sans « _ » (séparateur des créneaux). presenceSeule : on compte les présents, sans textures ni régimes.
  var SERVICES = [
    { id: 'petitdej', nom: 'Petit déjeuner', court: 'p.-déj.', presenceSeule: true },
    { id: 'midi', nom: 'Midi', court: 'midi' },
    { id: 'soir', nom: 'Soir', court: 'soir' }
  ];
  var IDS_SERVICES = SERVICES.map(function (s) { return s.id; });
  var CRENEAUX = [];
  JOURS.forEach(function (j) {
    SERVICES.forEach(function (s) { CRENEAUX.push(j.id + '_' + s.id); });
  });

  // Identifiants du référentiel utilisés par les calculs.
  var TEXTURE_DEFAUT = 'normal';
  var REGIME_SANS_PORC = 'sans_porc';   // salariés « sans porc »
  var REGIME_NETTOYAGE = 'sans_viande'; // ligne « Nettoyage sans viande » (halal : œufs/poisson)
  var COULEUR_ACTIVITE = '#2d6cb5';     // couleur par défaut d'une activité (bleu de l'interface)
  // Couleurs proposées aux nouvelles activités, dans l'ordre (pas de rouge : réservé aux absences de la grille).
  var PALETTE_ACTIVITES = [COULEUR_ACTIVITE, '#e07b00', '#2e8b3e', '#7b4bb7', '#d63c8c', '#138d90', '#8a5a2b', '#b8860b'];
  // Services concernés par défaut par une texture / un régime / une option (avant la version 4 : midi et soir).
  var SERVICES_REGIME_DEFAUT = ['midi', 'soir'];
  var SERVICES_POTS_GOURMANDS = ['petitdej']; // alternative du petit déjeuner (retour utilisateur 2026-10-20)

  // Textures / régimes / options par défaut d'une base vide (remise à zéro) ; modifiables ensuite dans la page Régimes.
  // Ordre = ordre des colonnes. abrege : libellé court de colonne. affecte (options) : plat, legumes ou information.
  // toujoursVisible : colonne toujours présente dans la grille Semaine ; sinon seulement si un résident du parc l'a.
  var MS = SERVICES_REGIME_DEFAUT;
  var REGIMES_DEFAUT = [
    { id: 'normal', nom: 'Normal', nature: 'texture', couleur: '#ffffff', toujoursVisible: true, services: MS },
    { id: 'hache', nom: 'Haché', nature: 'texture', couleur: '#f6c9a8', toujoursVisible: true, services: MS },
    { id: 'tendre', nom: 'Tendre', nature: 'texture', couleur: '#f0b48a', toujoursVisible: false, services: MS },
    { id: 'mouline', nom: 'Mouliné', nature: 'texture', couleur: '#ebaa95', toujoursVisible: false, services: MS },
    { id: 'mixe', nom: 'Mixé', nature: 'texture', couleur: '#e6a0a0', toujoursVisible: true, services: MS },
    { id: 'sans_porc', nom: 'Sans porc', nature: 'regime', couleur: '#f4b6c8', toujoursVisible: true, services: MS },
    { id: 'sans_viande', nom: 'Sans viande', nature: 'regime', couleur: '#ffe08a', toujoursVisible: true, services: MS },
    { id: 'vegetarien', nom: 'Végétarien', nature: 'regime', couleur: '#b7dfa0', toujoursVisible: false, services: MS },
    { id: 'sans_produit_mer', nom: 'Sans produit de la mer', abrege: 'Sans prod. mer', nature: 'regime', couleur: '#c9b7e8', toujoursVisible: true, services: MS },
    { id: 'sans_residus', nom: 'Sans résidus', nature: 'regime', couleur: '#c9d9a6', toujoursVisible: true, services: MS },
    { id: 'hypo', nom: 'Hypocalorique', abrege: 'Plateau hypo', nature: 'regime', couleur: '#b9e3d8', toujoursVisible: true, services: MS },
    { id: 'diabetique', nom: 'Diabétique', nature: 'regime', couleur: '#9dc3e6', toujoursVisible: true, services: MS },
    { id: 'sans_sel', nom: 'Sans sel', nature: 'regime', couleur: '#dddddd', toujoursVisible: false, services: MS },
    { id: 'pauvre_potassium_proteines', nom: 'Pauvre en potassium / protéines', abrege: 'Pauvre K / prot.', nature: 'regime', couleur: '#e3c6de', toujoursVisible: false, services: MS },
    { id: 'sans_gluten', nom: 'Sans gluten', nature: 'regime', couleur: '#f2cfa0', toujoursVisible: false, services: MS },
    { id: 'sans_lactose', nom: 'Sans lactose', nature: 'regime', couleur: '#d6e6f5', toujoursVisible: false, services: MS },
    { id: 'allergie_lait', nom: 'Allergie lait', abrege: 'All. lait', nature: 'regime', couleur: '#aecbe8', toujoursVisible: false, services: MS },
    { id: 'allergie_oeufs', nom: 'Allergie œufs', abrege: 'All. œufs', nature: 'regime', couleur: '#fff2b3', toujoursVisible: false, services: MS },
    { id: 'allergie_arachides', nom: 'Allergie arachides', abrege: 'All. arachides', nature: 'regime', couleur: '#e0b98a', toujoursVisible: false, services: MS },
    { id: 'allergie_fruits_coque', nom: 'Allergie fruits à coque', abrege: 'All. fruits à coque', nature: 'regime', couleur: '#c8a27a', toujoursVisible: false, services: MS },
    { id: 'double_plat', nom: 'Double plat', nature: 'option', affecte: 'plat', couleur: '#f4a460', toujoursVisible: true, services: MS },
    { id: 'double_legumes_vert', nom: 'Double légumes vert', abrege: 'Dbl légumes vert', nature: 'option', affecte: 'legumes', couleur: '#a9d18e', toujoursVisible: true, services: MS },
    { id: 'demi_portion', nom: 'Demi-portion', nature: 'option', affecte: '', couleur: '#c6d8ee', toujoursVisible: false, services: MS },
    { id: 'enrichi', nom: 'Enrichi', nature: 'option', affecte: '', couleur: '#f2d27a', toujoursVisible: true, services: MS },
    { id: 'pane_pate_riz_frite', nom: 'Poisson/viande panée + pâtes/riz/frites', abrege: 'Pané + féculent', nature: 'option', affecte: '', couleur: '#d9c29c', toujoursVisible: true, services: MS },
    { id: 'pots_gourmands', nom: 'Pots gourmands', nature: 'option', affecte: 'information', couleur: '#e8e8e8', toujoursVisible: true, services: SERVICES_POTS_GOURMANDS }
  ];

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
    return SERVICES.filter(function (s) { return s.id === serviceId; })[0] || SERVICES[1];
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

  // Nouvelle semaine : reprend les effectifs fixes (salariés, Sodexo, direction, nettoyage, plats témoins)
  // et les absences cochées dans la grille (cases à 0), pas les activités (les presets servent à les recréer).
  // Les « présent » saisis (1) ne sont pas repris : ils contredisaient une absence de fiche de cette semaine-là
  // et masqueraient une nouvelle absence de fiche.
  function semaineSuivante(semaine) {
    var s = semaineVide(ajouterJours(semaine.debut, 7));
    Object.keys(semaine.presences || {}).forEach(function (rid) {
      var saisies = semaine.presences[rid] || {}, zeros = {};
      Object.keys(saisies).forEach(function (c) { if (saisies[c] === 0) zeros[c] = 0; });
      if (Object.keys(zeros).length) s.presences[rid] = zeros;
    });
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
    var sansPetitDej = (+entree.version || 1) < 3;
    var sansServicesRegimes = (+entree.version || 1) < 4;
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
      n.toujoursVisible = g.toujoursVisible !== false; // absent (fichiers d'avant) : toujours affiché
      // Avant la version 4 : tout concernait midi et soir (petit déjeuner sans régimes), sauf les pots gourmands.
      n.services = sansServicesRegimes
        ? (n.id === 'pots_gourmands' ? SERVICES_POTS_GOURMANDS : SERVICES_REGIME_DEFAUT).slice()
        : IDS_SERVICES.filter(function (x) { return tableau(g.services).indexOf(x) >= 0; });
      return n;
    });
    d.residents = tableau(d.residents).map(function (r) {
      return {
        id: String(r.id), nom: r.nom || '', prenom: r.prenom || '', parcId: r.parcId || '',
        textureId: r.textureId || TEXTURE_DEFAUT,
        regimeIds: tableau(r.regimeIds).slice(), optionIds: tableau(r.optionIds).slice(),
        consigne: r.consigne || '', archive: !!r.archive,
        absences: tableau(r.absences).filter(function (a) { return a && a.debut && a.fin; }).map(function (a) {
          var sv = IDS_SERVICES.filter(function (x) { return tableau(a.services).indexOf(x) >= 0; });
          // Avant la version 3 : une absence « midi et soir » couvre aussi le petit déjeuner.
          if (sansPetitDej && sv.indexOf('midi') >= 0 && sv.indexOf('soir') >= 0 && sv.indexOf('petitdej') < 0) sv.unshift('petitdej');
          return { debut: a.debut, fin: a.fin, services: sv.length ? sv : IDS_SERVICES.slice() };
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
      // Sodexo : ancien format possible = un nombre par créneau. Plus de saisie « sans porc » : un ancien sans porc compte en standard.
      Object.keys(objet(s.sodexo)).forEach(function (c) {
        var v = s.sodexo[c];
        n.sodexo[c] = typeof v === 'object' && v ? { standard: nombre(v.standard) + nombre(v.sansPorc), sansPorc: 0 } : { standard: nombre(v), sansPorc: 0 };
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

  // Base vide (accueil ou « Repartir de zéro ») : textures / régimes / options par défaut ;
  // aucun parc, résident ni preset ; une semaine (la semaine en cours).
  function baseVide() {
    return migrer({ app: APP, version: VERSION, referentiels: { parcs: [], regimes: REGIMES_DEFAUT },
      residents: [], presetsActivites: [], semaines: [] });
  }

  // Preset « MAS La Fontaine » (client principal) : ses parcs, dans l'ordre. Appliqué depuis l'accueil ou la page Parcs.
  var PARCS_MAS_LA_FONTAINE = [
    { id: 'amboise', nom: 'AMBOISE', couleur: '#ffff00' },
    { id: 'bonaguil', nom: 'BONAGUIL', couleur: '#fcd5b4' },
    { id: 'collioure', nom: 'COLLIOURE', couleur: '#b1a0c7' },
    { id: 'lude', nom: 'LUDE', couleur: '#538dd5' },
    { id: 'mirande', nom: 'MIRANDE', couleur: '#92d050' },
    { id: 'sully', nom: 'SULLY', couleur: '#7dffb8' },
    { id: 'alhambra', nom: 'ALHAMBRA', couleur: '#bfbfbf' }
  ];
  function memeNom(a, b) { return a.trim().toUpperCase() === b.trim().toUpperCase(); }
  // Parcs du preset absents de donnees (comparaison par nom, sans tenir compte des majuscules).
  function parcsPresetManquants(donnees) {
    return PARCS_MAS_LA_FONTAINE.filter(function (p) {
      return !donnees.referentiels.parcs.some(function (x) { return memeNom(x.nom, p.nom); });
    });
  }
  // Ajoute à la fin les parcs manquants du preset (parcs existants inchangés) ; renvoie les parcs ajoutés.
  function ajouterParcsPreset(donnees) {
    var parcs = donnees.referentiels.parcs;
    return parcsPresetManquants(donnees).map(function (p) {
      var id = p.id, n = 2;
      while (parcs.some(function (x) { return x.id === id; })) id = p.id + '_' + n++;
      var nouveau = { id: id, nom: p.nom, couleur: p.couleur, ordre: parcs.length + 1 };
      parcs.push(nouveau);
      return nouveau;
    });
  }
  // Presets d'activité du preset MAS La Fontaine (sans participants : ils dépendent des résidents).
  var PRESETS_ACTIVITES_MAS_LA_FONTAINE = [
    { nom: 'Sport', jours: ['jeu'], services: ['midi'], couleur: COULEUR_ACTIVITE }
  ];
  // Presets d'activité du preset absents de donnees (comparaison par nom).
  function presetsActivitesManquants(donnees) {
    return PRESETS_ACTIVITES_MAS_LA_FONTAINE.filter(function (p) {
      return !donnees.presetsActivites.some(function (x) { return memeNom(x.nom, p.nom); });
    });
  }
  // Ajoute les presets d'activité manquants (existants inchangés) ; renvoie les presets ajoutés.
  function ajouterPresetsActivites(donnees) {
    return presetsActivitesManquants(donnees).map(function (p) {
      var nouveau = { id: nouvelId('preset'), nom: p.nom, jours: p.jours.slice(), services: p.services.slice(), participantIds: [], couleur: p.couleur };
      donnees.presetsActivites.push(nouveau);
      return nouveau;
    });
  }
  // Base vide + parcs et presets d'activité MAS La Fontaine.
  function baseMasLaFontaine() {
    var d = baseVide();
    ajouterParcsPreset(d);
    ajouterPresetsActivites(d);
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
  // La texture / le régime / l'option g compte-t-il pour ce service ? (identifiant inconnu : oui)
  function concerne(g, serviceId) {
    return !g || (g.services || SERVICES_REGIME_DEFAUT).indexOf(serviceId) >= 0;
  }
  // Le résident r a-t-il la texture / le régime / l'option g ?
  function aRegime(r, g) {
    return r.textureId === g.id || r.regimeIds.indexOf(g.id) >= 0 || r.optionIds.indexOf(g.id) >= 0;
  }
  // Colonne de g dans une grille de résidents : toujours, ou seulement si l'un d'eux l'a.
  function colonneAffichee(g, residents) {
    return g.toujoursVisible !== false || residents.some(function (r) { return aRegime(r, g); });
  }
  // Couleur d'une activité de la semaine s : preferee si aucune autre activité ne l'a (idActivite exclue),
  // sinon la première couleur de la palette encore libre ; toutes prises : on reprend la palette en boucle.
  function couleurActiviteLibre(s, idActivite, preferee) {
    var prises = s.activites.filter(function (a) { return a.id !== idActivite; })
      .map(function (a) { return String(a.couleur || COULEUR_ACTIVITE).toLowerCase(); });
    if (preferee && prises.indexOf(String(preferee).toLowerCase()) < 0) return preferee;
    var libre = PALETTE_ACTIVITES.filter(function (c) { return prises.indexOf(c) < 0; })[0];
    return libre || PALETTE_ACTIVITES[prises.length % PALETTE_ACTIVITES.length];
  }

  function textureDefaut(donnees) {
    var t = parNature(donnees, 'texture');
    var n = t.filter(function (g) { return g.id === TEXTURE_DEFAUT; })[0];
    return n ? n.id : (t[0] ? t[0].id : TEXTURE_DEFAUT);
  }

  R.Modele = {
    VERSION: VERSION, APP: APP, JOURS: JOURS, SERVICES: SERVICES, IDS_SERVICES: IDS_SERVICES, CRENEAUX: CRENEAUX,
    TEXTURE_DEFAUT: TEXTURE_DEFAUT, REGIME_SANS_PORC: REGIME_SANS_PORC, REGIME_NETTOYAGE: REGIME_NETTOYAGE, COULEUR_ACTIVITE: COULEUR_ACTIVITE,
    PALETTE_ACTIVITES: PALETTE_ACTIVITES, couleurActiviteLibre: couleurActiviteLibre,
    SERVICES_REGIME_DEFAUT: SERVICES_REGIME_DEFAUT, REGIMES_DEFAUT: REGIMES_DEFAUT,
    creneau: creneau, decoupeCreneau: decoupeCreneau, indexJour: indexJour, jour: jour, service: service,
    ajouterJours: ajouterJours, lundiDe: lundiDe, dateDuJour: dateDuJour, dateDuCreneau: dateDuCreneau,
    numeroSemaine: numeroSemaine, idSemaine: idSemaine, aujourdhui: aujourdhui,
    nouvelId: nouvelId, semaineVide: semaineVide, semaineSuivante: semaineSuivante, residentVide: residentVide,
    nomAffiche: nomAffiche, copie: copie, migrer: migrer, baseVide: baseVide,
    PARCS_MAS_LA_FONTAINE: PARCS_MAS_LA_FONTAINE, parcsPresetManquants: parcsPresetManquants, ajouterParcsPreset: ajouterParcsPreset,
    PRESETS_ACTIVITES_MAS_LA_FONTAINE: PRESETS_ACTIVITES_MAS_LA_FONTAINE, presetsActivitesManquants: presetsActivitesManquants,
    ajouterPresetsActivites: ajouterPresetsActivites, baseMasLaFontaine: baseMasLaFontaine,
    refs: refs, parc: parc, resident: resident, semaine: semaine, parNature: parNature, groupesRegimes: groupesRegimes, textureDefaut: textureDefaut, concerne: concerne,
    aRegime: aRegime, colonneAffichee: colonneAffichee
  };
})(window.Recueil = window.Recueil || {});
