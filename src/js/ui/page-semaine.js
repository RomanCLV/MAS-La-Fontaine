/* Page Semaine (saisie client) : alertes, activités, grille des présences par parc. */
(function (R) {
  'use strict';
  var M = R.Modele, C = R.Calc, h = R.h, O = R.Outils, App = R.App;

  // Créneaux affichés (services cochés dans le filtre, jours actifs de chaque service) ; les autres sont seulement masqués.
  var ID_HORS_PARC = '@horsparc';

  function creneauxVisibles(s) {
    var vis = App.servicesVisibles(), tous = M.creneaux(s);
    var liste = tous.filter(function (c) { return vis.indexOf(M.decoupeCreneau(c).service) >= 0; });
    return liste.length ? liste : tous;  // seuls des services absents de cette semaine sont affichés : tout montrer
  }

  // Services servis cette semaine (un service de certaines semaines n'apparaît que là où il est ajouté).
  function filtreServices(s) {
    var vis = App.servicesVisibles();
    var semaine = M.servicesDeLaSemaine(s);
    var affiches = semaine.filter(function (x) { return vis.indexOf(x.id) >= 0; });
    return h('div', { class: 'filtre-services' },
      h('span', { class: 'gras' }, 'Services affichés :'),
      semaine.map(function (x) {
        var on = vis.indexOf(x.id) >= 0, seul = on && affiches.length === 1;
        return h('label', { class: 'choix' + (on ? ' on' : ''), title: seul ? 'Au moins un service reste affiché' : null },
          h('input', { type: 'checkbox', checked: on, disabled: seul, onchange: function () {
            var m = App.ui.servicesMasques.filter(function (id) { return id !== x.id; });
            App.ui.servicesMasques = on ? m.concat([x.id]) : m;
            App.sauverUi();
            App.rendre();
          } }), x.nom);
      }),
      affiches.length < semaine.length ? h('span', { class: 'petit' }, 'Les services masqués gardent leurs saisies.') : null);
  }

  // Bandeau affiché seulement s'il y a des alertes (ou des alertes masquées à réafficher).
  function alertes(d, s) {
    var liste = C.alertesVisibles(d, s);
    var masquees = (s.alertesTraitees || []).length;
    if (!liste.length && !masquees) return null;
    function traiter(a, statut) {
      App.modifier(function () { s.alertesTraitees.push({ cle: a.cle, statut: statut }); });
    }
    return h('div', { class: 'bandeau bandeau-alertes' },
      h('span', { class: 'bandeau-titre' }, 'Alertes de présence · ' + liste.length),
      liste.map(function (a) {
        return h('span', { class: 'alerte' },
          h('span', null, h('b', null, a.titre), ' · ', a.detail),
          h('button', { class: 'btn btn-petit', onclick: function () { App.ouvrir('resident', a.residentId); } }, 'Fiche'),
          h('button', { class: 'btn btn-petit', onclick: function () { traiter(a, 'voulu'); } }, 'C’est voulu'),
          h('button', { class: 'btn btn-petit btn-discret', onclick: function () { traiter(a, 'ignore'); } }, 'Ignorer'));
      }),
      masquees ? h('button', { class: 'lien', onclick: function () {
        App.modifier(function () { s.alertesTraitees = []; });
      } }, 'Réafficher les alertes masquées (' + masquees + ')') : null);
  }

  function activites(s) {
    return h('div', { class: 'bandeau bandeau-activites' },
      h('span', { class: 'bandeau-titre' }, 'Activités de la semaine'),
      s.activites.length ? null : h('span', { class: 'petit' }, 'Aucune.'),
      s.activites.map(function (a) {
        return h('button', { class: 'puce-activite', style: 'border-color:' + a.couleur, onclick: function () { R.PageActivites.ouvrirActivite(a.id); } },
          h('b', null, a.nom), ' · ' + M.jour(a.jour).nom.toLowerCase() + ' ' + M.service(a.service).court + ' · ' + O.pluriel(a.participantIds.length, 'participant'));
      }),
      h('button', { class: 'btn', onclick: function () { R.PageActivites.nouvelle(); } }, '+ Ajouter une activité'));
  }

  // Services additionnels servis cette semaine (cliquer = régler leurs jours pour cette semaine seulement) ;
  // « + Ajouter un service à cette semaine » pour un service qui ne l'est pas (ponctuel, ou permanent retiré).
  // Bandeau absent tant qu'aucun service n'a été ajouté dans la page Services.
  function servicesAjoutes(s) {
    var additionnels = M.SERVICES.filter(function (x) { return !x.base; });
    if (!additionnels.length) return null;
    var servis = additionnels.filter(function (x) { return M.joursDuService(s, x).length; });
    var autres = additionnels.filter(function (x) { return !M.joursDuService(s, x).length; });
    return h('div', { class: 'bandeau bandeau-activites' },
      h('span', { class: 'bandeau-titre' }, 'Services ajoutés cette semaine'),
      servis.length ? null : h('span', { class: 'petit' }, 'Aucun.'),
      servis.map(function (x) {
        var special = x.permanent && Array.isArray(s.servicesSemaine[x.id]);
        return h('button', { class: 'puce-activite', title: 'Régler les jours de ' + x.nom + ' pour cette semaine', onclick: function () { reglerService(s, x); } },
          h('b', null, x.nom), ' · ' + O.libelleJours(M.joursDuService(s, x)) + (special ? ' (cette semaine)' : ''));
      }),
      autres.length ? h('button', { class: 'btn', onclick: function () { reglerService(s, null, autres); } }, '+ Ajouter un service à cette semaine') : null);
  }

  // Fenêtre : jours du service x pour la semaine s ; x null = choix parmi candidats (ajout).
  // Jours égaux aux jours habituels (permanent : jours cochés ; ponctuel : aucun) → réglage effacé.
  function reglerService(s, x, candidats) {
    var choisi = x || candidats[0];
    var jours = x ? M.joursDuService(s, x) : choisi.jours.slice();
    var zoneJours = h('div', { class: 'rangee' });
    var note = h('div', { class: 'petit' });
    function dessiner() {
      zoneJours.replaceChildren.apply(zoneJours, M.JOURS.map(function (j) {
        var on = jours.indexOf(j.id) >= 0;
        return h('label', { class: 'choix' + (on ? ' on' : '') }, h('input', { type: 'checkbox', checked: on, onchange: function () {
          jours = M.IDS_JOURS.filter(function (y) { return y === j.id ? !on : jours.indexOf(y) >= 0; });
          dessiner();
        } }), j.nom + ' ' + O.dateCourte(M.dateDuJour(s, j.id)).slice(0, 5));
      }));
      note.textContent = (choisi.permanent ? 'Toutes les semaines : ' + O.libelleJours(choisi.jours) + '. Ce réglage ne concerne que cette semaine.'
        : 'Service de certaines semaines : seulement celles où on l’ajoute.') + ' Les saisies des jours retirés sont gardées.';
    }
    dessiner();
    var contenu = h('div', { class: 'absence-saisie' },
      h('div', { class: 'gras grand' }, (x ? x.nom : 'Ajouter un service') + ' · ' + O.titreSemaine(s)),
      x ? null : h('div', { class: 'champ' }, h('label', { for: 'sv-choix' }, 'Service'),
        h('select', { id: 'sv-choix', onchange: function (e) {
          choisi = candidats.filter(function (c) { return c.id === e.target.value; })[0];
          jours = choisi.jours.slice();
          dessiner();
        } }, candidats.map(function (c) { return h('option', { value: c.id }, c.nom); }))),
      h('div', { class: 'gras' }, 'Jours servis cette semaine'),
      zoneJours, note);
    function enregistrer(liste) {
      App.modifier(function () {
        if (liste.join() === M.joursHabituels(choisi).join()) delete s.servicesSemaine[choisi.id];
        else s.servicesSemaine[choisi.id] = liste;
      });
    }
    App.fenetre(contenu, [
      { texte: 'Annuler', valeur: '' },
      x ? { texte: 'Retirer de cette semaine', valeur: 'retirer', classe: 'btn-danger' } : null,
      { texte: x ? 'Enregistrer' : '+ Ajouter à cette semaine', valeur: 'ok', classe: 'btn-principal' }
    ].filter(Boolean), function (v) {
      if (v === 'ok') enregistrer(jours);
      if (v === 'retirer') enregistrer([]);
    });
  }

  // Mots cherchés (sans accents ni majuscules).
  function motsCherches(texte) { return O.sansAccents(texte).split(/\s+/).filter(Boolean); }
  // Texture, régime ou option dont le nom ou l'abréviation contient l'un des mots.
  function groupeTrouve(g, mots) {
    var t = O.sansAccents(g.nom + ' ' + (g.abrege || ''));
    return mots.some(function (m) { return t.indexOf(m) >= 0; });
  }
  // Résidents actifs où chaque mot est trouvé dans le nom, une texture / un régime / une option du résident
  // (nom ou abréviation) ou l'observation. Tous parcs, dans l'ordre des parcs.
  function residentsTrouves(d, texte) {
    var mots = motsCherches(texte);
    var ordre = d.referentiels.parcs.map(function (p) { return p.id; }), refs = M.refs(d);
    return d.residents.filter(function (r) {
      if (r.archive) return false;
      var marques = [r.textureId].concat(r.regimeIds, r.optionIds).map(function (id) { return refs[id]; }).filter(Boolean);
      var t = O.sansAccents(M.nomAffiche(r) + ' ' + (r.consigne || '') + ' ' +
        marques.map(function (g) { return g.nom + ' ' + (g.abrege || ''); }).join(' '));
      return mots.every(function (m) { return t.indexOf(m) >= 0; });
    }).sort(function (a, b) { return ordre.indexOf(a.parcId) - ordre.indexOf(b.parcId); });
  }
  // Texte avec les mots cherchés surlignés (<mark>), sans tenir compte des accents ni des majuscules.
  function surligner(texte, mots) {
    texte = texte || '';
    if (!mots.length) return texte;
    // Texte sans accents, et pour chacun de ses caractères la position dans le texte d'origine.
    var plat = '', pos = [];
    for (var i = 0; i < texte.length; i++) {
      var x = O.sansAccents(texte[i]);
      for (var j = 0; j < x.length; j++) { plat += x[j]; pos.push(i); }
    }
    pos.push(texte.length);
    var marque = [];
    mots.forEach(function (m) {
      for (var k = plat.indexOf(m); k >= 0; k = plat.indexOf(m, k + 1)) {
        for (var n = pos[k]; n < pos[k + m.length]; n++) marque[n] = true;
      }
    });
    var morceaux = [], debut = 0;
    for (var a = 1; a <= texte.length; a++) {
      if (a === texte.length || !marque[a] !== !marque[debut]) {
        var bout = texte.slice(debut, a);
        morceaux.push(marque[debut] ? h('mark', { class: 'trouve' }, bout) : bout);
        debut = a;
      }
    }
    return morceaux;
  }

  // parc : feuille d'un parc. recherche (texte non vide) : feuille spéciale des résidents trouvés, tous parcs,
  // avec une colonne Parc et sans les lignes propres à un parc (carrés de plats, salariés, hors parcs).
  function grille(d, s, parc, recherche) {
    var residents = recherche ? residentsTrouves(d, recherche)
      : d.residents.filter(function (r) { return !r.archive && r.parcId === parc.id; });
    // Colonnes « toujours affichées » (page Régimes), plus celles qu'un résident affiché présente.
    var groupes = O.colonnesGroupees(M.groupesRegimes(d, function (g) {
      return g.id !== M.textureDefaut(d) && M.colonneAffichee(g, residents);
    }));
    var cols = groupes.colonnes;
    var vis = creneauxVisibles(s);
    // Trait marqué au début de chaque jour : sur son premier créneau affiché.
    function bord(c) {
      var k = vis.indexOf(c);
      return k === 0 || M.decoupeCreneau(vis[k - 1]).jour !== M.decoupeCreneau(c).jour ? 'jour' : '';
    }
    var gabarit ='grid-template-columns:34px 190px ' + (recherche ? '100px ' : '') + '150px repeat(' + cols.length + ',34px) 10px repeat(' + vis.length + ',32px)';

    var bandeaux = groupes.bandeaux(gabarit, [h('div', { class: 'colle0' }), h('div', { class: 'colle1' }), recherche ? h('div') : null, h('div')]);
    var entete = h('div', { class: 'g g-entete', style: gabarit },
      h('div', { class: 'gh colle0' }, h('span', { class: 'v' }, 'N°')),
      h('div', { class: 'gh gauche colle1' }, 'NOM Prénom'),
      recherche ? h('div', { class: 'gh gauche' }, 'PARC') : null,
      h('div', { class: 'gh gauche' }, 'OBSERVATION'),
      cols.map(function (g) {
        return h('div', { class: 'gh' + (groupes.debut(g) ? ' debut-groupe' : ''), style: 'background:' + g.couleur + ';color:' + O.texteSur(g.couleur), title: g.nom },
          h('span', { class: 'v' }, (g.abrege || g.nom).toUpperCase()));
      }),
      h('div'),
      vis.map(function (c) {
        var sc = M.decoupeCreneau(c);
        return h('div', { class: 'gh ' + bord(c) }, h('span', { class: 'v' },
          M.jour(sc.jour).court.replace('.', '').toUpperCase() + ' ' + (+M.dateDuJour(s, sc.jour).slice(8)) + ' ' + M.service(sc.service).court));
      }));

    // Ligne « Menu avec porc » (semaine-porc.js), commune à toute la MAS : en tête, sur chaque onglet.
    var lignePorc = h('div', { class: 'g g-porc', style: gabarit },
      h('div', { class: 'gc colle0' }),
      h('div', { class: 'gc gauche gras colle1 etiquette', title: R.MenuPorc.LIBELLE }, R.MenuPorc.LIBELLE),
      h('div', { class: 'gnote', style: 'grid-column:span ' + (cols.length + (recherche ? 2 : 1)) }, R.MenuPorc.NOTE),
      h('div'),
      R.MenuPorc.cellules(s, vis, bord, recherche ? null : parc.id));

    // Carrés sous les en-têtes : plats du parc par service = colonne du parc sur la feuille cuisine
    // (résidents présents hors partis en activité, plats en plus, salariés du parc).
    // Les champs numériques enregistrent sans re-rendu (focus gardé) : majCarres() met les carrés à jour sur place.
    // Sodexo, Direction, Nettoyage et Plats témoins sont dans l’onglet Hors parc (semaine-horsparc.js).
    var colonnes, comptes, majs = [];
    function calculer() {
      var feuilles = vis.map(function (c) { return C.feuilleJour(d, s, c); });
      colonnes = feuilles.map(function (f) {
        return f.parcs.filter(function (col) { return col.type === 'parc' && col.id === parc.id; })[0];
      });
      comptes = colonnes.map(function (col) { return col.c; });
    }
    // Une ligne de texture apparaît ou disparaît (ex. salariés en texture par défaut) : re-rendu complet.
    function majCarres() {
      calculer();
      if (texturesPresentes().join() !== textures.map(function (g) { return g.id; }).join()) App.rendre();
      else majs.forEach(function (f) { f(); });
    }
    // Textures avec au moins un plat dans le parc sur un service affiché (les autres lignes sont masquées).
    // Seule la texture par défaut : aucune ligne (elle répéterait « Plats <parc> »).
    function texturesPresentes() {
      var ids = M.parNature(d, 'texture').filter(function (g) {
        return comptes.some(function (n) { return n.tex[g.id]; });
      }).map(function (g) { return g.id; });
      return ids.length === 1 && ids[0] === M.textureDefaut(d) ? [] : ids;
    }
    if (!recherche) calculer();
    // style et titre : texte, ou fonction du n° de créneau affiché k.
    function ligneCarres(libelle, note, valeur, style, titre, fin) {
      return h('div', { class: 'g g-carres' + (fin ? ' fin-carres' : ''), style: gabarit },
        h('div', { class: 'gc colle0' }),
        // Étiquette collée = colonne du nom seulement (sinon elle masque les premiers services en défilant).
        h('div', { class: 'gc gauche gras colle1 etiquette', title: libelle }, libelle),
        h('div', { class: 'gnote', style: 'grid-column:span ' + (cols.length + 1) }, note),
        h('div'),
        vis.map(function (c, k) {
          var carre = h('span', { style: typeof style === 'function' ? style(k) : style });
          function maj() {
            var n = valeur(k), t = (typeof titre === 'function' ? titre(k) : titre) + ' · ' + C.libelleCreneaux([c]) + ' : ' + O.pluriel(n, 'plat');
            carre.className = 'carre' + (n ? '' : ' vide');
            carre.title = t;
            carre.setAttribute('aria-label', t);
            carre.textContent = n ? String(n) : '';
          }
          maj();
          majs.push(maj);
          return h('div', { class: 'gc ' + bord(c) }, carre);
        }));
    }
    // Puis une ligne par texture présente (en plats, double plat = 2). Normal + Haché + … = plats du parc.
    var presentes = recherche ? [] : texturesPresentes();
    var textures = M.parNature(d, 'texture').filter(function (g) { return presentes.indexOf(g.id) >= 0; });
    // Enfin, si des résidents du parc partent en activité sur un service affiché : plats retirés du parc
    // (comptés dans la colonne de l'activité), pour comprendre un nombre de plats plus petit que les présents.
    var avecActivite = !recherche && colonnes.some(function (col) { return col.platsPartis; });
    function activitesDe(k) {
      var parAct = {};
      colonnes[k].partis.forEach(function (x) {
        var a = parAct[x.activite.id] = parAct[x.activite.id] || { activite: x.activite, plats: 0 };
        a.plats += x.plats;
      });
      return Object.keys(parAct).map(function (id) { return parAct[id]; });
    }
    var carres = recherche ? [] : [
      ligneCarres('Plats ' + parc.nom, 'ce parc', function (k) { return comptes[k].total; }, null,
        'Plats ' + parc.nom + ' (résidents présents hors activités, plats en plus, salariés du parc)', !textures.length && !avecActivite)
    ].concat(textures.map(function (g, i) {
      return ligneCarres(g.nom, '', function (k) { return comptes[k].tex[g.id] || 0; },
        'background:' + g.couleur + ';color:' + O.texteSur(g.couleur), 'Texture ' + g.nom + ' (' + parc.nom + ')', i === textures.length - 1 && !avecActivite);
    }), avecActivite ? [ligneCarres('En activité', 'retirés de ce parc', function (k) { return colonnes[k].platsPartis; },
      function (k) { var acts = activitesDe(k); return acts.length === 1 ? 'border-color:' + acts[0].activite.couleur : null; },
      function (k) {
        return 'Plats de résidents ' + parc.nom + ' partis en activité, comptés dans l’activité' +
          activitesDe(k).map(function (a) { return ' · ' + a.activite.nom + ' : ' + O.pluriel(a.plats, 'plat'); }).join('');
      }, true)] : []);

    // Donne la valeur v à une liste de cases {i: n° de ligne, k: n° de créneau affiché}, en une seule sauvegarde,
    // annulable par Ctrl+Z (historique.js). Une valeur égale à celle de la fiche efface la saisie (pas de fausse alerte).
    function appliquer(cases, v) {
      R.Historique.modifier(s, 'présences', recherche ? null : parc.id, cases.map(function (x) {
        var r = residents[x.i], c = vis[x.k];
        return {
          lire: function () { return (s.presences[r.id] || {})[c]; },
          // undefined : pas de saisie (valeur par défaut de la fiche).
          ecrire: function (val) {
            var p = s.presences[r.id] = s.presences[r.id] || {};
            if (val === undefined) delete p[c]; else p[c] = val;
            if (!Object.keys(p).length) delete s.presences[r.id];
          },
          v: v === C.presenceParDefaut(s, r, c) ? undefined : v
        };
      }));
    }
    function inverse(i, k) { return 1 - C.presence(s, residents[i], vis[k]).valeur; }

    // Souris : presser une case inverse sa valeur ; glisser étend cette valeur au rectangle
    // entre la première case et la case survolée ; relâcher enregistre ; Échap annule.
    function presser(e, i, k) {
      if (e.button !== 0) return;
      e.preventDefault();
      var zone = e.currentTarget.closest('.grille');
      var cases = Array.prototype.map.call(zone.querySelectorAll('.pc'), function (b) {
        return { b: b, classe: b.className, texte: b.textContent, i: +b.getAttribute('data-i'), k: +b.getAttribute('data-k'),
          w: +b.getAttribute('data-w') };
      });
      var v = inverse(i, k), fin = { i: i, k: k };
      function dessiner() {
        var i0 = Math.min(i, fin.i), i1 = Math.max(i, fin.i), k0 = Math.min(k, fin.k), k1 = Math.max(k, fin.k);
        cases.forEach(function (x) {
          x.dedans = x.i >= i0 && x.i <= i1 && x.k >= k0 && x.k <= k1;
          x.b.className = x.dedans ? x.classe.replace(/ (present|absent|abs-fiche|alerte-case)\b/g, '') + (v ? ' present' : ' absent') + ' zone' : x.classe;
          x.b.textContent = x.dedans ? String(v * x.w) : x.texte;
        });
      }
      function bouger(ev) {
        var el = document.elementFromPoint(ev.clientX, ev.clientY);
        var b = el && el.closest('.pc');
        if (!b || !zone.contains(b)) return;
        var n = { i: +b.getAttribute('data-i'), k: +b.getAttribute('data-k') };
        if (n.i !== fin.i || n.k !== fin.k) { fin = n; dessiner(); }
      }
      function arreter(annule) {
        document.removeEventListener('pointermove', bouger);
        document.removeEventListener('pointerup', relacher);
        document.removeEventListener('pointercancel', annuler);
        document.removeEventListener('keydown', echap);
        if (annule) cases.forEach(function (x) { x.b.className = x.classe; x.b.textContent = x.texte; });
        else appliquer(cases.filter(function (x) { return x.dedans; }), v);
      }
      function relacher() { arreter(false); }
      function annuler() { arreter(true); }
      function echap(ev) { if (ev.key === 'Escape') arreter(true); }
      document.addEventListener('pointermove', bouger);
      document.addEventListener('pointerup', relacher);
      document.addEventListener('pointercancel', annuler);
      document.addEventListener('keydown', echap);
      dessiner();
    }

    // Cases en alerte (alertes visibles seulement) : créneaux contradictoires, ou toute la semaine si aucune présence.
    var enAlerte = {};
    C.alertesVisibles(d, s).forEach(function (a) {
      (a.type === 'aucunePresence' ? M.creneaux(s) : a.creneaux).forEach(function (c) {
        enAlerte[a.residentId + ':' + c] = a.titre;
      });
    });

    // Case présente = nombre de plats du résident (2 avec double plat), absente = 0.
    // Feuille de recherche : mots trouvés surlignés (nom, observation) et cases cochées trouvées encadrées.
    var refs = M.refs(d), mots = recherche ? motsCherches(recherche) : [];
    var lignes = residents.map(function (r, i) {
      var marques = [r.textureId].concat(r.regimeIds, r.optionIds);
      return h('div', { class: 'g g-ligne', style: gabarit },
        h('div', { class: 'gc gris colle0' }, i + 1),
        h('div', { class: 'gc gauche gras colle1' },
          h('button', { class: 'crayon', 'aria-label': 'Ouvrir la fiche de ' + M.nomAffiche(r), title: 'Ouvrir la fiche',
            onclick: function () { App.ouvrir('resident', r.id); } }, O.iconeCrayon()),
          h('span', { class: 'coupe' }, surligner(M.nomAffiche(r), mots))),
        recherche ? celluleParc(M.parc(d, r.parcId)) : null,
        h('div', { class: 'gc gauche obs', title: r.consigne }, surligner(r.consigne, mots)),
        cols.map(function (g) {
          var on = marques.indexOf(g.id) >= 0, trouve = on && mots.length && groupeTrouve(g, mots);
          return h('div', { class: 'gc marque' + (on ? ' on' : '') + (trouve ? ' trouve' : '') + (groupes.debut(g) ? ' debut-groupe' : ''),
            title: trouve ? g.nom + ' (trouvé par la recherche)' : null }, on ? 'X' : '');
        }),
        h('div'),
        vis.map(function (c, k) {
          var p = C.presence(s, r, c);
          var act = C.activiteDe(s, r.id, c);
          var w = C.poids(r, refs, M.decoupeCreneau(c).service);
          var titre = [M.nomAffiche(r) + ' · ' + C.libelleCreneaux([c]) + ' : ' + (p.valeur ? 'présent' : 'absent')];
          if (p.valeur && w > 1) titre.push(w + ' plats (options en plus)');
          if (p.source === 'absence') titre.push('absence planifiée (fiche du résident)');
          if (p.source === 'voisins') titre.push('d’après les services voisins');
          if (act) titre.push('participe à : ' + act.nom);
          var alerte = enAlerte[r.id + ':' + c];
          if (alerte) titre.push('alerte : ' + alerte);
          return h('button', {
            class: 'pc ' + bord(c) + (p.valeur ? ' present' : ' absent') + (p.source === 'absence' ? ' abs-fiche' : '') + (act ? ' act' : '') + (alerte ? ' alerte-case' : ''),
            style: act ? '--act:' + act.couleur : null,
            title: titre.join(' · '), 'aria-label': titre.join(' · '), 'data-i': i, 'data-k': k, 'data-w': w,
            onpointerdown: function (e) { presser(e, i, k); },
            // Clavier seulement (Entrée / Espace) : la souris passe par presser.
            onclick: function (e) { if (e.detail === 0) appliquer([{ i: i, k: k }], inverse(i, k)); }
          }, String(p.valeur * w));
        }));
    });

    // Salariés : sélection et saisie « façon Excel » (selection-nombres.js), à part des cases de présence.
    var nombres;
    function ligneNombres(libelle, note, fond, lire, ecrire) {
      var i = nombres.ligne(libelle, lire, ecrire);
      return h('div', { class: 'g g-sal', style: gabarit + ';background:' + fond },
        h('div', { class: 'gc colle0', style: 'background:' + fond }),
        h('div', { class: 'gc gauche gras colle1 etiquette', style: 'background:' + fond, title: libelle }, libelle),
        h('div', { class: 'gnote', style: 'grid-column:span ' + (cols.length + 1) }, note),
        h('div'),
        vis.map(function (c, k) { return nombres.cellule(i, k, bord(c)); }));
    }
    function salarie(cleChamp) {
      return {
        lire: function (c) { return ((s.salaries[parc.id] || {})[c] || {})[cleChamp] || 0; },
        ecrire: function (c, n) {
          var p = s.salaries[parc.id] = s.salaries[parc.id] || {};
          var v = p[c] = p[c] || { standard: 0, sansPorc: 0 };
          v[cleChamp] = n;
        }
      };
    }
    if (recherche) {
      return h('div', { class: 'carte-grille' },
        legende(s, Object.keys(enAlerte).length > 0, true),
        residents.length ? h('div', { class: 'defil', 'data-defil': 'grille' },
          h('div', { class: 'grille' }, bandeaux, entete, lignePorc, lignes))
          : h('div', { class: 'message message-attention' }, 'Aucun résident actif ne correspond à « ' + recherche.trim() + ' ».'));
    }
    nombres = R.SelectionNombres.grille({ cle: 'parc:' + parc.id + ':' + s.id + ':' + vis.join(), semaine: s,
      libelle: 'salariés', lieu: parc.id, creneaux: vis, apres: majCarres });
    var a = salarie('standard'), b = salarie('sansPorc');
    var lignesSal = [
      ligneNombres('Salariés standard (' + parc.nom + ')', '', '#f0ede4', a.lire, a.ecrire),
      ligneNombres('Salariés sans porc (' + parc.nom + ')', '', '#f0ede4', b.lire, b.ecrire)
    ];

    return h('div', { class: 'carte-grille', style: 'border-top-color:' + parc.couleur },
      legende(s, Object.keys(enAlerte).length > 0),
      // Hors de la zone défilante : les boutons restent visibles quelle que soit la largeur de la grille.
      residents.length ? null : h('div', { class: 'message message-attention message-action' },
        h('span', null, 'Aucun résident actif dans ce parc.'),
        h('span', { class: 'rangee' },
          h('button', { class: 'btn', onclick: function () { App.ouvrir('residents'); } }, 'Voir tous les résidents'),
          h('button', { class: 'btn btn-principal', onclick: function () { R.PageResident.nouveau(parc.id); } }, '+ Ajouter un résident à ' + parc.nom))),
      h('div', { class: 'defil', 'data-defil': 'grille' },
        h('div', { class: 'grille' }, bandeaux, entete, lignePorc, carres, lignes, lignesSal)));
  }

  // alerte : au moins une case en alerte dans la semaine (entrée de légende ajoutée).
  // recherche : feuille de recherche (entrée « Trouvé par la recherche » en tête).
  function legende(s, alerte, recherche) {
    return h('div', { class: 'legende' },
      recherche ? [h('mark', { class: 'trouve' }, 'texte'), h('span', { class: 'pc-ex marque-trouve' }, 'X'), 'Trouvé par la recherche'] : null,
      h('span', { class: 'pc-ex' }, '1'), 'Présent et consommant 1 repas',
      h('span', { class: 'pc-ex absent' }, '0'), 'Absent',
      h('span', { class: 'pc-ex abs-fiche' }, '0'), 'Absence planifiée',
      alerte ? [h('span', { class: 'pc-ex alerte-case' }), 'Alerte (voir au-dessus)'] : null,
      s.activites.length ? s.activites.map(function (a) {
        return [h('span', { class: 'pc-ex act', style: '--act:' + a.couleur }), a.nom];
      }) : [h('span', { class: 'pc-ex act' }), 'Activité']);
  }

  // Colonne Parc de la feuille de recherche.
  function celluleParc(p) {
    return h('div', { class: 'gc gauche' }, p ? h('span', { class: 'etiquette-parc coupe', title: p.nom,
      style: 'background:' + p.couleur + ';color:' + O.texteSur(p.couleur) }, p.nom) : null);
  }

  // Supprime la semaine s (après confirmation) et affiche la semaine voisine. La dernière semaine ne peut pas être supprimée.
  function supprimer(d, s) {
    var i = d.semaines.indexOf(s);
    App.confirmer('Supprimer définitivement la ' + O.titreSemaine(s).toLowerCase() +
      ' ?\n\nToutes ses saisies (présences, activités, salariés…) seront perdues.', function () {
      if (d.semaines.indexOf(s) !== i) return;
      if (R.Pages.activites.abandonner) R.Pages.activites.abandonner();
      var voisine = d.semaines[i - 1] || d.semaines[i + 1];
      App.modifier(function () { d.semaines.splice(i, 1); }, { sansRendu: true });
      App.ui.semaine = voisine.id;
      App.nettoyerOnglets();
      App.ouvrir('semaine', voisine.id);
    }, { ok: 'Supprimer', danger: true });
  }

  R.Pages.semaine = {
    ID_HORS_PARC: ID_HORS_PARC,   // lu par la fenêtre des nouveautés (bouton « Voir » vers l'onglet Hors parc)
    titre: function (o) {
      var s = M.semaine(App.donnees, o.id);
      return s ? 'Semaine ' + M.numeroSemaine(s.debut).numero : 'Semaine';
    },
    rendu: function (o) {
      var d = App.donnees, s = M.semaine(d, o.id);
      var parcs = d.referentiels.parcs;
      var parc = M.parc(d, App.ui.parcActif) || parcs[0];
      // Onglet « Hors parc » (à droite des parcs) : App.ui.parcActif = ID_HORS_PARC (aucun parc n'a cet identifiant).
      var horsParc = App.ui.parcActif === ID_HORS_PARC;
      var recherche = (App.etat.rechercheSemaine || '').trim() ? App.etat.rechercheSemaine : '';
      return h('div', { class: 'page page-large' },
        h('div', { class: 'page-tete' },
          h('h1', null, O.titreSemaine(s)),
          h('label', { class: 'champ-ligne' }, 'Semaine ',
            h('select', { onchange: function (e) { App.ouvrir('semaine', e.target.value); } },
              // Plus récente en haut (d.semaines est trié de la plus ancienne à la plus récente).
              d.semaines.slice().reverse().map(function (x) { return h('option', { value: x.id, selected: x.id === s.id }, O.titreSemaine(x)); }))),
          h('button', { class: 'btn', onclick: function () {
            var derniere = d.semaines[d.semaines.length - 1];
            var suivante = M.semaineSuivante(derniere, M.debutSemaineACreer(derniere, M.aujourdhui()));
            // Message : le choix « Semaine » change discrètement, on doit voir qu'on est passé à la nouvelle semaine.
            var titre = 'Semaine ' + M.numeroSemaine(suivante.debut).numero;
            if (M.semaine(d, suivante.id)) { App.ouvrir('semaine', suivante.id); App.toast(titre + ' déjà créée : affichée'); return; }
            App.modifier(function () { d.semaines.push(suivante); }, { sansRendu: true });
            App.ouvrir('semaine', suivante.id);
            App.toast(O.titreSemaine(suivante) + ' créée (salariés, hors parc, absences et menus repris)');
          } }, 'Créer la semaine suivante'),
          h('button', { class: 'btn', onclick: function () { App.ui.semaine = s.id; App.ouvrir('imprimer'); } }, 'Imprimer cette semaine'),
          d.semaines.length > 1 ? h('button', { class: 'btn btn-danger', onclick: function () { supprimer(d, s); } }, 'Supprimer cette semaine') : null),
        alertes(d, s),
        activites(s),
        servicesAjoutes(s),
        filtreServices(s),
        parc ? [
          h('div', { class: 'onglets-parcs', role: 'tablist' }, parcs.map(function (p) {
            var actif = !recherche && !horsParc && p.id === parc.id;
            var n = d.residents.filter(function (r) { return !r.archive && r.parcId === p.id; }).length;
            return h('button', { class: 'onglet-parc' + (actif ? ' actif' : ''), role: 'tab', 'aria-selected': actif ? 'true' : 'false',
              style: actif ? 'background:' + p.couleur + ';color:' + O.texteSur(p.couleur) : '',
              onclick: function () { App.etat.rechercheSemaine = ''; App.ui.parcActif = p.id; App.sauverUi(); App.rendre(); } },
              h('span', { class: 'pastille-couleur', style: 'background:' + p.couleur, 'aria-hidden': 'true' }), p.nom + ' (' + n + ')');
          }),
          h('button', { class: 'onglet-parc onglet-horsparc' + (!recherche && horsParc ? ' actif' : ''), role: 'tab',
            'aria-selected': !recherche && horsParc ? 'true' : 'false', title: 'Sodexo, Direction, Nettoyage, Plats témoins',
            onclick: function () { App.etat.rechercheSemaine = ''; App.ui.parcActif = ID_HORS_PARC; App.sauverUi(); App.rendre(); } }, 'Hors parc'),
          recherche ? h('button', { class: 'onglet-parc actif onglet-recherche', role: 'tab', 'aria-selected': 'true' },
            'Recherche « ' + recherche.trim() + ' » (' + residentsTrouves(d, recherche).length + ')') : null,
          // Recherche : feuille spéciale tous parcs (nom, texture / régime / option, observation ; plusieurs mots = tous trouvés).
          h('input', { id: 'recherche-semaine', type: 'search', class: 'recherche-semaine', placeholder: 'Nom, régime, observation…',
            title: 'Cherche dans le nom, les textures, régimes et options, et l\'observation, tous parcs. Plusieurs mots : tous doivent être trouvés.',
            'aria-label': 'Rechercher un résident par nom, texture, régime, option ou observation, tous parcs', value: App.etat.rechercheSemaine || '',
            oninput: function (e) {
              var pos = e.target.selectionStart;
              App.etat.rechercheSemaine = e.target.value;
              App.rendre();
              // Le champ est recréé par le rendu : on lui rend le focus et la position du curseur.
              var champ = document.getElementById('recherche-semaine');
              if (champ) { champ.focus(); champ.setSelectionRange(pos, pos); }
            } })),
          horsParc && !recherche ? R.HorsParc.grille(d, s, creneauxVisibles(s)) : grille(d, s, parc, recherche)
        ] : h('div', { class: 'message message-attention message-action' },
          h('span', null, 'Aucun parc : créez-en un dans la page Parcs.'),
          h('button', { class: 'btn', onclick: function () { App.ouvrir('parcs'); } }, 'Aller à la page Parcs')));
    }
  };
})(window.Recueil = window.Recueil || {});
