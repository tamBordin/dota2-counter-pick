import { HeroStats, Matchup, getHeroWinRate } from './dotaApi';

export type CounterType = 'Meta' | 'Specialist' | 'Situational' | 'General';

export interface CounterScore {
  heroId: number;
  score: number;
  role: 'Core' | 'Support' | 'Flex';
  winRate: number; // Global Win Rate
  counterType: CounterType;
}

export interface CategorizedSuggestions {
  cores: CounterScore[];
  supports: CounterScore[];
}

export const analyzeRole = (hero: HeroStats): 'Core' | 'Support' | 'Flex' => {
  const isCarry = hero.roles.includes('Carry');
  const isSupport = hero.roles.includes('Support');

  if (isCarry && !isSupport) return 'Core';
  if (!isCarry && isSupport) return 'Support';

  if (isCarry && isSupport) {
    if (hero.primary_attr === 'agi') return 'Core';
    if (hero.primary_attr === 'int') return 'Support';
    return 'Flex';
  }

  return 'Flex';
};

export const classifyCounter = (baseWinRate: number, advantage: number): CounterType => {
  // Advantage is e.g., 0.05 for 5% advantage
  const advPercent = advantage * 100;

  if (baseWinRate >= 52) {
    return 'Meta'; // Strong hero generally
  }

  if (baseWinRate < 50 && advPercent >= 2) {
    return 'Specialist'; // Weak generally, but good here
  }

  if (advPercent >= 4) {
    return 'Situational'; // Very strong counter specific
  }

  return 'General';
};

export const calculateAdvantage = (
  allHeroes: HeroStats[],
  enemyTeam: HeroStats[],
  matchupsData: Record<number, Matchup[]>
): CounterScore[] => {
  if (enemyTeam.length === 0) return [];

  const scores: Record<number, number> = {};

  // Initialize scores
  allHeroes.forEach(hero => {
    scores[hero.id] = 0;
  });

  // Calculate matchup advantage
  enemyTeam.forEach(enemy => {
    const matchups = matchupsData[enemy.id] || [];

    matchups.forEach(m => {
      if (scores[m.hero_id] !== undefined) {
        // Winrate of Enemy vs Me. 
        // m.wins is how many times Enemy WON against Me.
        // So My Win Rate vs Enemy = 1 - (m.wins / m.games_played)
        // Advantage = My Win Rate vs Enemy - 0.5
        const enemyWinRate = m.wins / m.games_played;
        const myWinRate = 1 - enemyWinRate;
        const advantage = myWinRate - 0.5;
        scores[m.hero_id] += advantage;
      }
    });
  });

  // Format and sort
  return Object.entries(scores)
    .map(([heroIdStr, score]) => {
      const heroId = parseInt(heroIdStr);
      const hero = allHeroes.find(h => h.id === heroId);

      if (!hero) return null;

      const avgAdvantage = score / enemyTeam.length;
      const globalWinRate = getHeroWinRate(hero);

      return {
        heroId,
        score: avgAdvantage,
        role: analyzeRole(hero),
        winRate: globalWinRate,
        counterType: classifyCounter(globalWinRate, avgAdvantage)
      };
    })
    .filter((item): item is CounterScore => item !== null)
    .sort((a, b) => b.score - a.score);
};

export const getCategorizedSuggestions = (
  allHeroes: HeroStats[],
  enemyTeam: HeroStats[],
  matchupsData: Record<number, Matchup[]>,
  myTeam: (HeroStats | null)[]
): CategorizedSuggestions => {
  const allSuggestions = calculateAdvantage(allHeroes, enemyTeam, matchupsData);

  // Filter out heroes already picked in myTeam or enemyTeam
  const pickedIds = new Set([
    ...myTeam.filter(h => h).map(h => h!.id),
    ...enemyTeam.map(h => h.id)
  ]);

  const available = allSuggestions.filter(s => !pickedIds.has(s.heroId));

  return {
    cores: available.filter(s => s.role === 'Core' || s.role === 'Flex').slice(0, 10),
    supports: available.filter(s => s.role === 'Support' || s.role === 'Flex').slice(0, 10)
  };
};