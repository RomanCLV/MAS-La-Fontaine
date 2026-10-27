/* Modèle de données : constantes, dates, création d'objets, migration.
   Pur : aucun accès à l'écran ni au stockage (testé par tests.html). */
(function (R) {
  'use strict';

  var VERSION = 1; // format de la version 1.0 (2026-10-23) ; les formats d'essai d'avant ne sont plus lus
  var APP = 'recueil-alimentation-mas-la-fontaine';
  var VERSION_APP = '1.2'; // version de l'application affichée à l'utilisateur (accueil, menu Aide, Options, guide) ; distincte de VERSION (format des données)

  var JOURS = [
    { id: 'lun', nom: 'Lundi', court: 'lun.' },
    { id: 'mar', nom: 'Mardi', court: 'mar.' },
    { id: 'mer', nom: 'Mercredi', court: 'mer.' },
    { id: 'jeu', nom: 'Jeudi', court: 'jeu.' },
    { id: 'ven', nom: 'Vendredi', court: 'ven.' },
    { id: 'sam', nom: 'Samedi', court: 'sam.' },
    { id: 'dim', nom: 'Dimanche', court: 'dim.' }
  ];
  var IDS_JOURS = JOURS.map(function (j) { return j.id; });
  // Services de base : toujours là, tous les jours, dans cet ordre ; ni modifiables, ni archivables, ni supprimables.
  // Les services additionnels (page Services) se placent avant, entre ou après eux (referentiels.services).
  // Identifiant sans « _ » (séparateur des créneaux). presenceSeule : on compte les présents, sans plat en plus.
  // Service additionnel permanent : chaque semaine, ses jours cochés ; ponctuel : seulement dans les semaines où on
  // l'ajoute (semaine.servicesSemaine, comme une activité ; ses jours cochés sont alors proposés).
  var SERVICES_BASE = [
    { id: 'petitdej', nom: 'Petit déjeuner', court: 'p.-déj.', presenceSeule: true },
    { id: 'midi', nom: 'Midi', court: 'midi', presenceSeule: false },
    { id: 'soir', nom: 'Soir', court: 'soir', presenceSeule: false }
  ];
  // Services en vigueur = ceux des dernières données appliquées (appliquerServices), dans l'ordre.
  // Tableaux modifiés sur place : le reste du code garde les mêmes références (M.SERVICES…).
  var TOUS_SERVICES = [];  // archivés compris (libellés des anciennes saisies)
  var SERVICES = [];       // sans les archivés
  var IDS_SERVICES = [];
  function remplacer(tab, valeurs) { tab.length = 0; valeurs.forEach(function (v) { tab.push(v); }); }
  function serviceBase(b) {
    return { id: b.id, nom: b.nom, court: b.court, base: true, presenceSeule: b.presenceSeule, permanent: true,
      jours: IDS_JOURS.slice(), archive: false };
  }

  // Identifiants du référentiel utilisés par les calculs.
  var TEXTURE_DEFAUT = 'normal';
  var COULEUR_NORMAL = '#cde4fa';       // bleu léger de la texture par défaut (avant 1.2 : blanc, remplacé à la normalisation)
  var REGIME_SANS_PORC = 'sans_porc';   // salariés « sans porc »
  var REGIME_NETTOYAGE = 'sans_viande'; // ligne « Nettoyage sans viande » (halal : œufs/poisson)
  var COULEUR_ACTIVITE = '#2d6cb5';     // couleur par défaut d'une activité (bleu de l'interface)
  // Couleurs proposées aux nouvelles activités, dans l'ordre (pas de rouge : réservé aux absences de la grille).
  var PALETTE_ACTIVITES = [COULEUR_ACTIVITE, '#e07b00', '#2e8b3e', '#7b4bb7', '#d63c8c', '#138d90', '#8a5a2b', '#b8860b'];
  // Services concernés par défaut par une texture / un régime / une option.
  var SERVICES_REGIME_DEFAUT = ['midi', 'soir'];
  var SERVICES_POTS_GOURMANDS = ['petitdej']; // alternative du petit déjeuner (retour utilisateur 2026-10-20)

  // Textures / régimes / options par défaut d'une base vide (remise à zéro) ; modifiables ensuite dans la page Régimes.
  // Ordre = ordre des colonnes. abrege : libellé court de colonne. affecte (options) : 'plat' (+1 plat chaud) ou '' (sur l'assiette).
  // toujoursVisible : colonne toujours présente dans la grille Semaine ; sinon seulement si un résident du parc l'a.
  var MS = SERVICES_REGIME_DEFAUT;
  var REGIMES_DEFAUT = [
    { id: 'normal', nom: 'Normal', nature: 'texture', couleur: COULEUR_NORMAL, toujoursVisible: true, services: MS },
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
    { id: 'double_legumes_vert', nom: 'Double légumes vert', abrege: 'Dbl légumes vert', nature: 'option', affecte: '', couleur: '#a9d18e', toujoursVisible: true, services: MS },
    { id: 'demi_portion', nom: 'Demi-portion', nature: 'option', affecte: '', couleur: '#c6d8ee', toujoursVisible: false, services: MS },
    { id: 'enrichi', nom: 'Enrichi', nature: 'option', affecte: '', couleur: '#f2d27a', toujoursVisible: true, services: MS },
    { id: 'pane_pate_riz_frite', nom: 'Poisson/viande panée + pâtes/riz/frites', abrege: 'Pané + féculent', nature: 'option', affecte: '', couleur: '#d9c29c', toujoursVisible: true, services: MS },
    { id: 'pots_gourmands', nom: 'Pots gourmands', nature: 'option', affecte: '', couleur: '#e8e8e8', toujoursVisible: true, services: SERVICES_POTS_GOURMANDS }
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
  // Service par identifiant (archivés compris) ; inconnu : midi.
  function service(serviceId) {
    return TOUS_SERVICES.filter(function (s) { return s.id === serviceId; })[0] || serviceBase(SERVICES_BASE[1]);
  }
  // Jours du service s dans la semaine : réglage de cette semaine (semaine.servicesSemaine) s'il existe,
  // sinon ses jours cochés s'il est permanent, sinon aucun (ponctuel pas ajouté). Archivé : aucun.
  function joursHabituels(s) { return s.permanent ? s.jours.slice() : []; }
  function joursDuService(semaine, s) {
    if (s.archive) return [];
    if (s.base) return IDS_JOURS.slice();
    var reglage = ((semaine && semaine.servicesSemaine) || {})[s.id];
    return Array.isArray(reglage) ? reglage.slice() : joursHabituels(s);
  }
  // Le service est-il servi ce jour-là, cette semaine ?
  function estActif(semaine, jourId, serviceId) {
    var s = SERVICES.filter(function (x) { return x.id === serviceId; })[0];
    return !!s && joursDuService(semaine, s).indexOf(jourId) >= 0;
  }
  function servicesDuJour(semaine, jourId) {
    return SERVICES.filter(function (s) { return joursDuService(semaine, s).indexOf(jourId) >= 0; });
  }
  // Services servis au moins un jour de la semaine (filtres de la grille et de l'impression).
  function servicesDeLaSemaine(semaine) {
    return SERVICES.filter(function (s) { return joursDuService(semaine, s).length; });
  }
  // Créneaux de la semaine : jour × service servi ce jour-là, dans l'ordre de la semaine puis de la journée.
  function creneaux(semaine) {
    var liste = [];
    JOURS.forEach(function (j) {
      SERVICES.forEach(function (s) { if (joursDuService(semaine, s).indexOf(j.id) >= 0) liste.push(j.id + '_' + s.id); });
    });
    return liste;
  }
  // Rend en vigueur les services de donnees (normalisées par migrer) ; null : services de base seulement.
  // Appelé par migrer, et par l'application à chaque rendu et modification (App.rendre, App.modifier).
  function appliquerServices(donnees) {
    var tous = donnees ? donnees.referentiels.services : SERVICES_BASE.map(serviceBase);
    remplacer(TOUS_SERVICES, tous);
    remplacer(SERVICES, tous.filter(function (s) { return !s.archive; }));
    remplacer(IDS_SERVICES, SERVICES.map(function (s) { return s.id; }));
  }
  appliquerServices(null);

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
      salaries: {}, sodexo: {}, direction: {}, nettoyage: {}, nettoyageSansViande: {}, temoins: {}, alertesTraitees: [],
      servicesSemaine: {},  // { <service additionnel>: [jours] } : réglage de cette semaine seulement
      menuSansPorc: {}      // { <créneau>: true } : repas dont le menu ne contient pas de porc (absent = avec porc)
    };
  }

  // Le menu de ce créneau contient-il du porc ? Oui par défaut ; non si la case « Menu avec porc » est décochée.
  // Un service « présence seule » (petit déjeuner…) n'a pas de case : toujours oui (rien ne change pour lui).
  function menuAvecPorc(semaine, c) {
    return !((semaine && semaine.menuSansPorc) || {})[c] || !!service(decoupeCreneau(c).service).presenceSeule;
  }

  // Nouvelle semaine : reprend les effectifs fixes (salariés, Sodexo, direction, nettoyage, plats témoins),
  // les repas sans porc (ligne « Menu avec porc ») et les absences cochées dans la grille (cases à 0), pas les activités (les presets servent à les recréer)
  // ni les services ponctuels ou jours réglés pour la semaine : seulement les créneaux servis la nouvelle semaine.
  // Les « présent » saisis (1) ne sont pas repris : ils contredisaient une absence de fiche de cette semaine-là
  // et masqueraient une nouvelle absence de fiche.
  // debut (facultatif) : lundi de la semaine à créer, sinon la semaine juste après (voir debutSemaineACreer).
  function semaineSuivante(semaine, debut) {
    var s = semaineVide(debut || ajouterJours(semaine.debut, 7));
    var servis = creneaux(s);
    function garder(table, filtre) {
      var n = {};
      Object.keys(table || {}).forEach(function (c) { if (servis.indexOf(c) >= 0 && (!filtre || filtre(table[c]))) n[c] = copie(table[c]); });
      return n;
    }
    Object.keys(semaine.presences || {}).forEach(function (rid) {
      var zeros = garder(semaine.presences[rid], function (v) { return v === 0; });
      if (Object.keys(zeros).length) s.presences[rid] = zeros;
    });
    Object.keys(semaine.salaries || {}).forEach(function (pid) { s.salaries[pid] = garder(semaine.salaries[pid]); });
    ['sodexo', 'direction', 'nettoyage', 'nettoyageSansViande', 'temoins', 'menuSansPorc'].forEach(function (k) { s[k] = garder(semaine[k]); });
    return s;
  }

  // Lundi de la semaine créée par « Créer la semaine suivante » : la semaine après la dernière existante,
  // mais au moins la semaine prochaine par rapport à aujourd'hui (les semaines manquées sont sautées).
  function debutSemaineACreer(derniere, aujourdhuiIso) {
    var apresDerniere = ajouterJours(derniere.debut, 7);
    var prochaine = ajouterJours(lundiDe(aujourdhuiIso), 7);
    return apresDerniere > prochaine ? apresDerniere : prochaine;
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

  // ---- Migration d'un fichier importé ou du cache : conversions de version, puis normalisation ----
  // Règle (docs/code/data.md) : VERSION augmente seulement si un vieux fichier, lu tel quel, changerait de sens.
  function tableau(v) { return Array.isArray(v) ? v : []; }
  function objet(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function nombre(v) { v = +v; return isFinite(v) && v > 0 ? Math.floor(v) : 0; }

  // CONVERSIONS[n] fait passer les données de la version n à n + 1 (sur place). Un fichier V1 les enchaînera toutes.
  // Chacune est écrite pour le format de sa version et ne change plus jamais ; la normalisation passe après.
  // Aucune pour l'instant : la version 1 est le format de l'application 1.0.
  var CONVERSIONS = {};

  // Services d'un fichier : services de base imposés (manquants remis à leur place, ordre petit déjeuner, midi, soir),
  // services additionnels gardés dans l'ordre du fichier (au moins un jour ; aucun jour coché : tous ; permanent par défaut).
  function normaliserServices(liste) {
    var sortie = [], vus = {};
    var bases = {};
    SERVICES_BASE.forEach(function (b) { bases[b.id] = b; });
    tableau(liste).forEach(function (s) {
      var id = s && s.id ? String(s.id) : '';
      if (!id || id.indexOf('_') >= 0 || vus[id]) return;
      vus[id] = true;
      if (bases[id]) { sortie.push(serviceBase(bases[id])); return; }
      var jours = IDS_JOURS.filter(function (j) { return tableau(s.jours).indexOf(j) >= 0; });
      sortie.push({ id: id, nom: s.nom || id, court: s.court || s.nom || id, base: false, presenceSeule: !!s.presenceSeule,
        permanent: s.permanent !== false, jours: jours.length ? jours : IDS_JOURS.slice(), archive: !!s.archive });
    });
    SERVICES_BASE.forEach(function (b, i) {
      if (vus[b.id]) return;
      var avant = -1;
      if (i) sortie.forEach(function (s, k) { if (s.id === SERVICES_BASE[i - 1].id) avant = k; });
      sortie.splice(avant + 1, 0, serviceBase(b));
    });
    var places = [];
    sortie.forEach(function (s, k) { if (s.base) places.push(k); });
    places.forEach(function (k, i) { sortie[k] = serviceBase(SERVICES_BASE[i]); });
    return sortie;
  }

  function migrer(entree) {
    if (!entree || typeof entree !== 'object') throw new Error('Ce fichier ne contient pas de données lisibles.');
    if (entree.app !== APP) throw new Error('Ce fichier n\'est pas un fichier « Recueil Alimentation ».');
    if (+entree.version > VERSION) {
      throw new Error('Ce fichier vient d\'une version plus récente de l\'application (version ' + entree.version + ').');
    }
    var d = copie(entree);
    for (var v = Math.max(1, Math.floor(+entree.version) || 1); v < VERSION; v++) {
      if (!CONVERSIONS[v]) throw new Error('Conversion de la version ' + v + ' à ' + (v + 1) + ' manquante.');
      CONVERSIONS[v](d);
    }
    // Normalisation (à chaque chargement, rejouable) : valeurs par défaut, types, champs inconnus retirés.
    // Tout champ des résidents, parcs, régimes… doit figurer ici, sinon il est effacé au rechargement.
    d.version = VERSION;
    d.etablissement = d.etablissement || 'MAS La Fontaine';
    d.referentiels = objet(d.referentiels);
    d.referentiels.parcs = tableau(d.referentiels.parcs).map(function (p, i) {
      return { id: String(p.id), nom: p.nom || p.id, couleur: p.couleur || '#dddddd', ordre: p.ordre || i + 1 };
    });
    d.referentiels.parcs.sort(function (a, b) { return a.ordre - b.ordre; });
    d.referentiels.services = normaliserServices(d.referentiels.services);
    // Identifiants des services de ce fichier (archivés compris), dans l'ordre : pas ceux en vigueur avant lui.
    var ids = d.referentiels.services.map(function (s) { return s.id; });
    var additionnels = d.referentiels.services.filter(function (s) { return !s.base; }).map(function (s) { return s.id; });
    var repas = d.referentiels.services.filter(function (s) { return !s.presenceSeule; }).map(function (s) { return s.id; });
    function servicesConnus(liste) { return ids.filter(function (x) { return tableau(liste).indexOf(x) >= 0; }); }
    d.referentiels.regimes = tableau(d.referentiels.regimes).map(function (g) {
      var n = { id: String(g.id), nom: g.nom || g.id, abrege: g.abrege || '', couleur: g.couleur || '#dddddd' };
      n.nature = (g.nature === 'texture' || g.nature === 'option') ? g.nature : 'regime';
      // Texture Normal encore blanche (ancien défaut) : bleu léger, mise en avant comme les autres textures.
      if (n.id === TEXTURE_DEFAUT && /^#f{3}(f{3})?$/i.test(n.couleur)) n.couleur = COULEUR_NORMAL;
      // Options : +1 plat chaud ou rien (sur l'assiette).
      if (n.nature === 'option') n.affecte = g.affecte === 'plat' ? 'plat' : '';
      n.toujoursVisible = g.toujoursVisible !== false; // absent : toujours affiché
      n.services = Array.isArray(g.services) ? servicesConnus(g.services) : SERVICES_REGIME_DEFAUT.slice(); // absent : midi et soir
      return n;
    });
    d.residents = tableau(d.residents).map(function (r) {
      return {
        id: String(r.id), nom: r.nom || '', prenom: r.prenom || '', parcId: r.parcId || '',
        textureId: r.textureId || TEXTURE_DEFAUT,
        regimeIds: tableau(r.regimeIds).slice(), optionIds: tableau(r.optionIds).slice(),
        consigne: r.consigne || '', archive: !!r.archive,
        absences: tableau(r.absences).filter(function (a) { return a && a.debut && a.fin; }).map(function (a) {
          var sv = servicesConnus(a.services);
          return { debut: a.debut, fin: a.fin, services: sv.length ? sv : ids.slice() };
        })
      };
    });
    d.presetsActivites = tableau(d.presetsActivites).map(function (p) {
      return { id: String(p.id), nom: p.nom || '', jours: tableau(p.jours), services: servicesConnus(p.services), participantIds: tableau(p.participantIds),
        couleur: p.couleur || COULEUR_ACTIVITE };
    });
    d.semaines = tableau(d.semaines).map(function (s) {
      var n = {
        id: s.id || idSemaine(s.debut), debut: lundiDe(s.debut),
        presences: objet(s.presences), activites: tableau(s.activites).map(function (a) {
          return { id: a.id || nouvelId('a'), nom: a.nom || 'Activité', jour: a.jour || 'lun', service: ids.indexOf(a.service) >= 0 ? a.service : 'midi',
            participantIds: tableau(a.participantIds), presetId: a.presetId || null, couleur: a.couleur || COULEUR_ACTIVITE };
        }),
        salaries: objet(s.salaries), sodexo: {}, direction: {}, nettoyage: {}, nettoyageSansViande: {}, temoins: {},
        alertesTraitees: tableau(s.alertesTraitees), servicesSemaine: {}, menuSansPorc: {}
      };
      // Repas sans porc : seulement les créneaux d'un service « repas » du fichier (champ absent : tout avec porc).
      Object.keys(objet(s.menuSansPorc)).forEach(function (c) {
        var sc = decoupeCreneau(c);
        if (s.menuSansPorc[c] && IDS_JOURS.indexOf(sc.jour) >= 0 && repas.indexOf(sc.service) >= 0) n.menuSansPorc[c] = true;
      });
      // Jours de cette semaine d'un service additionnel (liste vide gardée : service retiré cette semaine).
      Object.keys(objet(s.servicesSemaine)).forEach(function (id) {
        if (additionnels.indexOf(id) < 0 || !Array.isArray(s.servicesSemaine[id])) return;
        n.servicesSemaine[id] = IDS_JOURS.filter(function (j) { return s.servicesSemaine[id].indexOf(j) >= 0; });
      });
      // Sodexo : pas de saisie « sans porc » (sansPorc toujours 0).
      Object.keys(objet(s.sodexo)).forEach(function (c) {
        n.sodexo[c] = { standard: nombre(objet(s.sodexo[c]).standard), sansPorc: 0 };
      });
      ['direction', 'nettoyage', 'nettoyageSansViande', 'temoins'].forEach(function (k) {
        Object.keys(objet(s[k])).forEach(function (c) { n[k][c] = nombre(s[k][c]); });
      });
      return n;
    });
    d.semaines.sort(function (a, b) { return a.debut < b.debut ? -1 : 1; });
    if (!d.semaines.length) d.semaines.push(semaineVide(aujourdhui()));
    appliquerServices(d);
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

  // Ce qui utilise le service serviceId (page Services : suppression refusée tant que l'un d'eux n'est pas à 0).
  // semaines : semaines avec une saisie sur ce service (présences, salariés, Sodexo, direction, nettoyage, témoins)
  // ou des jours réglés pour la semaine (service ponctuel ajouté, ou jours d'un permanent changés).
  function utilisationsService(donnees, serviceId) {
    function surService(table) {
      return Object.keys(table || {}).some(function (c) { return decoupeCreneau(c).service === serviceId; });
    }
    var u = { semaines: 0, activites: 0, presets: 0, absences: 0 };
    donnees.semaines.forEach(function (s) {
      var saisie = Array.isArray(s.servicesSemaine[serviceId]) || ['sodexo', 'direction', 'nettoyage', 'nettoyageSansViande', 'temoins'].some(function (k) { return surService(s[k]); }) ||
        Object.keys(s.presences).some(function (rid) { return surService(s.presences[rid]); }) ||
        Object.keys(s.salaries).some(function (pid) { return surService(s.salaries[pid]); });
      if (saisie) u.semaines++;
      u.activites += s.activites.filter(function (a) { return a.service === serviceId; }).length;
    });
    u.presets = donnees.presetsActivites.filter(function (p) { return p.services.indexOf(serviceId) >= 0; }).length;
    donnees.residents.forEach(function (r) {
      u.absences += r.absences.filter(function (a) { return a.services.indexOf(serviceId) >= 0; }).length;
    });
    return u;
  }

  function textureDefaut(donnees) {
    var t = parNature(donnees, 'texture');
    var n = t.filter(function (g) { return g.id === TEXTURE_DEFAUT; })[0];
    return n ? n.id : (t[0] ? t[0].id : TEXTURE_DEFAUT);
  }

  R.Modele = {
    VERSION: VERSION, VERSION_APP: VERSION_APP, APP: APP, JOURS: JOURS, IDS_JOURS: IDS_JOURS, SERVICES_BASE: SERVICES_BASE, TOUS_SERVICES: TOUS_SERVICES,
    SERVICES: SERVICES, IDS_SERVICES: IDS_SERVICES, creneaux: creneaux,
    appliquerServices: appliquerServices, estActif: estActif, servicesDuJour: servicesDuJour, servicesDeLaSemaine: servicesDeLaSemaine,
    joursDuService: joursDuService, joursHabituels: joursHabituels,
    TEXTURE_DEFAUT: TEXTURE_DEFAUT, REGIME_SANS_PORC: REGIME_SANS_PORC, REGIME_NETTOYAGE: REGIME_NETTOYAGE, COULEUR_ACTIVITE: COULEUR_ACTIVITE,
    PALETTE_ACTIVITES: PALETTE_ACTIVITES, couleurActiviteLibre: couleurActiviteLibre,
    SERVICES_REGIME_DEFAUT: SERVICES_REGIME_DEFAUT, REGIMES_DEFAUT: REGIMES_DEFAUT,
    creneau: creneau, decoupeCreneau: decoupeCreneau, indexJour: indexJour, jour: jour, service: service,
    ajouterJours: ajouterJours, lundiDe: lundiDe, dateDuJour: dateDuJour, dateDuCreneau: dateDuCreneau,
    numeroSemaine: numeroSemaine, idSemaine: idSemaine, aujourdhui: aujourdhui,
    nouvelId: nouvelId, semaineVide: semaineVide, menuAvecPorc: menuAvecPorc, semaineSuivante: semaineSuivante, debutSemaineACreer: debutSemaineACreer, residentVide: residentVide,
    nomAffiche: nomAffiche, copie: copie, migrer: migrer, baseVide: baseVide,
    PARCS_MAS_LA_FONTAINE: PARCS_MAS_LA_FONTAINE, parcsPresetManquants: parcsPresetManquants, ajouterParcsPreset: ajouterParcsPreset,
    PRESETS_ACTIVITES_MAS_LA_FONTAINE: PRESETS_ACTIVITES_MAS_LA_FONTAINE, presetsActivitesManquants: presetsActivitesManquants,
    ajouterPresetsActivites: ajouterPresetsActivites, baseMasLaFontaine: baseMasLaFontaine,
    refs: refs, parc: parc, resident: resident, semaine: semaine, parNature: parNature, groupesRegimes: groupesRegimes, textureDefaut: textureDefaut, concerne: concerne,
    aRegime: aRegime, colonneAffichee: colonneAffichee, utilisationsService: utilisationsService
  };
})(window.Recueil = window.Recueil || {});
