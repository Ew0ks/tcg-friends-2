import { useEffect, useState } from 'react';
import { AchievementWithProgress } from '@/types/achievement';
import { toast } from 'sonner';

export default function AchievementList() {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/achievements');
        if (!response.ok) throw new Error('Erreur lors de la récupération des achievements');
        const data = await response.json();
        setAchievements(data);
      } catch (error) {
        toast.error('Impossible de charger les achievements');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-game-accent"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`relative p-4 rounded-lg border-2 ${
            achievement.isUnlocked
              ? 'border-game-success bg-gradient-to-br from-game-success/20 to-game-success/5'
              : 'border-game-accent/50 bg-gradient-to-br from-game-accent/10 to-game-accent/5'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 relative">
              <img
                src={achievement.imageUrl}
                alt={achievement.name}
                className={`w-full h-full object-cover rounded-lg ${
                  !achievement.isUnlocked && 'filter grayscale opacity-50'
                }`}
              />
              {achievement.isUnlocked && (
                <div className="absolute -top-2 -right-2 bg-game-success text-white p-1 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-game-accent">{achievement.name}</h3>
              <p className="text-sm text-gray-300">{achievement.description}</p>
              {!achievement.isUnlocked && (
                <div className="mt-2">
                  <div className="h-2 bg-game-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-game-accent transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (achievement.progress / achievement.threshold) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {achievement.progress} / {achievement.threshold}
                  </p>
                </div>
              )}
              {achievement.isUnlocked && achievement.unlockedAt && (
                <p className="text-xs text-game-success mt-1">
                  Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 