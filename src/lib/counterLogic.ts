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

export interface PositionHeroEntry {
  hero: HeroStats;
  winRate: number; // 0–100 percentage
  picks: number;
}

export const getPositionTopHeroes = (
  heroes: HeroStats[],
  position: 1 | 2 | 3 | 4 | 5,
  minPicks: number = 500,
  topN: number = 10
): PositionHeroEntry[] => {
  const strict = heroes
    .map((hero) => {
      const picks = hero[`${position}_pick` as keyof HeroStats] as number;
      const wins = hero[`${position}_win` as keyof HeroStats] as number;
      if (!picks || picks < minPicks) return null;

      const totalLanePicks =
        (hero['1_pick'] || 0) +
        (hero['2_pick'] || 0) +
        (hero['3_pick'] || 0) +
        (hero['4_pick'] || 0) +
        (hero['5_pick'] || 0);

      const laneShare = totalLanePicks > 0 ? picks / totalLanePicks : 0;
      const role = analyzeRole(hero);

      // Logic เพิ่มเติมให้ position ดูสมเหตุสมผลขึ้น
      if (position === 1) {
        // Pos 1: hard carry จริงๆ
        if (!(role === 'Core' && hero.roles.includes('Carry'))) return null;
        if (laneShare < 0.25) return null;
      } else if (position === 2) {
        // Pos 2: mid core (ส่วนใหญ่เป็น core ที่มี damage สูง)
        if (role === 'Support') return null;
        if (laneShare < 0.2) return null;
      } else if (position === 3) {
        // Pos 3: offlane tank / initiator
        const isFrontliner =
          hero.roles.includes('Durable') || hero.roles.includes('Initiator');
        if (role === 'Support' || !isFrontliner) return null;
        if (laneShare < 0.2) return null;
      } else if (position === 4) {
        // Pos 4: playmaker support (มี Nuker/Disabler/Escape)
        const isPlaymaker =
          hero.roles.includes('Nuker') ||
          hero.roles.includes('Disabler') ||
          hero.roles.includes('Escape');
        if (!hero.roles.includes('Support') || !isPlaymaker) return null;
        if (laneShare < 0.15) return null;
      } else if (position === 5) {
        // Pos 5: hard support แท้ๆ ไม่อยากให้ carry หลุดมา
        if (!hero.roles.includes('Support')) return null;
        if (hero.roles.includes('Carry')) return null;
        if (laneShare < 0.2) return null;
      }

      return { hero, winRate: (wins / picks) * 100, picks };
    })
    .filter((item): item is PositionHeroEntry => item !== null)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, topN);

  // ถ้า strict filter แล้วไม่เหลือเลย ให้ fallback เป็น logic เดิมๆ ที่ดูแค่ role คร่าวๆ
  if (strict.length > 0) return strict;

  return heroes
    .filter((hero) => {
      const role = analyzeRole(hero);
      if (position === 1 || position === 2 || position === 3) {
        return role === 'Core' || role === 'Flex';
      }
      if (position === 4 || position === 5) {
        return role === 'Support' || role === 'Flex';
      }
      return true;
    })
    .map((hero) => {
      const picks = hero[`${position}_pick` as keyof HeroStats] as number;
      const wins = hero[`${position}_win` as keyof HeroStats] as number;
      if (!picks || picks < minPicks) return null;
      return { hero, winRate: (wins / picks) * 100, picks };
    })
    .filter((item): item is PositionHeroEntry => item !== null)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, topN);
};