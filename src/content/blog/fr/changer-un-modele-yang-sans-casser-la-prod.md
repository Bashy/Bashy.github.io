---
title: "Changer un modèle YANG sans casser ce qui tourne déjà"
description: "Un test de configuration vert ne dit rien de la compatibilité ascendante d'un modèle YANG. Comment nous rejouons un service déployé en n-1 sous la version n, et pourquoi il a fallu écrire le framework de test nous-mêmes."
pubDate: 2026-09-03
lang: "fr"
translationKey: "yang-backward-compatibility"
tags: ["nso", "yang", "tests", "ci", "automatisation"]
draft: true
---

> Brouillon — notes de travail, pas encore un article. Matière rassemblée le
> 2026-09-03, à mettre en forme.

## Le problème

Un modèle YANG évolue. Le service que vous venez d'écrire se déploie très bien
en version n — sur un environnement neuf, avec des données neuves.

Mais en production, il existe déjà des instances de ce service, créées sous la
version n-1. La question qui compte n'est donc pas « est-ce que mon service se
déploie ? », c'est **« est-ce que ce qui tourne déjà survit à ma modification
de modèle ? »**

Le piège est qu'un modèle YANG cassé **ne se voit pas au déploiement**. Les
nouvelles instances de service se déploient parfaitement ; ce sont les instances
**déjà en production** qui ne sont plus redéployables. Rien n'échoue au moment
où vous introduisez la régression : vous vous en apercevez le jour où il faut
retoucher un service existant, et vous êtes bloqué.

Un test de configuration ne peut pas attraper ça — non pas qu'il soit inutile,
il montre précisément quelle configuration change, ce qui a sa valeur. Mais il
compare une configuration attendue à une configuration produite, toutes deux
calculées avec le modèle courant. La rupture, elle, est en amont : dans le
modèle, et sur des instances qu'il ne rejoue pas.

Et c'est bien là que ça fait mal, parce que **c'est exactement la raison d'être
de NSO** : gérer le cycle de vie de services réseau. Pousser une configuration
une bonne fois, Ansible le fait déjà très bien. Ce qu'on achète avec NSO, c'est
la capacité à revenir sur un service existant — précisément ce qu'une rupture
YANG détruit.

→ *À développer : donner un exemple concret de changement YANG anodin en
apparence qui casse des instances existantes (renommage de leaf, changement de
cardinalité, contrainte ajoutée…).*

## Ce que faisait l'outillage précédent, et pourquoi ça ne suffisait pas

L'approche PyATS en place reposait sur deux dossiers, `payloads/` et
`expected/`, chacun contenant un fichier XML. Le payload était chargé via le CLI
NSO (`load merge`), puis un commit dry-run comparait le résultat au fichier
`expected`.

Deux limites :

- **Ça ne teste que des services.** Les actions NSO sont hors de portée.
- **Ça ne teste qu'un instant.** On vérifie qu'un payload produit la bonne
  configuration ici et maintenant, jamais qu'une instance antérieure survit à
  une montée de version.

## Rejouer n-1 sous n

Le cas qui m'intéresse le plus se décrit en trois temps, exprimés comme des
tâches du scénario :

1. **checkout** — on récupère la version n-1 du package
2. déploiement d'un service avec cette version
3. **recompile** puis **package reload** en version n
4. **redeploy** de l'instance de service créée à l'étape 2

L'assertion est à l'étape 4, pas à l'étape 3 : le package peut se recharger sans
broncher, c'est le *redeploy* du service existant qui révèle la rupture. S'il
échoue, la modification de modèle est incompatible — et on l'apprend en CI, pas
le jour où il faut retoucher ce service en production.

C'est de la compatibilité ascendante **au niveau YANG**, pas au niveau de la
configuration.

## L'anatomie d'un scénario

Un scénario est un fichier YAML, décrivant une suite de tâches typées :

- **config / restconf** — chemin ou URL libre, payload libre
- **builtins** — `checkout`, `recompile`, `pkg reload`

Tout passe par l'API RESTCONF de NSO, pas par le CLI. Plus fiable, et surtout
cela rend les **actions** NSO testables au même titre que les services.

→ *À développer : pourquoi RESTCONF plutôt que le CLI — fiabilité du parsing,
codes de retour exploitables, pas de dépendance à la mise en forme.*

## Pourquoi in-house plutôt qu'un outil du marché

C'est la question qu'on m'a posée, et la réponse n'est pas « parce que c'est
plus amusant ».

Aucun framework tiers ne savait lire le corpus de tests existant. En le
construisant nous-mêmes, on a pu ajouter un **mode legacy** qui interprète les
anciennes paires `payloads/` + `expected/` : aucun test existant n'a eu besoin
d'être réécrit pour migrer.

Le coût de migration d'un remplacement est souvent ce qui décide de son
adoption, bien plus que ses qualités propres.

→ *À développer : le lien avec les deux autres remplacements (Flask → FastAPI
sur le ZTP, le résolveur de dépendances Cisco → asyncio). À chaque fois, la
contrainte n'était pas de faire mieux, mais de faire mieux sans rien casser
pour les utilisateurs en place.*

## L'exécution en CI

Un scénario = un fichier YAML = un job GitLab CI, lancés en `parallel`/`matrix`,
chacun contre un environnement NSO fraîchement monté par
[nem](/blog/fr/nem-gestionnaire-environnements-nso/).

Contexte d'échelle : plus de 170 packages NSO en production, un package = un
projet GitLab.

## Angles restants à trancher

- L'exemple concret de rupture YANG — c'est ce qui rendra l'article utile à
  quelqu'un qui cherche ce problème sur un moteur de recherche.
- Ce que NSO fournit nativement en matière de gestion d'upgrade de modèle, et
  où sont ses limites (à vérifier avant publication, ne pas affirmer de travers).
- Version anglaise à faire (`translationKey` déjà posé).
