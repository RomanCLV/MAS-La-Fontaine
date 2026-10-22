# Fiche produit — "Recueil Alimentation MAS La Fontaine" (nom provisoire)

Sources : `reponses.md` (réponses utilisateur), `analyse.md`. Version : brouillon v1, 2026-10-19.

## Objectif
Remplacer la chaîne Excel fragile (Effectif MCH → SEMAINE2 → RECAP → MATFER) par une appli locale qui :
1. permet au **client** (la MAS) de saisir/ajuster résidents, régimes et présences sans changer ses habitudes ;
2. produit, pour le prestataire, la **feuille cuisine** (outil de production) et la **feuille chariot** (contenu de chaque chariot/conteneur par zone) imprimables ;
3. réduit erreurs, gaspillage et plats facturés pour rien.

## Utilisateurs
- **Client (MAS)** : édite la fiche de la semaine. Affichage proche de la feuille actuelle, zéro apprentissage. Poste unique.
- **Prestataire (l'utilisateur / manager)** : ouvre le fichier, contrôle les alertes, imprime. Seul destinataire des alertes.
- **Chef** : ne lit que le papier A4 paysage. Aucune alerte ne doit "arriver en cuisine".

## Périmètre V1 (priorité 1 : feuilles imprimables)
### 1. Référentiels (administrés, avec couleur)
- **Parcs** : nom + couleur. Aujourd'hui 7 (Amboise, Bonaguil, Collioure, Lude, Mirande, Sully, Alhambra). Le Sport n'est **pas** un parc (voir Activités).
- **Régimes / textures / options** : liste éditable (ajout/retrait sans toucher à rien d'autre), nom + couleur + nature :
  - *Régime* (contrainte) : sans porc, sans résidus, diabétique, hypocalorique, sans produit de la mer, sans viande (halal : œufs/poisson, pas de viande).
  - *Texture* : normal, haché, mixé (même grammage ; un mixé/haché peut aussi être sans résidus).
  - *Option* : double plat (+1 plat chaud seulement), double légumes vert (compté à part), enrichi, poisson/viande panée + pâtes/riz/frites, pots gourmands (information seulement, voir plus bas).
  - Chaque option précise ce qu'elle affecte (ex. double plat → plat uniquement).
  - Page Régimes : une phrase sous chaque tableau rappelle la différence (texture = consistance, une seule ; régime = contrainte impérative ; option = ajout/changement sur l'assiette). La nature est fixée à la création (plus de passage régime ↔ option).
- Le **Lude** : "mixé tout le froid" = assiette dressée à part (mention d'affichage, pas une texture à part).

### 2. Résidents
- Nom, prénom (**uniquement**), parc, texture, régimes, options, consigne libre éventuelle.
- Présent par défaut ; **absences par période** (début, fin, services cochés : petit déjeuner / midi / soir) — simple, "pas d'usine à gaz". Changement de régime sur une semaine : saisi pour la semaine (pas de gestion de dates complexe en V1).
- Actions sur la liste des résidents (au survol de la ligne) : éditer, archiver, supprimer. Page « Résidents » au style de l'onglet TYPOLOGIE CONVIVES de l'Excel, avec bouton « Ajouter un résident » (v2 : l'archivage remplace « pas d'archives »).
- Pas de lignes libres supplémentaires : on ajoute un résident via la page Résidents.
- ~5 lignes libres supplémentaires par parc pour ajouter des résidents.

### 3. Convives hors résidents
- **Salariés par parc** : standard / sans porc, par jour et service. Total parc = résidents (doubles plats inclus, ex. 8 résidents → volume 10) + salariés.
- **Équipe Sodexo (cuisiniers)** : équipe globale en plus des parcs, hors parcs, par jour et service.
- **Direction client** (2-3, lundi-vendredi, midi uniquement) : indépendante des parcs, ajout au total.
- **Nettoyage** : deux lignes, standard et sans viande (halal) ; hors parcs (zone à confirmer).
- **Plats témoins** : nombre par service donné par le client ; plats en plus (texture normale), ajoutés au total à produire (colonne TÉMOINS de la feuille cuisine).
- Ces lignes (Direction, Salariés Sodexo, Nettoyage) sont aussi saisies dans l'écran de saisie client, pour savoir qui est là chaque jour.

### 4. Activités (ex-« Sport »)
- Une **activité** est un évènement ajouté à une semaine : nom, jour, service impacté, participants (résidents uniquement pour l'instant). Ce n'est pas un parc ni une fiche à remplir.
- Le **repas/la portion ne change pas** : le client laisse la présence à 1. Seul l'emplacement change : les participants sont retirés de leur parc et regroupés dans une colonne d'activité (chariot distinct) sur la feuille cuisine et les chariots. Colonne affichée uniquement les jours où une activité existe.
- Pas de double saisie : un résident coché « 1 » le jeudi midi et participant au Sport n'est compté qu'une fois (dans l'activité).
- **Presets** d'activité : enregistrent jour(s), service et liste de participants ; rechargés à l'ajout d'une activité sur une semaine, puis éditables.
- Exemple actuel : Sport du jeudi midi.
- Choix des participants : recherche par nom et case « Cacher les absents » (du jour et service de l'activité), pour s'y retrouver avec beaucoup de résidents.

### 5. Sorties imprimables (A4 paysage, 1 feuille par jour × service : petit déjeuner / midi / soir)
- **Petit déjeuner** : présences seulement (pas de textures, régimes ni options) ; feuille cuisine et feuilles chariot simplifiées (nombres par parc).
- **Feuille cuisine (outil de production, variante A validée)** : tableau en zones : **Parcs** (+ colonne Activité si elle existe ce jour-là) avec leur total ; **Équipe Sodexo** ; **Direction** ; **Nettoyage** ; puis **TOTAL À PRODUIRE** mis en avant. Lignes : repas (résidents, doubles plats en plus, salariés std / sans porc), textures, régimes, options. Un seul total par colonne (plus de « plats chauds avec doubles » séparé : les doubles sont dans le total). Le volume total est suivi de la ventilation (« sur 120 plats : 5 sans produit de la mer, 15 sans viande, 15 sans porc… », régimes comptés sur tous les convives). Lignes **Haché** et **Mixé** très visibles, avec leur couleur de référentiel.
- **Feuille chariot (variante A validée)** : par parc : header (parc, jour, service, volume) + collectif (bacs) + étiquettes en bandeau. Un chariot contient les plats résidents **et** salariés : chaque étiquette indique **Résident** ou **Salarié** (pas le nom du parc, déjà en header). **Texture** = élément le plus visible (bandeau coloré) ; régimes en pastilles colorées.

### 5 bis. Interface (layout global)
- Application à **onglets** (façon IDE) : onglets ouverts en haut, accès aux pages par le menu « Pages » (aussi ouvert par le bouton **« + »** au bout des onglets) ; « Fermés récemment » n’y liste que les pages hors menu (fiches résidents, Imprimer), plusieurs fiches ouvertes en même temps. Les onglets ouverts sont **restaurés** à la réouverture de l'app.
- Pages distinctes, dans cet ordre du menu Pages : **Semaine**, **Parcs**, **Régimes**, **Résidents**, **Activités** | **Fichier : Importer**, **Fichier : Exporter** | **Options** (séparateurs entre les groupes). Imprimer s'ouvre depuis la page Semaine (« Imprimer cette semaine »).
- Saisie semaine : filtre « Services affichés » (petit déjeuner / midi / soir) pour masquer des colonnes ; les données restent. Alertes **au-dessus** de la grille (pas sur le côté, pour garder la largeur) ; régimes en **lecture seule** dans la grille ; au survol d'une ligne, bouton stylo qui ouvre la fiche du résident dans un **nouvel onglet** (pas de changement de page).

### 6. Fichier et sauvegarde
- Échange par **fichier JSON** (client exporte, prestataire importe). Pas de serveur.
- Export avec nom suggéré (n° de semaine, dates). Sauvegarde automatique interne pendant l'édition.
- Ouverture : dernier fichier mémorisé ; lecture seule par défaut ; bouton **Éditer** crée une copie avant modification.
- Sécurité : "le plus simple possible" (pas de chiffrement en V1).

### 7. Alertes (à l’écran, jamais sur les impressions)
- Uniquement sur les présences/absences : présent alors qu'absent (fiche), aucune présence sans absence enregistrée. Pas d'alerte de régime (texture unique, régimes non éditables dans la saisie).
- Chaque alerte peut être « C'est voulu » ou « Ignorée » : elle disparaît (réaffichage possible). Pertinence avant quantité.
- Toujours affichées sur la page Semaine (le « Mode manager » a été retiré le 2026-10-22). Derniers onglets ouverts : mémorisés dans le navigateur.

## Hors périmètre V1 (plus tard)
- Lecture du menu (`menu 26.xls`, extrait du logiciel SOL de Sodexo) : règle métier future = si porc au menu, prévoir sans porc ; **tous les jours** prévoir sans viande (halal) et sans produit de la mer. Pas d'analyse des recettes/ingrédients (ex. "sauté Marengo" ambigu).
- Pots gourmands : information (quantité par zone), **pas dans l'outil de production** ; emplacement à définir (note séparée / encart).
- Comparaison entre semaines, archives, âge/sexe, chambre, chiffrement.

## Contraintes
Gratuit uniquement ; pas de serveur ; Windows (à confirmer) ; fichier JSON ; impression A4 paysage ; interface proche de l'Excel actuel.

## Points à trancher (voir `etat.md`)
Détail des questions de suivi en bas de `decisions.md` / `etat.md`.
