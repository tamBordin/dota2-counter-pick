import { HeroStats, Matchup, getHeroWinRate } from './dotaApi';
import { COUNTER_ITEMS_MAP, HERO_ITEM_COUNTERS, CounterItem } from '@/data/items';

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
  items: CounterItem[];
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

export const calculateItemCounters = (enemyTeam: HeroStats[]): CounterItem[] => {
  const neededCategories = new Set<string>();
  const itemCounts: Record<string, { count: number; reasons: Set<string> }> = {};

  enemyTeam.forEach(hero => {
    const categories = HERO_ITEM_COUNTERS[hero.localized_name] || [];

    // Add generic categories based on roles
    if (hero.roles.includes('Nuker')) neededCategories.add('magic');
    if (hero.roles.includes('Escape')) neededCategories.add('elusive');

    categories.forEach(cat => {
      const items = COUNTER_ITEMS_MAP[cat] || [];
      items.forEach(itemEntry => {
        itemEntry.items.forEach(itemId => {
          if (!itemCounts[itemId]) {
            itemCounts[itemId] = { count: 0, reasons: new Set() };
          }
          itemCounts[itemId].count += 1;
          itemCounts[itemId].reasons.add(itemEntry.reason);
        });
      });
    });
  });

  // Also add items from generic categories if not already added
  neededCategories.forEach(cat => {
    const items = COUNTER_ITEMS_MAP[cat] || [];
    items.forEach(itemEntry => {
      itemEntry.items.forEach(itemId => {
        if (!itemCounts[itemId]) {
          itemCounts[itemId] = { count: 0, reasons: new Set() };
        }
        itemCounts[itemId].count += 0.5; // Lower priority for generic role counters
        itemCounts[itemId].reasons.add(itemEntry.reason);
      });
    });
  });

  return Object.entries(itemCounts)
    .map(([id, data]) => ({
      id,
      name: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      img: id,
      reason: Array.from(data.reasons).slice(0, 2).join(', '),
      priority: data.count
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
};

export const getCategorizedSuggestions = (
  allHeroes: HeroStats[],
  enemyTeam: HeroStats[],
  matchupsData: Record<number, Matchup[]>,
  myTeam: (HeroStats | null)[]
): CategorizedSuggestions => {
  const allSuggestions = calculateAdvantage(allHeroes, enemyTeam, matchupsData);
  const itemSuggestions = calculateItemCounters(enemyTeam);

  // Filter out heroes already picked in myTeam or enemyTeam
  const pickedIds = new Set([
    ...myTeam.filter(h => h).map(h => h!.id),
    ...enemyTeam.map(h => h.id)
  ]);

  const available = allSuggestions.filter(s => !pickedIds.has(s.heroId));

  return {
    cores: available.filter(s => s.role === 'Core' || s.role === 'Flex').slice(0, 10),
    supports: available.filter(s => s.role === 'Support' || s.role === 'Flex').slice(0, 10),
    items: itemSuggestions
  };
};