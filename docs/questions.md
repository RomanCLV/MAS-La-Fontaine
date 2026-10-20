# Questions phase 2 (conseil / périmètre)

Pour chaque question : hypothèse par défaut entre parenthèses. Réponse : `R:` sous la question, puis reporter dans `produit.md` / `decisions.md`.

## A. Règles de calcul (feuille cuisine)
1. **Double plat / double portion** : +1 plat chaud seulement (8 entrées, 10 plats, 8 desserts) ? Ou aussi double entrée / dessert pour certains ? (Hyp. : plat seul par défaut, paramétrable par entrée / plat / dessert.)
   R:
2. **Double légumes vert** : portion de légumes en plus, sans plat supplémentaire. La feuille cuisine doit-elle seulement l'indiquer ou le compter à part ?
   R:
3. **Haché et mixé** : portions produites séparément du « normal ». Un mixé est-il toujours aussi « sans résidus » ? Le « mixé tout le froid » de Lude est-il une texture à part ?
   R:
4. **Pots gourmands** : remplacent un plat précis (ex. croissant du petit-déjeuner), donc hors midi/soir ? Ou s'ajoutent au repas ? Que doit voir le chef ?
   R:
5. **Enrichi, diabétique, hypocalorique, sans produit de la mer, poisson/viande panée + pâtes/riz/frites** : le chef a-t-il besoin de la quantité seulement ou aussi de la liste nominative (assiette à identifier) ?
   R:
6. **Sans porc** : alternative servie seulement les jours où le menu contient du porc. L'appli doit-elle le savoir via le menu (`menu 26.xls`) ?
   R:
7. **Autres régimes/options** déjà rencontrés (allergies, texture liquide…) ? Faut-il un champ libre « consigne » par résident ?
   R:

## B. Sport du jeudi
8. Le client coche-t-il chaque résident qui va au sport (jour par jour) ou crée-t-il un groupe ? (Hyp. : case « Sport » par résident / jour / service ; l'appli retire automatiquement son repas du parc d'origine.)
   R:
9. Sport seulement le jeudi midi, ou jour/service variables ? Prévoir d'autres « parcs temporaires » (sortie, fête…) ?
   R:
10. Salariés du bloc Sport : qui sont-ils, sont-ils retirés d'un parc ?
    R:

## C. Personnel
11. **Nettoyage (5, sans viande)** : tous les jours, deux services ? Il faut un régime « sans viande » (inexistant aujourd'hui).
    R:
12. **Direction client (2-3, en semaine)** : midi seulement ? Nombre saisi par le client chaque semaine ?
    R:
13. **Salariés par parc** : saisis chaque semaine par service (standard / sans porc) ou nombre « habituel » modifiable ?
    R:

## D. Présence et absences
14. Saisie actuelle jour × midi/soir conservée ? (Hyp. : présent par défaut ; absences par période : début, fin, midi/soir, motif facultatif — hôpital, famille, décès, autre.)
    R:
15. **Retour d'hôpital avec changement de régime** sur une période : régimes datés (« mixé du X au Y ») ? C'est bien le cas d'usage ?
    R:
16. **Alertes d'incohérence** souhaitées ? Ex. : présent alors qu'absent déclaré ; résident revenu sans nouveau régime ; effectif très différent de la semaine précédente ; menu avec porc mais aucun sans porc.
    R:

## E. Fonctionnement et poste
17. **Qui fait quoi** : client édite, toi consultes et imprimes, ou les deux éditent ? Un seul poste client ou plusieurs ?
    R:
18. **Système** : Windows partout ? Pas de droits d'installation côté client ? Un fichier HTML à ouvrir par double-clic (sans serveur) est-il envisageable ?
    R:
19. **Impression** : A4 portrait ? Une feuille par service (jour + midi/soir) ou semaine entière ?
    R:
20. **Semaine** : même semaine modifiable plusieurs fois (version 2, mise à jour du mardi) ? Copie des semaines précédentes pour comparer ?
    R:

## F. Données et divers
21. **Âge, sexe, prénom/nom** : réellement saisis et utiles ? Gérer aussi chambre ou n° de résident ?
    R:
22. **Archives** : quelles infos garder pour un résident archivé, combien de temps (RGPD) ?
    R:
23. **Confidentialité** : fichier JSON chiffré / mot de passe (données de santé) ? Mention RGPD ?
    R:
24. **Menu 26.xls** : à quoi sert-il (commande fournisseur, plan de production, lien avec les effectifs) ? À intégrer plus tard ?
    R:
25. **Nom du projet** ? Et « épade » = EHPAD ?
    R:
26. **Priorité** : une seule livraison en premier — feuille cuisine, feuille chariot, ou gestion des résidents côté client ?
    R:
