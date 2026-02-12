import { HeroStats, Matchup } from './dotaApi';

export interface CounterScore {
  heroId: number;
  score: number;
  role: 'Core' | 'Support' | 'Flex';
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
  
  // Refined Flex Logic:
  // If it has both, check primary attribute? 
  // Agility -> Lean Core
  // Intelligence -> Lean Support
  // Strength -> True Flex / Offlane (Core)
  if (isCarry && isSupport) {
    if (hero.primary_attr === 'agi') return 'Core';
    if (hero.primary_attr === 'int') return 'Support';
    return 'Flex'; 
  }
  
  return 'Flex';
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
        // If Winrate is high (e.g. 55%), then Enemy counters Me. Advantage is negative.
        // If Winrate is low (e.g. 45%), then Me counters Enemy. Advantage is positive.
        const winRate = m.wins / m.games_played;
        const advantage = 0.5 - winRate;
        scores[m.hero_id] += advantage;
      }
    });
  });

  // Format and sort
  return Object.entries(scores)
    .map(([heroIdStr, score]) => {
      const heroId = parseInt(heroIdStr);
      const hero = allHeroes.find(h => h.id === heroId);
      
      return {
        heroId,
        score: score / enemyTeam.length,
        role: hero ? analyzeRole(hero) : 'Flex'
      };
    })
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
