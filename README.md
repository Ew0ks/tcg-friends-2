# TCG Friends

Un jeu de cartes à collectionner (Trading Card Game) développé avec Next.js, Prisma et PostgreSQL.

## Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)
- npm ou yarn

## Installation

1. **Cloner le projet**
```bash
git clone https://github.com/votre-username/tcg-friends-2.git
cd tcg-friends-2
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de PostgreSQL**

- Démarrer PostgreSQL :
```bash
brew services start postgresql@14
```

- Créer l'utilisateur PostgreSQL et lui donner les droits :
```bash
createuser postgres --createdb --superuser
psql postgres -c "ALTER USER postgres WITH PASSWORD 'admin';"
```

4. **Configuration de la base de données**

- Créer un fichier `.env` à la racine du projet :
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/tcg-friends-2?schema=public"
JWT_SECRET="votre-secret-jwt"
```

- Créer la base de données :
```bash
createdb tcg-friends-2
```

5. **Initialiser la base de données**
```bash
npx prisma generate
npx prisma db push
```

6. **Initialiser les données de test**
```bash
npm run prisma:seed
```

Cela va créer :
- Un utilisateur admin (username: admin, password: admin)
- Un utilisateur test (username: test, password: test)
- Les configurations de boosters
- Quelques cartes de test

## Développement

1. **Démarrer le serveur de développement**
```bash
npm run dev
```

2. **Accéder à l'application**
- Frontend : [http://localhost:3000](http://localhost:3000)
- Prisma Studio : [http://localhost:5555](http://localhost:5555) (après avoir exécuté `npx prisma studio`)

## Structure du projet

```
├── app/                  # Pages et routes Next.js
├── prisma/              # Configuration Prisma et schéma de base de données
├── public/              # Fichiers statiques
└── src/
    ├── components/      # Composants React réutilisables
    ├── context/         # Contextes React (Auth, etc.)
    └── styles/          # Fichiers CSS et styles
```

## Fonctionnalités

- Système d'authentification
- Gestion des utilisateurs (rôles USER et ADMIN)
- Système de boosters avec différentes raretés
- Collection de cartes
- Cartes Shiny
- Système de crédits

## Commandes utiles

- **Lancer Prisma Studio** :
```bash
npx prisma studio
```

- **Mettre à jour le schéma de la base de données** :
```bash
npx prisma db push
```

- **Réinitialiser la base de données** :
```bash
npx prisma db push --force-reset
```

## En cas de problème

1. **La base de données ne démarre pas**
```bash
brew services restart postgresql@14
```

2. **Erreurs de Prisma**
```bash
npx prisma generate
```

3. **Réinitialiser complètement la base de données**
```bash
brew services restart postgresql@14
dropdb tcg-friends-2
createdb tcg-friends-2
npx prisma db push
```
