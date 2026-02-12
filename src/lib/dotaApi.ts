import axios from 'axios';
import heroesData from '@/data/heroes.json';
import { Heroes } from '@/types/heros';

const BASE_URL = 'https://api.opendota.com/api';

// Re-export as HeroStats to match existing code usage
export type HeroStats = Heroes;

export interface Matchup {
  hero_id: number;
  games_played: number;
  wins: number;
}

export const fetchHeroes = async (): Promise<HeroStats[]> => {
  return heroesData as HeroStats[];
};

export const fetchHeroMatchups = async (heroId: number): Promise<Matchup[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/heroes/${heroId}/matchups`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching matchups for hero ${heroId}:`, error);
    return [];
  }
};

export const fetchCurrentPatch = async (): Promise<string> => {
  try {
    const response = await axios.get('/api/patch');
    return response.data.version;
  } catch (error) {
    console.error('Error fetching patch info from internal API:', error);
    return '7.40c';
  }
};

export const getHeroImageUrl = (img: string) => {
  return `https://cdn.cloudflare.steamstatic.com${img}`;
};

// --- Meta Analysis Helpers ---

export const getHeroWinRate = (hero: HeroStats): number => {
  if (!hero.pub_pick || !hero.pub_win || hero.pub_pick === 0) return 0;
  return (hero.pub_win / hero.pub_pick) * 100;
};

export const isProMeta = (hero: HeroStats): boolean => {
  // Simple heuristic: If pro picks + bans is high relative to others
  // In a real app, we might calculate percentiles.
  // For now, let's say > 50 combined interactions is "Meta"
  const interactions = (hero.pro_pick || 0) + (hero.pro_ban || 0);
  return interactions > 50;
};

export const isTrending = (hero: HeroStats): boolean => {
  if (!hero.pub_pick_trend || hero.pub_pick_trend.length < 2) return false;

  // Compare last day with average of last 3 days to see recent spike
  const last = hero.pub_pick_trend[hero.pub_pick_trend.length - 1];
  const prev = hero.pub_pick_trend[hero.pub_pick_trend.length - 2];

  return last > prev * 1.1; // 10% increase
};