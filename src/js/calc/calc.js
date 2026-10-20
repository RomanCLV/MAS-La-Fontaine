/* Calculs purs : présences, colonnes de la feuille chef, chariots, alertes.
   Aucune lecture de l'écran ni du stockage (testé par tests.html). */
(function (R) {
  'use strict';
  var M = R.Modele;

  // ---------- Présence ----------
  function estAbsentFiche(resident, semaine, c) {
    var date = M.dateDuCreneau(semaine, c);
    var service = M.decoupeCreneau(c).service;
    return (resident.absences || []).some(function (a) {
      return a.debut <= date && date <= a.fin && (a.services || ['midi', 'soir']).indexOf(service) >= 0;
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
    return { residents: 0, doublesPlats: 0, salStd: 0, salSansPorc: 0, temoins: 0, total: 0, tex: {}, reg: {}, opt: {} };
  }
  function plus(table, cle, n) { if (n) table[cle] = (table[cle] || 0) + n; }

  function aDoublePlat(resident, refs) {
    return resident.optionIds.some(function (id) { return refs[id] && refs[id].affecte === 'plat'; });
  }
  // Nombre de plats chauds d'un résident : 1, ou 2 avec « double plat ».
  function poids(resident, refs) { return aDoublePlat(resident, refs) ? 2 : 1; }

  function ajouterResident(cpt, resident, refs) {
    var w = poids(resident, refs);
    cpt.residents += 1;
    if (w === 2) cpt.doublesPlats += 1;
    plus(cpt.tex, resident.textureId, w);
    resident.regimeIds.forEach(function (id) { plus(cpt.reg, id, w); });
    resident.optionIds.forEach(function (id) {
      var a = refs[id] ? refs[id].affecte : '';
      plus(cpt.opt, id, (a === 'plat' || a === 'legumes' || a === 'information') ? 1 : w);
    });
  }

  // Convives « salariés » : texture par défaut ; sansPorc compté en régime sans porc ; regimeSup pour le nettoyage sans viande.
  function ajouterConvives(cpt, standard, sansPorc, textureDefaut, regimeSup) {
    standard = standard || 0; sansPorc = sansPorc || 0;
    cpt.salStd += standard;
    cpt.salSansPorc += sansPorc;
    plus(cpt.tex, textureDefaut, standard + sansPorc);
    plus(cpt.reg, M.REGIME_SANS_PORC, sansPorc);
    if (regimeSup) plus(cpt.reg, regimeSup, standard + sansPorc);
  }

  function finir(cpt) {
    cpt.total = cpt.residents + cpt.doublesPlats + cpt.salStd + cpt.salSansPorc + cpt.temoins;
    return cpt;
  }

  function additionner(liste) {
    var t = compteursVides();
    liste.forEach(function (c) {
      ['residents', 'doublesPlats', 'salStd', 'salSansPorc', 'temoins'].forEach(function (k) { t[k] += c[k]; });
      ['tex', 'reg', 'opt'].forEach(function (k) {
        Object.keys(c[k]).forEach(function (id) { plus(t[k], id, c[k][id]); });
      });
    });
    return finir(t);
  }

  // ---------- Feuille chef : colonnes d'un créneau ----------
  function feuilleJour(donnees, semaine, c) {
    var refs = M.refs(donnees);
    var texDef = M.textureDefaut(donnees);
    var activites = activitesDuCreneau(semaine, c);
    var colParc = {}, colAct = {};
    var colonnes = [];

    donnees.referentiels.parcs.forEach(function (p) {
      var col = { id: p.id, type: 'parc', nom: p.nom, couleur: p.couleur, c: compteursVides(), residents: [], partis: [] };
      var sal = ((semaine.salaries || {})[p.id] || {})[c] || {};
      col.salaries = { standard: sal.standard || 0, sansPorc: sal.sansPorc || 0 };
      ajouterConvives(col.c, col.salaries.standard, col.salaries.sansPorc, texDef);
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
      if (act && colParc[r.parcId]) colParc[r.parcId].partis.push({ resident: r, activite: act });
      ajouterResident(col.c, r, refs);
      col.residents.push(r);
    });
    colonnes.forEach(function (col) { finir(col.c); });

    var totalParcs = { id: 'totalParcs', type: 'totalParcs', nom: 'TOTAL PARCS', couleur: '#e4e4e4',
      c: additionner(colonnes.map(function (x) { return x.c; })) };

    var sod = (semaine.sodexo || {})[c] || {};
    var sodexo = { id: 'sodexo', type: 'sodexo', nom: 'Cuisiniers', couleur: '#ffffff', c: compteursVides() };
    ajouterConvives(sodexo.c, sod.standard, sod.sansPorc, texDef);
    finir(sodexo.c);

    var direction = { id: 'direction', type: 'direction', nom: 'Direction', couleur: '#ffffff', c: compteursVides() };
    ajouterConvives(direction.c, (semaine.direction || {})[c] || 0, 0, texDef);
    finir(direction.c);

    var nettoyage = { id: 'nettoyage', type: 'autres', nom: 'Nettoyage', couleur: '#ffffff', c: compteursVides() };
    ajouterConvives(nettoyage.c, (semaine.nettoyage || {})[c] || 0, 0, texDef);
    ajouterConvives(nettoyage.c, (semaine.nettoyageSansViande || {})[c] || 0, 0, texDef, M.REGIME_NETTOYAGE);
    finir(nettoyage.c);

    // Plats témoins (échantillons à conserver) : nombre donné par le client, texture par défaut, sans régime.
    var temoins = { id: 'temoins', type: 'temoins', nom: 'Plats témoins', couleur: '#ffffff', c: compteursVides() };
    temoins.c.temoins = (semaine.temoins || {})[c] || 0;
    plus(temoins.c.tex, texDef, temoins.c.temoins);
    finir(temoins.c);

    var total = { id: 'total', type: 'total', nom: 'TOTAL À PRODUIRE', couleur: '#111111',
      c: additionner([totalParcs.c, sodexo.c, direction.c, nettoyage.c, temoins.c]) };

    return {
      creneau: c, activites: activites,
      parcs: colonnes,                 // parcs puis activités
      colonnes: colonnes.concat([totalParcs, sodexo, direction, nettoyage, temoins, total]),
      total: total.c
    };
  }

  // « Sur ces N plats : … » — textures hors défaut, régimes, options d'assiette (sans « affecte »).
  function ventilation(donnees, cpt) {
    var texDef = M.textureDefaut(donnees);
    return donnees.referentiels.regimes.filter(function (g) {
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
    var res = { normauxSimples: 0, sansPorcSeuls: 0, etiquettes: [], doubles: [], legumes: 0 };
    col.residents.forEach(function (r) {
      var opts = r.optionIds.filter(function (id) { return refs[id]; });
      var regs = r.regimeIds.filter(function (id) { return refs[id]; });
      var simple = r.textureId === texDef && opts.length === 0 && !(r.consigne || '').trim();
      if (simple && regs.length === 0) res.normauxSimples += 1;
      else if (simple && regs.length === 1 && regs[0] === M.REGIME_SANS_PORC) res.sansPorcSeuls += 1;
      else {
        res.etiquettes.push({
          resident: r, nom: M.nomAffiche(r), qui: 'RÉSIDENT',
          texture: refs[r.textureId] || { id: r.textureId, nom: r.textureId, couleur: '#ffffff' },
          tags: regs.concat(opts).map(function (id) { return refs[id]; }),
          consigne: (r.consigne || '').trim(), eq: poids(r, refs)
        });
      }
      if (aDoublePlat(r, refs)) res.doubles.push(M.nomAffiche(r));
      opts.forEach(function (id) { if (refs[id].affecte === 'legumes') res.legumes += 1; });
    });
    res.salaries = col.salaries || { standard: 0, sansPorc: 0 };
    res.volume = col.c.total;
    res.partis = col.partis || [];
    return res;
  }

  // ---------- Alertes (manager seulement) ----------
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
      return M.jour(s.jour).court + ' ' + s.service;
    }).join(', ');
  }

  R.Calc = {
    estAbsentFiche: estAbsentFiche, presence: presence, presenceParDefaut: presenceParDefaut,
    activitesDuCreneau: activitesDuCreneau, activiteDe: activiteDe, residentsActifs: residentsActifs,
    poids: poids, aDoublePlat: aDoublePlat, compteursVides: compteursVides, additionner: additionner,
    feuilleJour: feuilleJour, ventilation: ventilation, chariot: chariot,
    alertes: alertes, alertesVisibles: alertesVisibles, libelleCreneaux: libelleCreneaux
  };
})(window.Recueil = window.Recueil || {});
