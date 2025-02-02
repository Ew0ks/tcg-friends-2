import { achievementService } from '@/lib/services/achievementService';

// Dans la fonction handler, après l'ajout réussi de la carte :
await achievementService.handleAchievementEvent({
  userId: session.user.id,
  type: 'COLLECTION_UPDATE',
}); 