---
title: "nem, ou comment j'ai arrêté de debugger l'environnement des autres"
description: "Le coût d'un environnement NSO qui dérive ne se paie pas en machines, mais en heures de dev passées à diagnostiquer celui du voisin. Retour d'expérience sur l'outil qui a supprimé ce poste de dépense."
pubDate: 2026-09-03
lang: "fr"
translationKey: "nem-nso-environment-manager"
tags: ["nso", "automatisation", "python", "asyncio", "gitlab-ci"]
draft: true
---

> Brouillon — notes de travail, pas encore un article. Matière rassemblée le
> 2026-09-03, à mettre en forme.

## L'angle de l'article

Le fil à tenir du début à la fin : le problème n'était pas de monter *mon*
environnement, c'était le temps que je passais à debugger **celui des autres**.
Un environnement qui dérive ne coûte pas une machine, il coûte des heures de
dev — et en priorité les heures de celui vers qui on se tourne quand ça ne
marche plus. Chaque fonctionnalité décrite ci-dessous se justifie par ça :
rendre le diagnostic inutile plutôt que rapide.

## Le contexte

Chez nous, un package NSO = un repo GitLab. Plus de 170 packages en production.

## 1. L'usage premier : la CI/CD

- `nem` monte un environnement NSO complet nécessaire au package, à partir d'un
  YAML — ou, en CI, à partir des variables GitLab CI et des variables prédéfinies.
- Dans le même job, un moteur de test (écrit à la main) vérifie la non-régression
  et déroule un scénario de test. Un scénario = un YAML = un job, via
  `parallel`/`matrix`.

## 2. La performance : remplacer le résolveur de dépendances

L'état antérieur : un playbook Ansible entièrement séquentiel, et le moteur de
résolution de dépendances de packages fourni par Cisco NSO — séquentiel lui aussi.

Ce que j'ai fait : un moteur de résolution de dépendances inspiré de l'officiel,
mais bâti sur asyncio.

**Résultat : temps d'exécution des jobs CI de test réduit de 35 % en moyenne,
jusqu'à 50 % dans certains cas.**

→ *À développer : pourquoi la résolution de dépendances se parallélise bien,
et où sont les vraies barrières de synchronisation.*

## 3. Le suivi d'environnement (`nem status`)

Le problème : un dev qui travaille sur un seul package a quand même tout un
environnement autour (les dépendances). Avant, certains gardaient le même
environnement deux mois — et devaient parfois refaire un développement complet
parce que des dépendances n'étaient plus à jour.

`nem status` liste chaque package avec sa branche et son commit hash, et fait
surtout un `git ls-remote` pour en déduire un état :

- `pinned` — c'est un tag
- `up-to-date` — branche suivie, à jour avec le serveur
- `behind remote` — en retard sur le remote pour la même branche
- `modified` — modifié localement, pas encore commité
- `ahead n commit(s)` — commité mais pas poussé

Et pour agir dessus :

- `nem pull` — récupère automatiquement les packages `behind remote`
- `nem sync` — `pull` + `build` (recompilation du YANG) + `reload` (package
  reload côté NSO), en une commande

## 4. Les devcontainers (`nem dc`)

Un projet = un devcontainer. `nem dc list`, `nem dc create`, `nem dc delete`.

Le point important : le container est construit **à partir de la même image que
la CI**. Une fois créé, `nem` est présent dedans et un `nem up` part du YAML pour
monter l'environnement.

C'est ce qui rend la parité dev/CI réelle plutôt que déclarative — et donc ce qui
tue la classe de bugs « ça passe en local, ça casse en pipeline », l'autre moitié
du « ça marche chez moi ».

→ *À développer : la différence entre reproduire un environnement et partager
la même définition d'environnement.*

## 5. Le lock, inspiré de uv.lock

`nem lock` écrit le commit hash exact de chaque package local. `nem lock --compare`
compare deux environnements.

C'est la réponse directe au « ça marche chez moi, pas chez toi » : on voit
immédiatement quel package diverge.

## 6. Reproduire un environnement depuis une merge request

Chaque MR porte automatiquement dans sa description :

```
Pour reproduire cet environnement, utilisez
nem init --from-mr <nom-projet> <mr-iid>
```

Une commande, et n'importe qui reproduit l'environnement de la branche source.
Gain réel pour les relecteurs.

Également : `nem import` / `nem export` pour transporter un environnement complet
(sans la CDB, uniquement les packages).

## Adoption

- 50+ personnes indirectement, via la CI/CD
- environ 15 à 30 développeurs en usage direct (adoption en cours)

## Angles restants à trancher

- Ce qui a été construit avec assistance IA (Copilot, moteur Claude Opus) et ce
  qui a été écrit à la main (le moteur de test). Lien possible vers
  « L'IA ne m'a pas rendu plus rapide ».
- Ce que ça dit de la dépendance à l'outillage d'un vendeur : quand est-il
  légitime de réécrire une brique fournie par Cisco ?
- Version anglaise à faire (`translationKey` déjà posé).
