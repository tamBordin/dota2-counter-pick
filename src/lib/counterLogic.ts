import { HeroStats, Matchup } from './dotaApi';

export interface CounterScore {
  heroId: number;
  score: number; // Advantage score
}

export const calculateAdvantage = (
  allHeroes: HeroStats[],
  enemyTeam: HeroStats[],
  matchupsData: Record<number, Matchup[]>
): CounterScore[] => {
  if (enemyTeam.length === 0) return [];

  const scores: Record<number, number> = {};

  // Initialize scores for all heroes
  allHeroes.forEach(hero => {
    scores[hero.id] = 0;
  });

  enemyTeam.forEach(enemy => {
    const matchups = matchupsData[enemy.id] || [];

    matchups.forEach(m => {
      // OpenDota matchups are from the perspective of the heroId in the URL
      // If we fetch matchups for Enemy A, the results tell us how OTHER heroes perform against Enemy A.
      // Actually, OpenDota /heroes/{id}/matchups returns how hero {id} performs AGAINST others.
      // So if wins/games is high, it means Enemy A counters that hero.
      // We want the opposite: who counters Enemy A.

      if (scores[m.hero_id] !== undefined) {
        const winRate = m.wins / m.games_played;
        // We want heroes who beat this enemy (so enemy's winrate against them should be low)
        // Advantage = 0.5 - winRate (if winRate is 0.4, advantage is 0.1)
        const advantage = 0.5 - winRate;
        scores[m.hero_id] += advantage;
      }
    });
  });

  return Object.entries(scores)
    .map(([heroId, score]) => ({
      heroId: parseInt(heroId),
      score: score / enemyTeam.length
    }))
    .sort((a, b) => b.score - a.score);
};
