/* Page Semaine (saisie client) : alertes manager, activités, grille des présences par parc. */
(function (R) {
  'use strict';
  var M = R.Modele, C = R.Calc, h = R.h, O = R.Outils, App = R.App;

  function bord(k) { return k % 2 === 0 ? 'jour' : ''; }

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
          h('b', null, a.nom), ' · ' + M.jour(a.jour).nom.toLowerCase() + ' ' + a.service + ' · ' + O.pluriel(a.participantIds.length, 'participant'));
      }),
      h('button', { class: 'btn', onclick: function () { R.PageActivites.nouvelle(); } }, '+ Ajouter une activité'));
  }

  function grille(d, s, parc) {
    var groupes = O.colonnesGroupees(M.groupesRegimes(d, function (g) { return g.id !== M.textureDefaut(d); }));
    var cols = groupes.colonnes;
    var gabarit = 'grid-template-columns:34px 190px 150px repeat(' + cols.length + ',34px) 10px repeat(14,32px)';
    var residents = d.residents.filter(function (r) { return !r.archive && r.parcId === parc.id; });

    var bandeaux = groupes.bandeaux(gabarit, [h('div', { class: 'colle0' }), h('div', { class: 'colle1' }), h('div')]);
    var entete = h('div', { class: 'g g-entete', style: gabarit },
      h('div', { class: 'gh colle0' }, h('span', { class: 'v' }, 'N°')),
      h('div', { class: 'gh gauche colle1' }, 'NOM Prénom'),
      h('div', { class: 'gh gauche' }, 'OBSERVATION'),
      cols.map(function (g) {
        return h('div', { class: 'gh' + (groupes.debut(g) ? ' debut-groupe' : ''), style: 'background:' + g.couleur + ';color:' + O.texteSur(g.couleur), title: g.nom },
          h('span', { class: 'v' }, (g.abrege || g.nom).toUpperCase()));
      }),
      h('div'),
      M.CRENEAUX.map(function (c, k) {
        var sc = M.decoupeCreneau(c);
        return h('div', { class: 'gh ' + bord(k) }, h('span', { class: 'v' },
          M.jour(sc.jour).court.replace('.', '').toUpperCase() + ' ' + (+M.dateDuJour(s, sc.jour).slice(8)) + ' ' + sc.service));
      }));

    // Donne la valeur v à une liste de cases {i: n° de ligne, k: n° de créneau}, en une seule sauvegarde.
    // Une valeur égale à celle de la fiche efface la saisie (pas de fausse alerte).
    function appliquer(cases, v) {
      App.modifier(function () {
        cases.forEach(function (x) {
          var r = residents[x.i], c = M.CRENEAUX[x.k];
          var p = s.presences[r.id] = s.presences[r.id] || {};
          if (v === C.presenceParDefaut(s, r, c)) delete p[c]; else p[c] = v;
          if (!Object.keys(p).length) delete s.presences[r.id];
        });
      });
    }
    function inverse(i, k) { return 1 - C.presence(s, residents[i], M.CRENEAUX[k]).valeur; }

    // Souris : presser une case inverse sa valeur ; glisser étend cette valeur au rectangle
    // entre la première case et la case survolée ; relâcher enregistre ; Échap annule.
    function presser(e, i, k) {
      if (e.button !== 0) return;
      e.preventDefault();
      var zone = e.currentTarget.closest('.grille');
      var cases = Array.prototype.map.call(zone.querySelectorAll('.pc'), function (b) {
        return { b: b, classe: b.className, texte: b.textContent, i: +b.getAttribute('data-i'), k: +b.getAttribute('data-k') };
      });
      var v = inverse(i, k), fin = { i: i, k: k };
      function dessiner() {
        var i0 = Math.min(i, fin.i), i1 = Math.max(i, fin.i), k0 = Math.min(k, fin.k), k1 = Math.max(k, fin.k);
        cases.forEach(function (x) {
          x.dedans = x.i >= i0 && x.i <= i1 && x.k >= k0 && x.k <= k1;
          x.b.className = x.dedans ? x.classe.replace(/ (present|absent|abs-fiche)\b/g, '') + (v ? ' present' : ' absent') + ' zone' : x.classe;
          x.b.textContent = x.dedans ? String(v) : x.texte;
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

    var lignes = residents.map(function (r, i) {
      var marques = [r.textureId].concat(r.regimeIds, r.optionIds);
      return h('div', { class: 'g g-ligne', style: gabarit },
        h('div', { class: 'gc gris colle0' }, i + 1),
        h('div', { class: 'gc gauche gras colle1' },
          h('button', { class: 'crayon', 'aria-label': 'Ouvrir la fiche de ' + M.nomAffiche(r), title: 'Ouvrir la fiche',
            onclick: function () { App.ouvrir('resident', r.id); } }, O.iconeCrayon()),
          h('span', { class: 'coupe' }, M.nomAffiche(r))),
        h('div', { class: 'gc gauche obs', title: r.consigne }, r.consigne),
        cols.map(function (g) {
          var on = marques.indexOf(g.id) >= 0;
          return h('div', { class: 'gc marque' + (on ? ' on' : '') + (groupes.debut(g) ? ' debut-groupe' : '') }, on ? 'X' : '');
        }),
        h('div'),
        M.CRENEAUX.map(function (c, k) {
          var p = C.presence(s, r, c);
          var act = C.activiteDe(s, r.id, c);
          var titre = [M.nomAffiche(r) + ' · ' + C.libelleCreneaux([c]) + ' : ' + (p.valeur ? 'présent' : 'absent')];
          if (p.source === 'absence') titre.push('absence enregistrée dans la fiche');
          if (act) titre.push('participe à : ' + act.nom);
          return h('button', {
            class: 'pc ' + bord(k) + (p.valeur ? ' present' : ' absent') + (p.source === 'absence' ? ' abs-fiche' : '') + (act ? ' act' : ''),
            style: act ? '--act:' + act.couleur : null,
            title: titre.join(' · '), 'aria-label': titre.join(' · '), 'data-i': i, 'data-k': k,
            onpointerdown: function (e) { presser(e, i, k); },
            // Clavier seulement (Entrée / Espace) : la souris passe par presser.
            onclick: function (e) { if (e.detail === 0) appliquer([{ i: i, k: k }], inverse(i, k)); }
          }, String(p.valeur));
        }));
    });

    // separe : trait marqué au-dessus de la ligne (début des lignes « tous parcs »).
    function ligneNombres(libelle, note, fond, lire, ecrire, separe) {
      return h('div', { class: 'g g-sal' + (separe ? ' separe' : ''), style: gabarit + ';background:' + fond },
        h('div', { class: 'gc colle0', style: 'background:' + fond }),
        h('div', { class: 'gc gauche gras colle1', style: 'grid-column:span 2;background:' + fond }, libelle),
        h('div', { class: 'gnote', style: 'grid-column:span ' + cols.length }, note),
        h('div'),
        M.CRENEAUX.map(function (c, k) {
          var v = lire(c);
          return h('div', { class: 'gc ' + bord(k) }, h('input', {
            class: 'nb', type: 'number', min: '0', step: '1', inputmode: 'numeric', value: v ? String(v) : '',
            'aria-label': libelle + ' · ' + C.libelleCreneaux([c]),
            onchange: function (e) {
              var n = Math.max(0, Math.floor(+e.target.value || 0));
              e.target.value = n ? String(n) : '';
              App.modifier(function () { ecrire(c, n); }, { sansRendu: true });
            }
          }));
        }));
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
    function sodexo(cleChamp) {
      return {
        lire: function (c) { return (s.sodexo[c] || {})[cleChamp] || 0; },
        ecrire: function (c, n) {
          var v = s.sodexo[c] = s.sodexo[c] || { standard: 0, sansPorc: 0 };
          v[cleChamp] = n;
        }
      };
    }
    function simple(table) {
      return {
        lire: function (c) { return s[table][c] || 0; },
        ecrire: function (c, n) { if (n) s[table][c] = n; else delete s[table][c]; }
      };
    }
    var a = salarie('standard'), b = salarie('sansPorc'), so = sodexo('standard'), sp = sodexo('sansPorc');
    var di = simple('direction'), ne = simple('nettoyage'), nv = simple('nettoyageSansViande');
    var lignesSal = [
      ligneNombres('Salariés standard (' + parc.nom + ')', '', '#f0ede4', a.lire, a.ecrire),
      ligneNombres('Salariés sans porc (' + parc.nom + ')', '', '#f0ede4', b.lire, b.ecrire),
      ligneNombres('Salariés SODEXO standard', 'tous parcs', '#e4edf7', so.lire, so.ecrire, true),
      ligneNombres('Salariés SODEXO sans porc', 'tous parcs', '#e4edf7', sp.lire, sp.ecrire),
      ligneNombres('Direction', 'tous parcs', '#e4edf7', di.lire, di.ecrire),
      ligneNombres('Nettoyage', 'tous parcs', '#e4edf7', ne.lire, ne.ecrire),
      ligneNombres('Nettoyage sans viande', 'tous parcs', '#e4edf7', nv.lire, nv.ecrire)
    ];

    return h('div', { class: 'carte-grille', style: 'border-top-color:' + parc.couleur },
      h('div', { class: 'legende' },
        h('span', { class: 'pc-ex abs-fiche' }), 'Absence (fiche)',
        s.activites.length ? s.activites.map(function (a) {
          return [h('span', { class: 'pc-ex act', style: '--act:' + a.couleur }), a.nom];
        }) : [h('span', { class: 'pc-ex act' }), 'Activité']),
      h('div', { class: 'defil', 'data-defil': 'grille' },
        h('div', { class: 'grille' }, bandeaux, entete, lignes,
          residents.length ? null : h('div', { class: 'vide-grille' }, 'Aucun résident actif dans ce parc.'),
          lignesSal)));
  }

  // Supprime la semaine s (après confirmation) et affiche la semaine voisine. La dernière semaine ne peut pas être supprimée.
  function supprimer(d, s) {
    var i = d.semaines.indexOf(s);
    if (!window.confirm('Supprimer définitivement la ' + O.titreSemaine(s).toLowerCase() +
      ' ?\n\nToutes ses saisies (présences, activités, salariés…) seront perdues.')) return;
    if (R.Pages.activites.abandonner) R.Pages.activites.abandonner();
    var voisine = d.semaines[i - 1] || d.semaines[i + 1];
    App.modifier(function () { d.semaines.splice(i, 1); }, { sansRendu: true });
    App.ui.semaine = voisine.id;
    App.nettoyerOnglets();
    App.ouvrir('semaine', voisine.id);
  }

  R.Pages.semaine = {
    titre: function (o) {
      var s = M.semaine(App.donnees, o.id);
      return s ? 'Semaine ' + M.numeroSemaine(s.debut).numero : 'Semaine';
    },
    rendu: function (o) {
      var d = App.donnees, s = M.semaine(d, o.id);
      var parcs = d.referentiels.parcs;
      var parc = M.parc(d, App.ui.parcActif) || parcs[0];
      return h('div', { class: 'page page-large' },
        h('div', { class: 'page-tete' },
          h('h1', null, O.titreSemaine(s)),
          h('label', { class: 'champ-ligne' }, 'Semaine ',
            h('select', { onchange: function (e) { App.ouvrir('semaine', e.target.value); } },
              d.semaines.map(function (x) { return h('option', { value: x.id, selected: x.id === s.id }, O.titreSemaine(x)); }))),
          h('button', { class: 'btn', onclick: function () {
            var suivante = M.semaineSuivante(d.semaines[d.semaines.length - 1]);
            if (M.semaine(d, suivante.id)) return;
            App.modifier(function () { d.semaines.push(suivante); }, { sansRendu: true });
            App.ouvrir('semaine', suivante.id);
          } }, 'Créer la semaine suivante'),
          h('button', { class: 'btn', onclick: function () { App.ui.semaine = s.id; App.ouvrir('imprimer'); } }, 'Imprimer cette semaine'),
          d.semaines.length > 1 ? h('button', { class: 'btn btn-danger', onclick: function () { supprimer(d, s); } }, 'Supprimer cette semaine') : null),
        App.ui.manager ? alertes(d, s) : null,
        activites(s),
        parc ? [
          h('div', { class: 'onglets-parcs', role: 'tablist' }, parcs.map(function (p) {
            var actif = p.id === parc.id;
            var n = d.residents.filter(function (r) { return !r.archive && r.parcId === p.id; }).length;
            return h('button', { class: 'onglet-parc' + (actif ? ' actif' : ''), role: 'tab', 'aria-selected': actif ? 'true' : 'false',
              style: actif ? 'background:' + p.couleur + ';color:' + O.texteSur(p.couleur) : '',
              onclick: function () { App.ui.parcActif = p.id; App.sauverUi(); App.rendre(); } }, p.nom + ' (' + n + ')');
          })),
          grille(d, s, parc)
        ] : h('div', { class: 'message' }, 'Aucun parc : créez-en un dans la page Parcs.'));
    }
  };
})(window.Recueil = window.Recueil || {});
