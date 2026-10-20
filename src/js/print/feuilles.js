/* Feuilles imprimables A4 paysage : feuille cuisine et feuille chariot (maquettes Main et ChariotA v2.1).
   Aucune alerte n'apparaît ici. */
(function (R) {
  'use strict';
  var M = R.Modele, C = R.Calc, h = R.h, O = R.Outils;
  var ETIQUETTES_PAR_PAGE = 6;

  function titreCreneau(semaine, c) {
    var s = M.decoupeCreneau(c);
    return M.jour(s.jour).nom.toUpperCase() + ' ' + O.dateLongue(M.dateDuJour(semaine, s.jour)).toUpperCase() +
      ' · ' + M.service(s.service).nom.toUpperCase();
  }
  function libelleCourt(c) {
    var s = M.decoupeCreneau(c);
    return M.jour(s.jour).nom + ' ' + M.service(s.service).court;
  }
  // Unité affichée à côté du total : « plats », ou « petits déj. » (service « présence seulement »).
  function unite(f) { return f.presenceSeule ? 'petits déj.' : 'plats'; }
  function tiret(v) { return v ? v : '–'; }
  // Nom trop long pour la colonne de libellés : abrégé du référentiel s'il existe.
  function nomCourt(g) { return g.nom.length > 26 && g.abrege ? g.abrege : g.nom; }

  // Hauteur des lignes du tableau en « lignes simples » (total et textures : 1,4 ; bandeau de groupe : 0,9).
  // Sert à réduire les lignes si elles ne tiennent pas dans la page (feuilles.css, --n).
  function hauteurLignes(lignes) {
    return lignes.reduce(function (n, l) {
      if (!l) return n;
      var k = l.classList;
      return n + (k.contains('fc-groupe') ? 0.9 : k.contains('fc-total') || k.contains('fc-texture') ? 1.4 : 1);
    }, 0).toFixed(1);
  }

  // ---------------- Feuille cuisine ----------------
  function cuisine(donnees, semaine, c) {
    var f = C.feuilleJour(donnees, semaine, c);
    var cols = f.colonnes;
    var nParcs = f.parcs.length;                 // parcs + activités
    var iTotalParcs = nParcs, iTotal = cols.length - 1;
    var grille = 'grid-template-columns:210px repeat(' + cols.length + ',minmax(0,1fr))';
    var texDef = M.textureDefaut(donnees);
    var total = f.total.total;

    function bord(i) { return i >= iTotalParcs ? '2px solid #111' : '1px solid #999'; }
    function fort(i) { return i === iTotalParcs || i === iTotal; }

    function ligne(libelle, valeur, opt) {
      opt = opt || {};
      var fond = opt.fond || '#fff';
      return h('div', { class: 'fc-ligne ' + (opt.classe || ''), style: grille + ';--fond:' + fond },
        h('div', { class: 'fc-lab', style: 'background:' + fond }, libelle),
        cols.map(function (col, i) {
          var v = valeur(col.c);
          return h('div', {
            class: 'fc-cel' + (v ? '' : ' vide'),
            style: 'border-left:' + bord(i) + ';background:' + (fort(i) && fond === '#fff' ? '#efefef' : fond)
          }, tiret(v));
        }));
    }
    function groupe(libelle) { return h('div', { class: 'fc-groupe' }, libelle); }
    // Total (toutes colonnes) d'une texture / d'un régime / d'une option.
    function totalDe(g) {
      var table = g.nature === 'texture' ? f.total.tex : (g.nature === 'option' ? f.total.opt : f.total.reg);
      return table[g.id] || 0;
    }
    // Seulement ce qui concerne le service (cases « Services » de la page Régimes) et n'est pas à 0.
    function lignesNature(nature, filtre) {
      return donnees.referentiels.regimes.filter(function (g) {
        return g.nature === nature && M.concerne(g, f.service) && totalDe(g) && (!filtre || filtre(g));
      });
    }

    var lignes = [
      groupe('REPAS'),
      ligne('Résidents présents', function (x) { return x.residents; }),
      f.presenceSeule ? null : ligne('+ Doubles plats (en plus)', function (x) { return x.doublesPlats; }),
      ligne('Salariés standard', function (x) { return x.salStd; }),
      ligne('Salariés sans porc', function (x) { return x.salSansPorc; }),
      ligne('Plats témoins', function (x) { return x.temoins; }),
      ligne('TOTAL', function (x) { return x.total; }, { classe: 'fc-total', fond: '#ececec' })
    ];
    // Groupes vides (rien de coché pour ce service, ex. petit déjeuner, ou tout à 0) : non affichés.
    var textures = lignesNature('texture');
    if (textures.length) {
      lignes.push(groupe('TEXTURES (tous convives)'));
      textures.forEach(function (g) {
        var defaut = g.id === texDef;
        lignes.push(ligne(defaut ? g.nom : g.nom.toUpperCase(), function (x) { return x.tex[g.id] || 0; },
          defaut ? {} : { classe: 'fc-texture', fond: g.couleur }));
      });
    }
    var regimes = lignesNature('regime');
    if (regimes.length) {
      lignes.push(groupe('RÉGIMES (tous convives)'));
      regimes.forEach(function (g) {
        lignes.push(ligne(nomCourt(g), function (x) { return x.reg[g.id] || 0; }));
      });
    }
    var options = lignesNature('option', function (g) { return g.affecte !== 'plat' && g.affecte !== 'information'; });
    if (options.length) {
      lignes.push(groupe('OPTIONS'));
      options.forEach(function (g) {
        lignes.push(ligne(nomCourt(g) + (g.affecte === 'legumes' ? ' (à part)' : ''), function (x) { return x.opt[g.id] || 0; }));
      });
    }
    // Options « information » (ex. pots gourmands) : quantité par zone, hors production.
    var infos = lignesNature('option', function (g) { return g.affecte === 'information'; });
    if (infos.length) {
      lignes.push(groupe('INFORMATIONS (hors production)'));
      infos.forEach(function (g) {
        lignes.push(ligne(nomCourt(g), function (x) { return x.opt[g.id] || 0; }));
      });
    }

    var ventil = C.ventilation(donnees, f.total, f.service).filter(function (v) { return v.valeur; });
    var sousTitre = [donnees.etablissement, 'Semaine ' + M.numeroSemaine(semaine.debut).numero];
    if (f.activites.length) {
      sousTitre.push('Activité : ' + f.activites.map(function (a) {
        return a.nom + ' (' + M.jour(a.jour).court + ' ' + M.service(a.service).court + ')';
      }).join(', '));
    }

    var zones = h('div', { class: 'fc-zones', style: grille },
      h('div'),
      h('div', { class: 'fc-zone', style: 'grid-column:span ' + (nParcs + 1) }, 'PARCS'),
      h('div', { class: 'fc-zone' }, 'SODEXO'),
      h('div', { class: 'fc-zone' }, 'DIRECTION'),
      h('div', { class: 'fc-zone' }, 'AUTRES'),
      h('div', { class: 'fc-zone' }, 'TÉMOINS'),
      h('div', { class: 'fc-zone noir' }, 'TOTAL'));
    var entetes = h('div', { class: 'fc-colonnes', style: grille },
      h('div', { class: 'fc-lab' }, 'Colonne'),
      cols.map(function (col, i) {
        var fond = i === iTotal ? '#111' : col.couleur;
        return h('div', { class: 'fc-col', style: 'background:' + fond + ';color:' + O.texteSur(fond) + ';border-left:' + bord(i) },
          col.type === 'activite' ? col.nom.toUpperCase() + ' (activité)' : col.nom);
      }));

    var regle = f.presenceSeule ? 'Petit déjeuner : présences, et seulement les régimes / options cochés pour ce service. Total parc = résidents + salariés.'
      : 'Total parc = résidents + doubles plats + salariés.';
    var pied = f.activites.length
      ? 'Colonne ' + f.activites.map(function (a) { return a.nom; }).join(', ') +
        ' : résidents retirés de leur parc (même repas, chariot distinct). ' + regle
      : regle;

    return h('div', { class: 'feuille feuille-cuisine' },
      h('div', { class: 'fc-entete' },
        h('div', { class: 'fc-titres' },
          h('div', { class: 'fc-titre' }, 'FEUILLE CUISINE · ' + titreCreneau(semaine, c)),
          h('div', { class: 'fc-sous' }, sousTitre.join(' · '))),
        h('div', { class: 'fc-grand' },
          h('div', { class: 'fc-grand-lab' }, 'TOTAL À PRODUIRE'),
          h('div', { class: 'fc-grand-val' }, total, ' ', h('span', null, unite(f))))),
      f.presenceSeule || !ventil.length ? null : h('div', { class: 'fc-ventil' },
        h('span', { class: 'fc-ventil-lab' }, 'Sur ces ' + total + ' plats :'),
        ventil.map(function (v) {
          return h('span', { class: 'fc-chip', style: 'background:' + v.couleur + ';color:' + O.texteSur(v.couleur) },
            v.nature === 'texture' ? v.nom.toUpperCase() : nomCourt(v), ' ', h('b', null, v.valeur));
        })),
      h('div', { class: 'fc-table', style: '--n:' + hauteurLignes(lignes) }, zones, entetes, lignes),
      h('div', { class: 'fc-pied' }, h('span', null, pied), h('span', null, libelleCourt(c))));
  }

  // ---------------- Feuille chariot ----------------
  function chariots(donnees, semaine, c) {
    var f = C.feuilleJour(donnees, semaine, c);
    var pages = [];
    f.parcs.forEach(function (col) {
      if (col.c.total > 0) pages = pages.concat(f.presenceSeule ? chariotSimple(donnees, semaine, c, col) : chariot(donnees, semaine, c, col));
    });
    return pages;
  }

  // Sous-titre d'un chariot : résidents partis en activité (parc) ou provenance (activité).
  function infoChariot(donnees, col) {
    var info = '';
    if (col.type === 'activite') {
      var parParc = {};
      col.residents.forEach(function (r) { parParc[r.parcId] = (parParc[r.parcId] || 0) + 1; });
      info = 'Participants venant de : ' + Object.keys(parParc).map(function (id) {
        var p = M.parc(donnees, id);
        return (p ? p.nom : id) + ' (' + parParc[id] + ')';
      }).join(', ') + '. Même repas, chariot dédié.';
    } else if ((col.partis || []).length) {
      var parAct = {};
      col.partis.forEach(function (x) { parAct[x.activite.nom] = (parAct[x.activite.nom] || 0) + 1; });
      info = Object.keys(parAct).map(function (nom) {
        var n = parAct[nom];
        return O.pluriel(n, 'résident') + ' parti' + (n > 1 ? 's' : '') + ' à l\'activité ' + nom + ' : sur son chariot, pas ici.';
      }).join(' · ');
    }
    return info;
  }

  function enteteChariot(semaine, c, col, info, libelle, volume, detail) {
    return h('div', { class: 'ch-entete' },
      h('div', { class: 'ch-nom', style: 'background:' + col.couleur + ';color:' + O.texteSur(col.couleur) }, col.nom.toUpperCase()),
      h('div', { class: 'ch-info' },
        h('div', { class: 'ch-titre' }, 'CHARIOT · ' + titreCreneau(semaine, c)),
        info ? h('div', { class: 'ch-sous' }, info) : null),
      h('div', { class: 'ch-plats' }, h('div', { class: 'ch-plats-lab' }, libelle), h('div', { class: 'ch-plats-val' }, volume)),
      h('div', { class: 'ch-detail' }, detail));
  }

  // qui : 'sal' ou 'res' (bacs collectifs) = petit bandeau SALARIÉS / RÉSIDENTS et fond distinct.
  function bac(libelle, valeur, desc, qui) {
    return h('div', { class: 'ch-bac' + (qui ? ' ch-bac-' + qui : '') },
      qui ? h('div', { class: 'ch-bac-qui' }, qui === 'sal' ? 'SALARIÉS' : 'RÉSIDENTS') : null,
      h('div', { class: 'ch-bac-haut' }, h('span', { class: 'ch-bac-lab' }, libelle), h('span', { class: 'ch-bac-val' }, tiret(valeur))),
      h('div', { class: 'ch-bac-desc' }, desc));
  }
  // Bacs collectifs à quantité non nulle ; aucun → message.
  function bacsNonVides(liste) {
    var bacs = liste.filter(function (b) { return b.n; }).map(function (b) { return bac(b.lab, b.n, b.desc, b.qui); });
    return bacs.length ? bacs : [h('div', { class: 'ch-bac-desc' }, 'Aucun bac collectif cette fois.')];
  }

  // Chariot d'un service « présence seulement » (petit déjeuner) : des nombres, pas d'étiquettes ;
  // à droite, les régimes / options cochés pour ce service, avec les noms (ex. pots gourmands).
  function chariotSimple(donnees, semaine, c, col) {
    var cpt = col.c;
    var sal = cpt.salStd + cpt.salSansPorc;
    var detail = [O.pluriel(cpt.residents, 'résident')];
    if (sal) detail.push(O.pluriel(sal, 'salarié'));
    var parts = C.particularites(donnees, c, col);
    return [h('div', { class: 'feuille feuille-chariot' },
      enteteChariot(semaine, c, col, infoChariot(donnees, col), 'PETITS DÉJ.', cpt.total, detail.join(' + ')),
      h('div', { class: 'ch-corps' },
        h('div', { class: 'ch-collectif' },
          h('div', { class: 'ch-bandeau' }, 'PETIT DÉJEUNER · à charger'),
          h('div', { class: 'ch-bacs' }, bacsNonVides([
            { qui: 'sal', lab: 'Salariés', n: sal, desc: 'Salariés du parc' },
            { qui: 'res', lab: 'Résidents', n: cpt.residents, desc: 'Présents à ce service' }
          ]))),
        parts.length ? h('div', { class: 'ch-collectif ch-parts' },
          h('div', { class: 'ch-bandeau' }, 'PARTICULARITÉS · ce service'),
          h('div', { class: 'ch-bacs' }, parts.map(function (x) {
            return bac(nomCourt(x.regime), x.noms.length, x.noms.join(', '));
          }))) : null),
      h('div', { class: 'ch-pied' },
        h('span', null, 'Petit déjeuner : présences, et seulement les régimes / options cochés pour ce service.'),
        h('span', null, libelleCourt(c))))];
  }

  function chariot(donnees, semaine, c, col) {
    var ch = C.chariot(donnees, semaine, c, col);
    var refs = M.refs(donnees);
    var texDef = M.textureDefaut(donnees);
    var cpt = col.c;
    var info = infoChariot(donnees, col);

    var detail = [O.pluriel(cpt.residents, 'résident')];
    if (cpt.doublesPlats) detail.push(O.pluriel(cpt.doublesPlats, 'double plat', 'doubles plats'));
    if (cpt.salStd + cpt.salSansPorc) detail.push(O.pluriel(cpt.salStd + cpt.salSansPorc, 'salarié'));
    var textures = M.parNature(donnees, 'texture').filter(function (g) { return cpt.tex[g.id]; });

    function entete() {
      return enteteChariot(semaine, c, col, info, 'PLATS', ch.volume, [detail.join(' + '), h('br'),
        h('b', null, textures.map(function (g, i) {
          var t = g.nom + ' ' + cpt.tex[g.id];
          return [i ? ' · ' : '', g.id === texDef ? t : h('span', { class: 'ch-tex', style: 'background:' + g.couleur }, t)];
        }))]);
    }

    function collectif() {
      var enPlus = [];
      if (ch.doubles.length) {
        enPlus.push(O.pluriel(ch.doubles.length, 'plat chaud', 'plats chauds') + ' en double (étiquette ' + ch.doubles.join(', ') + ')');
      }
      if (ch.legumes) enPlus.push(O.pluriel(ch.legumes, 'portion') + ' de légumes verts à part');
      return h('div', { class: 'ch-collectif' },
        h('div', { class: 'ch-bandeau' }, 'COLLECTIF · bacs à charger'),
        h('div', { class: 'ch-bacs' },
          bacsNonVides([
            { qui: 'sal', lab: 'Salariés standard', n: ch.salaries.standard, desc: 'Bac standard, portions normales' },
            { qui: 'sal', lab: 'Salariés sans porc', n: ch.salaries.sansPorc, desc: 'Bac « sans porc »' },
            { qui: 'res', lab: 'Résidents simples', n: ch.normauxSimples, desc: 'Sans texture, régime ni option' },
            { qui: 'res', lab: 'Résidents sans porc', n: ch.sansPorcSeuls, desc: 'Seul régime « sans porc » · bac « sans porc »' }
          ]),
          enPlus.length ? h('div', { class: 'ch-enplus' }, 'En plus : ' + enPlus.join(' · ') + '.') : null));
    }

    function etiquette(e, i, n) {
      return h('div', { class: 'ch-etiq' },
        h('div', { class: 'ch-etiq-haut' }, h('span', null, e.qui), h('span', null, (i + 1) + '/' + n)),
        h('div', { class: 'ch-etiq-tex', style: 'background:' + e.texture.couleur + ';color:' + O.texteSur(e.texture.couleur) }, e.texture.nom.toUpperCase()),
        h('div', { class: 'ch-etiq-corps' },
          h('div', { class: 'ch-etiq-gauche' },
            h('div', { class: 'ch-etiq-nom' }, e.nom),
            e.consigne ? h('div', { class: 'ch-etiq-consigne' }, e.consigne) : null,
            h('div', { class: 'ch-etiq-tags' }, e.tags.map(function (g) {
              return h('span', { class: 'ch-tag', style: 'background:' + g.couleur + ';color:' + O.texteSur(g.couleur) }, nomCourt(g).toUpperCase());
            }))),
          h('div', { class: 'ch-eq' }, h('div', { class: 'ch-eq-lab' }, 'EQ'), h('div', { class: 'ch-eq-val' }, e.eq))));
    }

    var etiq = ch.etiquettes;
    var nPages = Math.max(1, Math.ceil(etiq.length / ETIQUETTES_PAR_PAGE));
    var pages = [];
    for (var p = 0; p < nPages; p++) {
      var lot = etiq.slice(p * ETIQUETTES_PAR_PAGE, (p + 1) * ETIQUETTES_PAR_PAGE);
      var cases = lot.map(function (e, k) { return etiquette(e, p * ETIQUETTES_PAR_PAGE + k, etiq.length); });
      if (!etiq.length) cases.push(h('div', { class: 'ch-libre ch-aucune' }, 'Aucune assiette individuelle pour ce chariot'));
      else while (cases.length < ETIQUETTES_PAR_PAGE) cases.push(h('div', { class: 'ch-libre' }, 'emplacement libre'));
      pages.push(h('div', { class: 'feuille feuille-chariot' },
        entete(),
        h('div', { class: 'ch-corps' },
          p === 0 ? collectif() : h('div', { class: 'ch-collectif ch-suite' }, h('div', { class: 'ch-bandeau' }, 'COLLECTIF'), h('div', { class: 'ch-bacs' }, 'Voir page 1.')),
          h('div', { class: 'ch-indiv' },
            h('div', { class: 'ch-indiv-haut' }, h('b', null, 'INDIVIDUEL · assiettes à identifier (étiquettes)'), h('span', null, 'EQ = équivalent portions')),
            h('div', { class: 'ch-grille' }, cases))),
        h('div', { class: 'ch-pied' },
          h('span', null, 'Les résidents dont le seul régime est « sans porc » sont en collectif (bac Résidents sans porc), sans étiquette.'),
          h('span', null, libelleCourt(c) + (nPages > 1 ? ' · page ' + (p + 1) + '/' + nPages : '')))));
    }
    return pages;
  }

  // Toutes les feuilles demandées, dans l'ordre jour × service (cuisine puis chariots).
  function construire(donnees, semaine, choix) {
    var frag = document.createDocumentFragment();
    var n = 0;
    M.JOURS.forEach(function (j) {
      if (choix.jours.indexOf(j.id) < 0) return;
      M.SERVICES.forEach(function (s) {
        if (choix.services.indexOf(s.id) < 0) return;
        var c = M.creneau(j.id, s.id);
        if (C.feuilleJour(donnees, semaine, c).total.total === 0) return;
        if (choix.cuisine) { frag.appendChild(cuisine(donnees, semaine, c)); n++; }
        if (choix.chariot) chariots(donnees, semaine, c).forEach(function (pg) { frag.appendChild(pg); n++; });
      });
    });
    return { fragment: frag, nombre: n };
  }

  R.Feuilles = { cuisine: cuisine, chariots: chariots, construire: construire };
})(window.Recueil = window.Recueil || {});
