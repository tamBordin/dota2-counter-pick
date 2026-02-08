import { HeroStats, Matchup } from './dotaApi';

export interface CounterScore {
  heroId: number;
  score: number;
}

export const calculateAdvantage = (
  allHeroes: HeroStats[],
  enemyTeam: HeroStats[],
  matchupsData: Record<number, Matchup[]>
): CounterScore[] => {
  if (enemyTeam.length === 0) return [];

  const scores: Record<number, number> = {};

  allHeroes.forEach(hero => {
    scores[hero.id] = 0;
  });

  enemyTeam.forEach(enemy => {
    const matchups = matchupsData[enemy.id] || [];

    matchups.forEach(m => {
      if (scores[m.hero_id] !== undefined) {
        const winRate = m.wins / m.games_played;
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