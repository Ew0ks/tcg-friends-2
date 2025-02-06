import { updateAchievements } from '@/services/achievementService';

// Après le traitement des cartes échangées
await updateAchievements({
  userId: recipientId,
  type: 'COLLECTION_UPDATE'
});
await updateAchievements({
  userId: initiatorId,
  type: 'COLLECTION_UPDATE'
}); 