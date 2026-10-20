# Questions phase 2 (conseil / périmètre)

Pour chaque question : hypothèse par défaut entre parenthèses. Réponse : `R:` sous la question, puis reporter dans `produit.md` / `decisions.md`.

## A. Règles de calcul (feuille cuisine)
1. **Double plat / double portion** : +1 plat chaud seulement (8 entrées, 10 plats, 8 desserts) ? Ou aussi double entrée / dessert pour certains ? (Hyp. : plat seul par défaut, paramétrable par entrée / plat / dessert.)
   R:+1 plat chaud seulement (8 entrées, 10 plats, 8 desserts)
2. **Double légumes vert** : portion de légumes en plus, sans plat supplémentaire. La feuille cuisine doit-elle seulement l'indiquer ou le compter à part ?
   R:portion de légumes en plus , le compter à part en plus sur le document en cours de creation
3. **Haché et mixé** : portions produites séparément du « normal ». Un mixé est-il toujours aussi « sans résidus » ? Le « mixé tout le froid » de Lude est-il une texture à part ?
   R: le haché et le mixé ont le meme grammage mais c'est une portion normal haché et ou mixé. il peut y avoir un normal un haché un mixé avec ou sans residus en terme de regime alimentaire, pour le LUDE le mixé froid est dréssé en assiette à part.
4. **Pots gourmands** : remplacent un plat précis (ex. croissant du petit-déjeuner), donc hors midi/soir ? Ou s'ajoutent au repas ? Que doit voir le chef ?
   R:le pot gourmand est une information, elle doit rester presente mais ne devrait pas figurer dans l'outil de production ainsi, on l'a laisse pour l'instant mais devrait aller autre part. peut etre donner une information de pot gourmand, quantitée sur tel zone de restauration et point final
5. **Enrichi, diabétique, hypocalorique, sans produit de la mer, poisson/viande panée + pâtes/riz/frites** : le chef a-t-il besoin de la quantité seulement ou aussi de la liste nominative (assiette à identifier) ?
   R: il est prevu d'avoir des etiquettes qui identifie certaine personne a qui sont attribués certains repas, chaque personne a ou non un regime ,une contrainte alimentaire ,exception alimentaire, c'est dans MATFER SERVICE que le plat est indiqué , le regime, l'allergie, l'exception , la double portion ,le mxé ,le haché , le sans porc, etc
6. **Sans porc** : alternative servie seulement les jours où le menu contient du porc. L'appli doit-elle le savoir via le menu (`menu 26.xls`) ?
   R:le menu et les "sans porcs" , le manager prevoit et doit prevoir l'alternative ou la substitution, le menu excel ne fera pas partie de cette consultation , mais il faut imaginer pouvoir un jour aller fouiller le menu et prevoir l'alternative au porc, dans l'immediat cela reste complexe car si l'on dit , nous faisons un "sauté Marengo" est ceque cela est du porc de la volaille, du serpent, du poisson, ou du veau, il n'ai pas prevue de fouiller la recette et ces ingredients.  
7. **Autres régimes/options** déjà rencontrés (allergies, texture liquide…) ? Faut-il un champ libre « consigne » par résident ?
   R:chaque informations doit etre administrées afin que chaque personne lui soit attribuée une ou des informations liées a sa condition , exemple zone de repas , mode alimentaire ,regime etc..

## B. Sport du jeudi
8. Le client coche-t-il chaque résident qui va au sport (jour par jour) ou crée-t-il un groupe ? (Hyp. : case « Sport » par résident / jour / service ; l'appli retire automatiquement son repas du parc d'origine.)
   R:en generale le jeudi un groupe de resident va faire du sport avec des encadrants et mangent dans un autre conteneur ,chariot MATFER, donc on la meme quantité de residents mais pour ce jeudi ils sont repartis differement, mais si un resident mange mixé ou haché en generale alors au sport il mange dans le meme mode.
9. Sport seulement le jeudi midi, ou jour/service variables ? Prévoir d'autres « parcs temporaires » (sortie, fête…) ?
   R:jeudi midi
10. Salariés du bloc Sport : qui sont-ils, sont-ils retirés d'un parc ?
    R:oui tout fait, sis ils sont au sport ils ne peuvent etre dans leur zone hebdomadaire, logique

## C. Personnel
11. **Nettoyage (5, sans viande)** : tous les jours, deux services ? Il faut un régime « sans viande » (inexistant aujourd'hui).
    R: sans viande, ils mange Halal , mais nous faison rien en Halal donc c'est des oeufs , du poisson etc.... sans viande animale halal
12. **Direction client (2-3, en semaine)** : midi seulement ? Nombre saisi par le client chaque semaine ?
    R:du lundi au vendredi , le midi
13. **Salariés par parc** : saisis chaque semaine par service (standard / sans porc) ou nombre « habituel » modifiable ?
    R:je reste vigilant , si l'on doit rajouter des residents il est prefereable d'avoir des lignes en plus 5 lignes serait bien

## D. Présence et absences
14. Saisie actuelle jour × midi/soir conservée ? (Hyp. : présent par défaut ; absences par période : début, fin, midi/soir, motif facultatif — hôpital, famille, décès, autre.)
    R:oui on pourrait, mais il faut pas faire une usine a gaz, le client nous informe pour la semaine , c'est deja pas mal
15. **Retour d'hôpital avec changement de régime** sur une période : régimes datés (« mixé du X au Y ») ? C'est bien le cas d'usage ?
    R:oui on pourrait, mais il faut pas faire une usine a gaz, le client nous informe pour son mode alimentaire de la semaine , c'est deja pas mal
16. **Alertes d'incohérence** souhaitées ? Ex. : présent alors qu'absent déclaré ; résident revenu sans nouveau régime ; effectif très différent de la semaine précédente ; menu avec porc mais aucun sans porc.
    R:il faut ue cela soit pertinent pour le manager par pour le cuisinier en production, si cela arrive jusqu'a la cuisine alors cela veut dire que le manager n'a pas fait attention.

## E. Fonctionnement et poste
17. **Qui fait quoi** : client édite, toi consultes et imprimes, ou les deux éditent ? Un seul poste client ou plusieurs ?
    R:client édite, toi consultes et imprimes en A4 Paysage
18. **Système** : Windows partout ? Pas de droits d'installation côté client ? Un fichier HTML à ouvrir par double-clic (sans serveur) est-il envisageable ?
    R:peut on sauvegarder en json et importer le fichier.json 
19. **Impression** : A4 portrait ? Une feuille par service (jour + midi/soir) ou semaine entière ?
    R:par jour en a4 paysage , 1 midi une soir pour le diner quoi
20. **Semaine** : même semaine modifiable plusieurs fois (version 2, mise à jour du mardi) ? Copie des semaines précédentes pour comparer ?
    R:non on compare pas

## F. Données et divers
21. **Âge, sexe, prénom/nom** : réellement saisis et utiles ? Gérer aussi chambre ou n° de résident ?
    R: nom prenom uniquement
22. **Archives** : quelles infos garder pour un résident archivé, combien de temps (RGPD) ?
    R:non pas d'archives
23. **Confidentialité** : fichier JSON chiffré / mot de passe (données de santé) ? Mention RGPD ?
    R:le plus simple possible 
24. **Menu 26.xls** : à quoi sert-il (commande fournisseur, plan de production, lien avec les effectifs) ? À intégrer plus tard ?
    R:le menu est une extraction du logiciel SOL de Sodexo, l'extraction permet d'avoir differente informations sur le menu et les quantités prévues, pour notre cas si le manager prevoir du porc alors il faut aussi prevoir du sans porc et du sans viandes tous les jours pour les Halal et et aussi "sans produits de la mer"
25. **Nom du projet** ? Et « épade » = EHPAD ?
    R: RECEUIL ALIMENTAION MAS La Fontaine
26. **Priorité** : une seule livraison en premier — feuille cuisine, feuille chariot, ou gestion des résidents côté client ?
    R:feuille cuisine "outil de production" feuille chariot, afin de savoir par chariot de zone ce que ce trouve dans chaque conteneur la declinaison de la prestation
