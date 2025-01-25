export default function Home() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-game-accent mb-4">
          Bienvenue sur TCG Friends
        </h1>
        <p className="text-xl text-game-text mb-8">
          Collectionnez des cartes, ouvrez des boosters et créez votre collection unique !
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="game-card">
            <h2 className="text-xl font-bold text-game-accent mb-4">Boosters Variés</h2>
            <p>Découvrez différents types de boosters avec des chances uniques d&apos;obtenir des cartes rares</p>
          </div>
          
          <div className="game-card">
            <h2 className="text-xl font-bold text-game-accent mb-4">Cartes Shiny</h2>
            <p>Trouvez des versions brillantes de vos cartes préférées</p>
          </div>
          
          <div className="game-card">
            <h2 className="text-xl font-bold text-game-accent mb-4">Collection</h2>
            <p>Gérez votre collection et suivez vos statistiques</p>
          </div>
        </div>
      </div>
    </div>
  );
} 