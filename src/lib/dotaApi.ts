import axios from 'axios';
import heroesData from '@/data/heroes.json';

const BASE_URL = 'https://api.opendota.com/api';

export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
}

export interface HeroStats extends Hero {
  base_health: number;
  base_mana: number;
  base_armor: number;
  base_attack_min: number;
  base_attack_max: number;
  base_str: number;
  base_agi: number;
  base_int: number;
  win_rate?: number;
}

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