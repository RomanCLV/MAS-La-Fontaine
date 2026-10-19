/* Copie de data/recueil_base_s42.json (données de démarrage, noms FICTIFS).
   Intégrée en JS car un navigateur ne peut pas lire un fichier voisin en file://. */
window.Recueil = window.Recueil || {};
window.Recueil.DONNEES_DEMARRAGE = {
 "app": "recueil-alimentation-mas-la-fontaine",
 "version": 1,
 "exporteLe": "2026-10-19",
 "referentiels": {
  "parcs": [
   {
    "id": "amboise",
    "nom": "Amboise",
    "couleur": "#F4B183",
    "ordre": 1
   },
   {
    "id": "bonaguil",
    "nom": "Bonaguil",
    "couleur": "#9DC3E6",
    "ordre": 2
   },
   {
    "id": "collioure",
    "nom": "Collioure",
    "couleur": "#A9D18E",
    "ordre": 3
   },
   {
    "id": "lude",
    "nom": "Lude",
    "couleur": "#C9A6E4",
    "ordre": 4
   },
   {
    "id": "mirande",
    "nom": "Mirande",
    "couleur": "#FFE699",
    "ordre": 5
   },
   {
    "id": "sully",
    "nom": "Sully",
    "couleur": "#F4A6B8",
    "ordre": 6
   },
   {
    "id": "alhambra",
    "nom": "Alhambra",
    "couleur": "#8FD3CF",
    "ordre": 7
   }
  ],
  "regimes": [
   {
    "id": "normal",
    "nom": "Normal",
    "nature": "texture",
    "couleur": "#ffffff"
   },
   {
    "id": "hache",
    "nom": "Haché",
    "nature": "texture",
    "couleur": "#f6c9a8"
   },
   {
    "id": "mixe",
    "nom": "Mixé",
    "nature": "texture",
    "couleur": "#e6a0a0"
   },
   {
    "id": "sans_porc",
    "nom": "Sans porc",
    "nature": "regime",
    "couleur": "#f4b6c8"
   },
   {
    "id": "sans_residus",
    "nom": "Sans résidus",
    "nature": "regime",
    "couleur": "#c9d9a6"
   },
   {
    "id": "double_legumes_vert",
    "nom": "Double légumes vert",
    "nature": "option",
    "couleur": "#a9d18e",
    "affecte": "legumes",
    "abrege": "Dbl légumes vert"
   },
   {
    "id": "hypo",
    "nom": "Hypocalorique",
    "nature": "regime",
    "couleur": "#b9e3d8",
    "abrege": "Plateau hypo"
   },
   {
    "id": "double_plat",
    "nom": "Double plat",
    "nature": "option",
    "couleur": "#f4a460",
    "affecte": "plat"
   },
   {
    "id": "pots_gourmands",
    "nom": "Pots gourmands",
    "nature": "option",
    "couleur": "#e8e8e8",
    "affecte": "information"
   },
   {
    "id": "diabetique",
    "nom": "Diabétique",
    "nature": "regime",
    "couleur": "#9dc3e6"
   },
   {
    "id": "enrichi",
    "nom": "Enrichi",
    "nature": "option",
    "couleur": "#f2d27a"
   },
   {
    "id": "sans_produit_mer",
    "nom": "Sans produit de la mer",
    "nature": "regime",
    "couleur": "#c9b7e8",
    "abrege": "Sans prod. mer"
   },
   {
    "id": "pane_pate_riz_frite",
    "nom": "Poisson/viande panée + pâtes/riz/frites",
    "nature": "option",
    "couleur": "#d9c29c",
    "abrege": "Pané + féculent"
   },
   {
    "id": "sans_viande",
    "nom": "Sans viande",
    "nature": "regime",
    "couleur": "#ffe08a"
   }
  ]
 },
 "residents": [
  {
   "id": "AMB-01",
   "nom": "BLANCHARD",
   "prenom": "Camille",
   "parcId": "amboise",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [
    "double_legumes_vert"
   ],
   "consigne": "DOUBLE LEGUMES VERT",
   "archive": false,
   "absences": []
  },
  {
   "id": "AMB-02",
   "nom": "TESSIER",
   "prenom": "Gaël",
   "parcId": "amboise",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "AMB-03",
   "nom": "VALLÉE",
   "prenom": "Inès",
   "parcId": "amboise",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "AMB-04",
   "nom": "NOËL",
   "prenom": "Hugo",
   "parcId": "amboise",
   "textureId": "hache",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "DOUBLE  PORTION",
   "archive": false,
   "absences": []
  },
  {
   "id": "AMB-05",
   "nom": "FONTAINE",
   "prenom": "Léa",
   "parcId": "amboise",
   "textureId": "hache",
   "regimeIds": [
    "sans_residus"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "AMB-06",
   "nom": "CARON",
   "prenom": "Yann",
   "parcId": "amboise",
   "textureId": "hache",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "AMB-07",
   "nom": "SIMONET",
   "prenom": "Sacha",
   "parcId": "amboise",
   "textureId": "hache",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "AMB-08",
   "nom": "AUBERT",
   "prenom": "Rose",
   "parcId": "amboise",
   "textureId": "mixe",
   "regimeIds": [],
   "optionIds": [
    "enrichi"
   ],
   "consigne": "ENRICHIE",
   "archive": false,
   "absences": []
  },
  {
   "id": "BON-01",
   "nom": "DELMAS",
   "prenom": "Noé",
   "parcId": "bonaguil",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "BON-02",
   "nom": "ROLLAND",
   "prenom": "Alix",
   "parcId": "bonaguil",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "BON-03",
   "nom": "MARCHAL",
   "prenom": "Maëlle",
   "parcId": "bonaguil",
   "textureId": "normal",
   "regimeIds": [
    "sans_residus"
   ],
   "optionIds": [
    "enrichi"
   ],
   "consigne": "EN ASSIETTE SANS RESIDU et ENRICHI",
   "archive": false,
   "absences": []
  },
  {
   "id": "BON-04",
   "nom": "THIBAULT",
   "prenom": "Théo",
   "parcId": "bonaguil",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc",
    "sans_produit_mer"
   ],
   "optionIds": [],
   "consigne": "SANS PRODUIT DE LA MER",
   "archive": false,
   "absences": []
  },
  {
   "id": "BON-05",
   "nom": "PERRIN",
   "prenom": "Jade",
   "parcId": "bonaguil",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc",
    "diabetique"
   ],
   "optionIds": [],
   "consigne": "EN ASSIETTE DIABETIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "BON-06",
   "nom": "DUVAL",
   "prenom": "Rémi",
   "parcId": "bonaguil",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "BON-07",
   "nom": "KLEIN",
   "prenom": "Éva",
   "parcId": "bonaguil",
   "textureId": "hache",
   "regimeIds": [],
   "optionIds": [
    "enrichi"
   ],
   "consigne": "ENRICHI",
   "archive": false,
   "absences": []
  },
  {
   "id": "BON-08",
   "nom": "GARNIER",
   "prenom": "Tom",
   "parcId": "bonaguil",
   "textureId": "mixe",
   "regimeIds": [],
   "optionIds": [
    "pots_gourmands",
    "enrichi"
   ],
   "consigne": "ENRICHI",
   "archive": false,
   "absences": []
  },
  {
   "id": "COL-01",
   "nom": "LEBRUN",
   "prenom": "Nina",
   "parcId": "collioure",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "COL-02",
   "nom": "HAMON",
   "prenom": "Paul",
   "parcId": "collioure",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "COL-03",
   "nom": "ÉTIENNE",
   "prenom": "Zoé",
   "parcId": "collioure",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "COL-04",
   "nom": "OLIVIER",
   "prenom": "Max",
   "parcId": "collioure",
   "textureId": "normal",
   "regimeIds": [
    "diabetique"
   ],
   "optionIds": [],
   "consigne": "EN ASSIETTE DIABETIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "COL-05",
   "nom": "LACROIX",
   "prenom": "Louise",
   "parcId": "collioure",
   "textureId": "normal",
   "regimeIds": [
    "diabetique"
   ],
   "optionIds": [],
   "consigne": "EN ASSIETTE DIABETIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "COL-06",
   "nom": "BERTIN",
   "prenom": "Arthur",
   "parcId": "collioure",
   "textureId": "normal",
   "regimeIds": [
    "diabetique"
   ],
   "optionIds": [],
   "consigne": "EN ASSIETTE DIABETIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "COL-07",
   "nom": "FAURE",
   "prenom": "Chloé",
   "parcId": "collioure",
   "textureId": "hache",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "COL-08",
   "nom": "RENAUD",
   "prenom": "Jules",
   "parcId": "collioure",
   "textureId": "hache",
   "regimeIds": [
    "sans_residus"
   ],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "SANS RESIDU / DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "LUD-01",
   "nom": "MEUNIER",
   "prenom": "Manon",
   "parcId": "lude",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "LUD-02",
   "nom": "COLLET",
   "prenom": "Lucas",
   "parcId": "lude",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "LUD-03",
   "nom": "GIRAUD",
   "prenom": "Clara",
   "parcId": "lude",
   "textureId": "hache",
   "regimeIds": [
    "sans_produit_mer"
   ],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "SANS PRODUIT DE LA MER / DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "LUD-04",
   "nom": "BARBIER",
   "prenom": "Nathan",
   "parcId": "lude",
   "textureId": "hache",
   "regimeIds": [],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "MIXE TOUT LE FROID / DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "LUD-05",
   "nom": "LECLERC",
   "prenom": "Lina",
   "parcId": "lude",
   "textureId": "mixe",
   "regimeIds": [],
   "optionIds": [
    "pots_gourmands",
    "enrichi"
   ],
   "consigne": "ENRICHIE",
   "archive": false,
   "absences": []
  },
  {
   "id": "LUD-06",
   "nom": "MOREL",
   "prenom": "Gabriel",
   "parcId": "lude",
   "textureId": "mixe",
   "regimeIds": [],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "LUD-07",
   "nom": "VIDAL",
   "prenom": "Emma",
   "parcId": "lude",
   "textureId": "mixe",
   "regimeIds": [],
   "optionIds": [
    "double_plat",
    "enrichi"
   ],
   "consigne": "ENRICHIE / DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "LUD-08",
   "nom": "ROUSSEL",
   "prenom": "Raphaël",
   "parcId": "lude",
   "textureId": "normal",
   "regimeIds": [
    "diabetique"
   ],
   "optionIds": [],
   "consigne": "EN ASSIETTE DIABETIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-01",
   "nom": "PICARD",
   "prenom": "Anna",
   "parcId": "mirande",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-02",
   "nom": "CHEVALIER",
   "prenom": "Louis",
   "parcId": "mirande",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-03",
   "nom": "BRUNET",
   "prenom": "Sarah",
   "parcId": "mirande",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-04",
   "nom": "SCHMITT",
   "prenom": "Adam",
   "parcId": "mirande",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-05",
   "nom": "GUÉRIN",
   "prenom": "Juliette",
   "parcId": "mirande",
   "textureId": "normal",
   "regimeIds": [
    "diabetique"
   ],
   "optionIds": [],
   "consigne": "EN ASSIETTE DIABETIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-06",
   "nom": "BOYER",
   "prenom": "Victor",
   "parcId": "mirande",
   "textureId": "normal",
   "regimeIds": [
    "diabetique"
   ],
   "optionIds": [],
   "consigne": "EN ASSIETTE DIABETIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-07",
   "nom": "MASSON",
   "prenom": "Margaux",
   "parcId": "mirande",
   "textureId": "hache",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-08",
   "nom": "DUMONT",
   "prenom": "Simon",
   "parcId": "mirande",
   "textureId": "mixe",
   "regimeIds": [
    "sans_produit_mer"
   ],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "SANS PRODUIT DE LA MER / DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "MIR-09",
   "nom": "LEMAIRE",
   "prenom": "Lou",
   "parcId": "mirande",
   "textureId": "normal",
   "regimeIds": [
    "hypo"
   ],
   "optionIds": [],
   "consigne": "PLATEAU - HYPOCALORIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "SUL-01",
   "nom": "CARPENTIER",
   "prenom": "Martin",
   "parcId": "sully",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "SUL-02",
   "nom": "JOLY",
   "prenom": "Elsa",
   "parcId": "sully",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "SUL-03",
   "nom": "GAUTHIER",
   "prenom": "Bastien",
   "parcId": "sully",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [
    "double_legumes_vert"
   ],
   "consigne": "DOUBLE LEGUMES VERT",
   "archive": false,
   "absences": []
  },
  {
   "id": "SUL-04",
   "nom": "RIVIÈRE",
   "prenom": "Agathe",
   "parcId": "sully",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [
    "double_legumes_vert"
   ],
   "consigne": "DOUBLE LEGUMES VERT",
   "archive": false,
   "absences": []
  },
  {
   "id": "SUL-05",
   "nom": "BENOÎT",
   "prenom": "Mathis",
   "parcId": "sully",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "SUL-06",
   "nom": "DESCHAMPS",
   "prenom": "Lucie",
   "parcId": "sully",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [
    "double_plat"
   ],
   "consigne": "DOUBLE PLAT",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-01",
   "nom": "HUBERT",
   "prenom": "Antoine",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "diabetique"
   ],
   "optionIds": [],
   "consigne": "EN ASSIETTE DIABETIQUE",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-02",
   "nom": "MAILLARD",
   "prenom": "Célia",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-03",
   "nom": "COLAS",
   "prenom": "Robin",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-04",
   "nom": "LAMBERT",
   "prenom": "Iris",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-05",
   "nom": "PRÉVOST",
   "prenom": "Félix",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-06",
   "nom": "CHARPENTIER",
   "prenom": "Mila",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-07",
   "nom": "BOUCHER",
   "prenom": "Quentin",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "sans_residus"
   ],
   "optionIds": [],
   "consigne": "SANS RESIDU EN ASSIETTE",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-08",
   "nom": "MARTEL",
   "prenom": "Alice",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-09",
   "nom": "VASSEUR",
   "prenom": "Basile",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-10",
   "nom": "PASCAL",
   "prenom": "Léonie",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-11",
   "nom": "LEROUX",
   "prenom": "Marius",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-12",
   "nom": "BAILLY",
   "prenom": "Capucine",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-13",
   "nom": "GILLET",
   "prenom": "Joseph",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-14",
   "nom": "RENARD",
   "prenom": "Apolline",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [
    "sans_porc"
   ],
   "optionIds": [],
   "consigne": "",
   "archive": false,
   "absences": []
  },
  {
   "id": "ALH-15",
   "nom": "ROCHE",
   "prenom": "Elias",
   "parcId": "alhambra",
   "textureId": "normal",
   "regimeIds": [],
   "optionIds": [
    "pane_pate_riz_frite"
   ],
   "consigne": "EN ASSIETTE POISSON OU VIANDE PANE PATE,RIZ OU FRITE",
   "archive": false,
   "absences": []
  }
 ],
 "presetsActivites": [
  {
   "id": "sport",
   "nom": "Sport",
   "jours": [
    "jeu"
   ],
   "services": [
    "midi"
   ],
   "participantIds": []
  }
 ],
 "semaines": [
  {
   "id": "2026-S42",
   "debut": "2026-10-12",
   "presences": {
    "AMB-08": {
     "lun_midi": 0
    }
   },
   "activites": [],
   "salaries": {
    "amboise": {
     "lun_midi": {
      "standard": 2,
      "sansPorc": 2
     }
    }
   },
   "sodexo": {},
   "direction": {
    "lun_midi": 3,
    "mar_midi": 3,
    "mer_midi": 3,
    "jeu_midi": 3,
    "ven_midi": 3
   },
   "nettoyage": {
    "lun_midi": 5,
    "mar_midi": 5,
    "mer_midi": 5,
    "jeu_midi": 5,
    "ven_midi": 5
   },
   "alertesTraitees": []
  }
 ],
 "etablissement": "MAS La Fontaine"
};
