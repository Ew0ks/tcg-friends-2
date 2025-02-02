# TCG Xprcht

Un jeu de cartes à collectionner (TCG) développé avec Next.js, Prisma et PostgreSQL.

## Guide d'installation

### Prérequis

1. **Node.js et npm**
   - Installer Node.js (v18 ou supérieure) via [le site officiel](https://nodejs.org/)
   - Ou utiliser nvm (recommandé) :
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
     nvm install 18
     nvm use 18
     ```

2. **PostgreSQL**
   ```bash
   # Pour macOS
   brew install postgresql@14
   brew services start postgresql@14

   # Pour Linux (Ubuntu/Debian)
   sudo apt update
   sudo apt install postgresql-14
   sudo systemctl start postgresql
   ```

3. **Configurer Cloudinary**
   - Créer un compte sur [Cloudinary](https://cloudinary.com/users/register/free)
   - Dans le dashboard, récupérer :
     - Cloud Name
     - API Key
     - API Secret
   - Ces informations seront nécessaires pour le fichier `.env`

### Configuration du projet

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/tcg-friends-2.git
   cd tcg-friends-2
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   Modifier le fichier `.env` avec vos paramètres :
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/tcg_xprcht"
   NEXTAUTH_SECRET="votre-secret-ici"
   NEXTAUTH_URL="http://localhost:3000"
   CLOUDINARY_CLOUD_NAME="votre-cloud-name"
   CLOUDINARY_API_KEY="votre-api-key"
   CLOUDINARY_API_SECRET="votre-api-secret"
   ```

4. **Créer la base de données**
   ```bash
   # Se connecter à PostgreSQL
   psql postgres

   # Créer la base de données
   CREATE DATABASE tcg_xprcht;
   CREATE USER your_username WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE tcg_xprcht TO your_username;
   \q
   ```

5. **Installer les dépendances**
   ```bash
   npm install
   ```

6. **Initialiser la base de données**
   ```bash
   # Appliquer les migrations Prisma
   npx prisma migrate dev

   # Générer le client Prisma
   npx prisma generate

   # Seed la base de données (données initiales)
   npx prisma db seed
   ```

### Lancer l'application

1. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

2. **Accéder à l'application**
   - Ouvrir http://localhost:3000 dans votre navigateur

### Structure des boosters

- **Booster Standard (100 crédits)**
  - 4 cartes dont au moins une peu commune
  - Chances de drop normales

- **Booster Rare (170 crédits)**
  - 4 cartes dont au moins une rare
  - Chances de drop normales

- **Booster Épique (300 crédits)**
  - 4 cartes avec :
    - 45% chance d'avoir une carte normale (COMMON à RARE)
    - 50% chance d'avoir une carte épique
    - 5% chance d'avoir une carte légendaire

- **Booster Maxi (500 crédits)**
  - 6 cartes dont au moins une rare
  - 30% de chance pour les cartes supplémentaires d'être peu communes

### Raretés des cartes

- **Commune** (60% de chance)
- **Peu Commune** (25% de chance)
- **Rare** (10% de chance)
- **Épique** (4% de chance)
- **Légendaire** (1% de chance)

Chaque carte a 5% de chance d'être en version Shiny.

### Fonctionnalités

- Système d'authentification
- Collection de cartes personnelle
- Ouverture de boosters
- Système de crédits
- Échange de cartes entre joueurs
- Statistiques de collection
- Interface d'administration
- Système de boost temporaire des drop rates

### Commandes utiles

```bash
# Lancer les tests
npm test

# Vérifier le linting
npm run lint

# Construire l'application
npm run build

# Démarrer en production
npm start

# Réinitialiser la base de données
npx prisma migrate reset
```

### Résolution des problèmes courants

1. **Erreur de connexion à la base de données**
   - Vérifier que PostgreSQL est bien démarré
   - Vérifier les informations de connexion dans le fichier `.env`
   - Vérifier les droits de l'utilisateur PostgreSQL

2. **Erreur de migration Prisma**
   ```bash
   # Réinitialiser la base de données
   npx prisma migrate reset
   
   # Regénérer le client Prisma
   npx prisma generate
   ```

3. **Port 3000 déjà utilisé**
   ```bash
   # Trouver le processus utilisant le port
   lsof -i :3000
   
   # Tuer le processus
   kill -9 PID
   ```
