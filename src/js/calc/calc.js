/* Calculs purs : présences, colonnes de la feuille cuisine, chariots, alertes.
   Aucune lecture de l'écran ni du stockage (testé par tests.html). */
(function (R) {
  'use strict';
  var M = R.Modele;

  // ---------- Présence ----------
  function estAbsentFiche(resident, semaine, c) {
    var date = M.dateDuCreneau(semaine, c);
    var service = M.decoupeCreneau(c).service;
    return (resident.absences || []).some(function (a) {
      return a.debut <= date && date <= a.fin && (a.services || M.IDS_SERVICES).indexOf(service) >= 0;
    });
  }

  function presence(semaine, resident, c) {
    var saisies = (semaine.presences || {})[resident.id] || {};
    if (saisies[c] === 0 || saisies[c] === 1) return { valeur: saisies[c], source: 'saisie' };
    return estAbsentFiche(resident, semaine, c) ? { valeur: 0, source: 'absence' } : { valeur: 1, source: 'defaut' };
  }

  // Valeur par défaut d'une case (sans saisie) : sert à effacer une saisie redevenue inutile.
  function presenceParDefaut(semaine, resident, c) {
    return estAbsentFiche(resident, semaine, c) ? 0 : 1;
  }

  function activitesDuCreneau(semaine, c) {
    var s = M.decoupeCreneau(c);
    return (semaine.activites || []).filter(function (a) { return a.jour === s.jour && a.service === s.service; });
  }

  function activiteDe(semaine, residentId, c) {
    var liste = activitesDuCreneau(semaine, c);
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].participantIds.indexOf(residentId) >= 0) return liste[i];
    }
    return null;
  }

  function residentsActifs(donnees) {
    return donnees.residents.filter(function (r) { return !r.archive; });
  }

  // ---------- Compteurs ----------
  function compteursVides() {
    return { residents: 0, platsEnPlus: 0, salStd: 0, salSansPorc: 0, temoins: 0, total: 0, tex: {}, reg: {}, opt: {} };
  }
  function plus(table, cle, n) { if (n) table[cle] = (table[cle] || 0) + n; }

  // Régimes / options d'un résident qui comptent pour ce service (cases « Services » de la page Régimes).
  // service absent : tous.
  function regimesDu(resident, refs, service) {
    return resident.regimeIds.filter(function (id) { return !service || M.concerne(refs[id], service); });
  }
  function optionsDu(resident, refs, service) {
    return resident.optionIds.filter(function (id) { return !service || M.concerne(refs[id], service); });
  }
  // Texture du résident à ce service : la sienne si elle concerne le service, sinon la texture par défaut
  // si elle le concerne, sinon aucune ('').
  function textureDu(resident, refs, service, texDef) {
    if (!service || M.concerne(refs[resident.textureId], service)) return resident.textureId;
    return texDef && M.concerne(refs[texDef], service) ? texDef : '';
  }

  // Plats en plus d'un résident : un par option « +1 plat » (double plat, gros gourmand…).
  // Service « présence seulement » (petit déjeuner) : jamais de plat en plus.
  function platsEnPlus(resident, refs, service) {
    if (service && M.service(service).presenceSeule) return 0;
    return optionsDu(resident, refs, service).filter(function (id) { return refs[id] && refs[id].affecte === 'plat'; }).length;
  }
  // Nombre de plats chauds d'un résident : 1 + ses plats en plus.
  function poids(resident, refs, service) { return 1 + platsEnPlus(resident, refs, service); }

  // Seuls la texture, les régimes et les options qui concernent le service sont comptés.
  function ajouterResident(cpt, resident, refs, service, texDef) {
    cpt.residents += 1;
    var w = poids(resident, refs, service);
    cpt.platsEnPlus += w - 1;
    var t = textureDu(resident, refs, service, texDef);
    if (t) plus(cpt.tex, t, w);
    regimesDu(resident, refs, service).forEach(function (id) { plus(cpt.reg, id, w); });
    // Option « +1 plat » : comptée en personnes ; option d'assiette : sur chacun de ses plats.
    optionsDu(resident, refs, service).forEach(function (id) {
      plus(cpt.opt, id, refs[id] && refs[id].affecte === 'plat' ? 1 : w);
    });
  }

  // Convives « salariés » : texture par défaut ; sansPorc compté en régime sans porc ; regimeSup pour le nettoyage sans viande.
  // Chacun seulement s'il concerne le service (petit déjeuner : en général aucun).
  function ajouterConvives(cpt, standard, sansPorc, refs, service, texDef, regimeSup) {
    standard = standard || 0; sansPorc = sansPorc || 0;
    cpt.salStd += standard;
    cpt.salSansPorc += sansPorc;
    if (M.concerne(refs[texDef], service)) plus(cpt.tex, texDef, standard + sansPorc);
    if (M.concerne(refs[M.REGIME_SANS_PORC], service)) plus(cpt.reg, M.REGIME_SANS_PORC, sansPorc);
    if (regimeSup && M.concerne(refs[regimeSup], service)) plus(cpt.reg, regimeSup, standard + sansPorc);
  }

  function finir(cpt) {
    cpt.total = cpt.residents + cpt.platsEnPlus + cpt.salStd + cpt.salSansPorc + cpt.temoins;
    return cpt;
  }

  function additionner(liste) {
    var t = compteursVides();
    liste.forEach(function (c) {
      ['residents', 'platsEnPlus', 'salStd', 'salSansPorc', 'temoins'].forEach(function (k) { t[k] += c[k]; });
      ['tex', 'reg', 'opt'].forEach(function (k) {
        Object.keys(c[k]).forEach(function (id) { plus(t[k], id, c[k][id]); });
      });
    });
    return finir(t);
  }

  // ---------- Feuille cuisine : colonnes d'un créneau ----------
  function feuilleJour(donnees, semaine, c) {
    var refs = M.refs(donnees);
    var sv = M.decoupeCreneau(c).service;
    var seul = !!M.service(sv).presenceSeule;
    var texDef = M.textureDefaut(donnees);
    var activites = activitesDuCreneau(semaine, c);
    var colParc = {}, colAct = {};
    var colonnes = [];

    donnees.referentiels.parcs.forEach(function (p) {
      var col = { id: p.id, type: 'parc', nom: p.nom, couleur: p.couleur, c: compteursVides(), residents: [], partis: [], platsPartis: 0 };
      var sal = ((semaine.salaries || {})[p.id] || {})[c] || {};
      col.salaries = { standard: sal.standard || 0, sansPorc: sal.sansPorc || 0 };
      ajouterConvives(col.c, col.salaries.standard, col.salaries.sansPorc, refs, sv, texDef);
      colParc[p.id] = col;
      colonnes.push(col);
    });
    activites.forEach(function (a) {
      var col = { id: a.id, type: 'activite', nom: a.nom, couleur: a.couleur || M.COULEUR_ACTIVITE, c: compteursVides(), residents: [], partis: [], activite: a,
        salaries: { standard: 0, sansPorc: 0 } };
      colAct[a.id] = col;
      colonnes.push(col);
    });

    residentsActifs(donnees).forEach(function (r) {
      if (presence(semaine, r, c).valeur !== 1) return;
      var act = null;
      for (var i = 0; i < activites.length; i++) {
        if (activites[i].participantIds.indexOf(r.id) >= 0) { act = activites[i]; break; }
      }
      var col = act ? colAct[act.id] : colParc[r.parcId];
      if (!col) return; // parc inconnu : ignoré (signalé dans la page Résidents)
      if (act && colParc[r.parcId]) {
        var w = poids(r, refs, sv);
        colParc[r.parcId].partis.push({ resident: r, activite: act, plats: w });
        colParc[r.parcId].platsPartis += w;  // plats retirés du parc (comptés dans l'activité)
      }
      ajouterResident(col.c, r, refs, sv, texDef);
      col.residents.push(r);
    });
    colonnes.forEach(function (col) { finir(col.c); });

    var totalParcs = { id: 'totalParcs', type: 'totalParcs', nom: 'TOTAL PARCS', couleur: '#e4e4e4',
      c: additionner(colonnes.map(function (x) { return x.c; })) };

    var sod = (semaine.sodexo || {})[c] || {};
    var sodexo = { id: 'sodexo', type: 'sodexo', nom: 'Cuisiniers', couleur: '#ffffff', c: compteursVides() };
    ajouterConvives(sodexo.c, sod.standard, sod.sansPorc, refs, sv, texDef);
    finir(sodexo.c);

    var direction = { id: 'direction', type: 'direction', nom: 'Direction', couleur: '#ffffff', c: compteursVides() };
    ajouterConvives(direction.c, (semaine.direction || {})[c] || 0, 0, refs, sv, texDef);
    finir(direction.c);

    var nettoyage = { id: 'nettoyage', type: 'autres', nom: 'Nettoyage', couleur: '#ffffff', c: compteursVides() };
    ajouterConvives(nettoyage.c, (semaine.nettoyage || {})[c] || 0, 0, refs, sv, texDef);
    ajouterConvives(nettoyage.c, (semaine.nettoyageSansViande || {})[c] || 0, 0, refs, sv, texDef, M.REGIME_NETTOYAGE);
    finir(nettoyage.c);

    // Plats témoins (échantillons à conserver) : nombre donné par le client, texture par défaut, sans régime.
    var temoins = { id: 'temoins', type: 'temoins', nom: 'Plats témoins', couleur: '#ffffff', c: compteursVides() };
    temoins.c.temoins = (semaine.temoins || {})[c] || 0;
    if (M.concerne(refs[texDef], sv)) plus(temoins.c.tex, texDef, temoins.c.temoins);
    finir(temoins.c);

    var total = { id: 'total', type: 'total', nom: 'TOTAL À PRODUIRE', couleur: '#111111',
      c: additionner([totalParcs.c, sodexo.c, direction.c, nettoyage.c, temoins.c]) };

    return {
      creneau: c, service: sv, activites: activites, presenceSeule: seul,
      parcs: colonnes,                 // parcs puis activités
      colonnes: colonnes.concat([totalParcs, sodexo, direction, nettoyage, temoins, total]),
      total: total.c
    };
  }

  // « Sur ces N plats : … » — textures hors défaut, régimes, options d'assiette (pas « +1 plat ») qui concernent le service.
  function ventilation(donnees, cpt, service) {
    var texDef = M.textureDefaut(donnees);
    return donnees.referentiels.regimes.filter(function (g) {
      if (service && !M.concerne(g, service)) return false;
      if (g.nature === 'texture') return g.id !== texDef;
      if (g.nature === 'option') return !g.affecte;
      return true;
    }).map(function (g) {
      var table = g.nature === 'texture' ? cpt.tex : (g.nature === 'option' ? cpt.opt : cpt.reg);
      return { id: g.id, nom: g.nom, abrege: g.abrege, nature: g.nature, couleur: g.couleur, valeur: table[g.id] || 0 };
    });
  }

  // ---------- Feuille chariot ----------
  function chariot(donnees, semaine, c, col) {
    var refs = M.refs(donnees);
    var texDef = M.textureDefaut(donnees);
    var sv = M.decoupeCreneau(c).service;
    var res = { normauxSimples: 0, sansPorcSeuls: 0, etiquettes: [], doubles: [], platsEnPlus: 0 };
    col.residents.forEach(function (r) {
      var opts = optionsDu(r, refs, sv).filter(function (id) { return refs[id]; });
      var regs = regimesDu(r, refs, sv).filter(function (id) { return refs[id]; });
      var tex = textureDu(r, refs, sv, texDef) || texDef;
      var simple = tex === texDef && opts.length === 0 && !(r.consigne || '').trim();
      if (simple && regs.length === 0) res.normauxSimples += 1;
      else if (simple && regs.length === 1 && regs[0] === M.REGIME_SANS_PORC) res.sansPorcSeuls += 1;
      else {
        res.etiquettes.push({
          resident: r, nom: M.nomAffiche(r), qui: 'RÉSIDENT',
          parc: col.type === 'activite' ? M.parc(donnees, r.parcId) : null,  // chariot d'activité : rappel du parc
          texture: refs[tex] || { id: tex, nom: tex, couleur: '#ffffff' },
          tags: regs.concat(opts).map(function (id) { return refs[id]; }),
          consigne: (r.consigne || '').trim(), eq: poids(r, refs, sv)
        });
      }
      var n = platsEnPlus(r, refs, sv);
      if (n) { res.doubles.push({ nom: M.nomAffiche(r), n: n }); res.platsEnPlus += n; }
    });
    res.salaries = col.salaries || { standard: 0, sansPorc: 0 };
    res.volume = col.c.total;
    res.partis = col.partis || [];
    return res;
  }

  // Chariot d'un service « présence seulement » : textures hors défaut, régimes et options qui concernent le service,
  // avec les résidents concernés. Renvoie [{ regime, noms[] }] (vides exclus), ordre du référentiel.
  function particularites(donnees, c, col) {
    var refs = M.refs(donnees);
    var texDef = M.textureDefaut(donnees);
    var sv = M.decoupeCreneau(c).service;
    return donnees.referentiels.regimes.filter(function (g) { return g.id !== texDef && M.concerne(g, sv); }).map(function (g) {
      var noms = col.residents.filter(function (r) {
        if (g.nature === 'texture') return textureDu(r, refs, sv, texDef) === g.id;
        return (g.nature === 'option' ? optionsDu(r, refs, sv) : regimesDu(r, refs, sv)).indexOf(g.id) >= 0;
      }).map(M.nomAffiche);
      return { regime: g, noms: noms };
    }).filter(function (x) { return x.noms.length; });
  }

  // ---------- Alertes (écran seulement, jamais sur les feuilles imprimées) ----------
  function alertes(donnees, semaine) {
    var liste = [];
    var fin = M.ajouterJours(semaine.debut, 6);
    residentsActifs(donnees).forEach(function (r) {
      var nom = M.nomAffiche(r);
      var contradictions = M.CRENEAUX.filter(function (c) {
        var p = presence(semaine, r, c);
        return p.source === 'saisie' && p.valeur === 1 && estAbsentFiche(r, semaine, c);
      });
      if (contradictions.length) {
        liste.push({
          cle: 'presentAbsent:' + r.id + ':' + contradictions.join(','), type: 'presentAbsent', residentId: r.id,
          titre: 'Présent alors qu’absent', creneaux: contradictions,
          detail: nom + ' : absent dans sa fiche, mais présent saisi ' + libelleCreneaux(contradictions) + '.'
        });
      }
      var aucune = M.CRENEAUX.every(function (c) { return presence(semaine, r, c).valeur === 0; });
      var absenceSemaine = (r.absences || []).some(function (a) { return a.debut <= fin && a.fin >= semaine.debut; });
      if (aucune && !absenceSemaine) {
        liste.push({
          cle: 'aucunePresence:' + r.id, type: 'aucunePresence', residentId: r.id, titre: 'Aucune présence',
          detail: nom + ' : 0 toute la semaine sans absence enregistrée dans sa fiche.'
        });
      }
    });
    return liste;
  }

  function alertesVisibles(donnees, semaine) {
    var traitees = (semaine.alertesTraitees || []).map(function (t) { return t.cle; });
    return alertes(donnees, semaine).filter(function (a) { return traitees.indexOf(a.cle) < 0; });
  }

  function libelleCreneaux(liste) {
    return liste.map(function (c) {
      var s = M.decoupeCreneau(c);
      return M.jour(s.jour).court + ' ' + M.service(s.service).court;
    }).join(', ');
  }

  R.Calc = {
    estAbsentFiche: estAbsentFiche, presence: presence, presenceParDefaut: presenceParDefaut,
    activitesDuCreneau: activitesDuCreneau, activiteDe: activiteDe, residentsActifs: residentsActifs,
    poids: poids, platsEnPlus: platsEnPlus, regimesDu: regimesDu, optionsDu: optionsDu, textureDu: textureDu, compteursVides: compteursVides, additionner: additionner,
    feuilleJour: feuilleJour, ventilation: ventilation, chariot: chariot, particularites: particularites,
    alertes: alertes, alertesVisibles: alertesVisibles, libelleCreneaux: libelleCreneaux
  };
})(window.Recueil = window.Recueil || {});
