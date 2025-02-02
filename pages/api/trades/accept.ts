import { achievementService } from '@/lib/services/achievementService';

// Dans la fonction handler, après le traitement de l'échange réussi :
await achievementService.handleAchievementEvent({
  userId: session.user.id,
  type: 'TRADE_COMPLETE',
}); 