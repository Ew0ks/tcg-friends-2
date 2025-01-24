# Devlog de l'application TCG Light

## Objectif du projet
Créer une application Next.js en TypeScript qui permet aux utilisateurs d'ouvrir des boosters et de collectionner des cartes de quatre types de rareté, dont certaines sont shiny. Il n'y aura pas de fonctionnalité de jeu pour le moment.

## Technologies utilisées
- **Next.js** : Framework React pour le développement de l'application.
- **TypeScript** : Pour le typage statique et une meilleure maintenabilité du code.
- **Devbox** : Environnement de développement pour gérer les dépendances et les configurations.
- **Prisma** : ORM pour interagir avec la base de données.
- **Prisma Studio** : Interface graphique pour gérer les données de la base de données.
- **Postgres** : Système de gestion de base de données relationnelle pour le backend.

## Structure de l'application
- **Pages** : 
  - Page d'accueil pour présenter l'application.
  - Page de collection pour afficher les cartes collectées par l'utilisateur.
  - Page d'ouverture de boosters.

- **API Routes** : 
  - Actions Next pour gérer les requêtes au backend.
  - Endpoints pour ouvrir des boosters et récupérer les cartes.

## Modèle de base de données
- **Cartes** : 
  - ID
  - Nom
  - Type de rareté (commune, peu commune, rare, ultra rare)
  - Statut shiny (booléen)
  - Description (texte)
  - Quote (texte, facultatif)
  - Puissance (nombre) : Indique la rareté de la carte
  
- **Utilisateurs** : 
  - ID
  - Nom d'utilisateur
  - Mot de passe (hashé)
  - Cartes collectées (objet) : 
    - ID de la carte
    - Quantité (nombre) : Indique combien de fois l'utilisateur possède cette carte

## Système de login
- Implémenter un système d'authentification pour les utilisateurs.
- Les utilisateurs devront s'inscrire avec un nom d'utilisateur et un mot de passe.
- Les mots de passe seront stockés de manière sécurisée (hashés).
- Prévoir des fonctionnalités de connexion et de déconnexion.

## Étapes de développement
1. **Configuration de l'environnement** :
   - Installer Devbox et configurer le projet Next.js avec TypeScript.
   - Configurer Prisma avec Postgres.

2. **Modélisation de la base de données** :
   - Créer les modèles pour les cartes et les utilisateurs dans Prisma.

3. **Développement des pages** :
   - Créer la page d'accueil et la page de collection.
   - Implémenter la logique pour ouvrir des boosters.

4. **Mise en place des API Routes** :
   - Créer des endpoints pour gérer les actions d'ouverture de boosters et de récupération des cartes.

5. **Tests et débogage** :
   - Tester les fonctionnalités de l'application et corriger les bugs éventuels.

## Notes
- Garder à l'esprit que l'application est une version light et que des fonctionnalités supplémentaires peuvent être ajoutées ultérieurement.
- Documenter chaque étape du développement pour faciliter la maintenance et les mises à jour futures.

## Dépendances
- Devbox
- Next.js
- TypeScript
- Prisma
- Postgres
- Tailwind CSS
- Shadcn/UI