/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import axios from 'axios';

interface Heroes {
  id: number
  name: string
  primary_attr: string
  attack_type: string
  roles: string[]
  img: string
  icon: string
  base_health: number
  base_health_regen?: number
  base_mana: number
  base_mana_regen: number
  base_armor: number
  base_mr: number
  base_attack_min: number
  base_attack_max: number
  base_str: number
  base_agi: number
  base_int: number
  str_gain: number
  agi_gain: number
  int_gain: number
  attack_range: number
  projectile_speed: number
  attack_rate: number
  base_attack_time: number
  attack_point: number
  move_speed: number
  turn_rate?: number
  cm_enabled: boolean
  legs: number
  day_vision: number
  night_vision: number
  localized_name: string
  "1_pick": number
  "1_win": number
  "2_pick": number
  "2_win": number
  "3_pick": number
  "3_win": number
  "4_pick": number
  "4_win": number
  "5_pick": number
  "5_win": number
  "6_pick": number
  "6_win": number
  "7_pick": number
  "7_win": number
  "8_pick": number
  "8_win": number
  turbo_picks: number
  turbo_picks_trend: number[]
  turbo_wins: number
  turbo_wins_trend: number[]
  pro_pick: number
  pro_win: number
  pro_ban: number
  pub_pick: number
  pub_pick_trend: number[]
  pub_win: number
  pub_win_trend: number[]
}

const HEROES_PATH = path.join(process.cwd(), 'src/data/heroes.json');
const API_URL = 'https://api.opendota.com/api/heroStats';

// Helper to check if two objects/arrays are deeply equal
function isDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

async function updateHeroes() {
  console.log('🔄 Checking for hero data updates...');

  try {
    // 1. Read local data
    let localData: Heroes[] = [];
    try {
      if (fs.existsSync(HEROES_PATH)) {
        const fileContent = fs.readFileSync(HEROES_PATH, 'utf-8');
        localData = JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn('⚠️ Could not read local heroes.json, assuming empty.', err);
    }

    // 2. Fetch remote data
    console.log(`🌐 Fetching data from ${API_URL}...`);
    const response = await axios.get<Heroes[]>(API_URL);
    const remoteData = response.data;

    // 3. Sort both arrays by ID to ensure consistent comparison
    // (API might return random order, we want to compare content, not order)
    const sortById = (a: Heroes, b: Heroes) => a.id - b.id;
    localData.sort(sortById);
    remoteData.sort(sortById);

    // 4. Compare
    if (isDeepEqual(localData, remoteData)) {
      console.log('✅ Local data is already up-to-date. No changes made.');
      return;
    }

    // 5. Update if different
    console.log('⚡ Differences found! Updating heroes.json...');
    fs.writeFileSync(HEROES_PATH, JSON.stringify(remoteData, null, 2), 'utf-8'); // Pretty print with 2 spaces
    console.log(`🎉 Successfully updated ${remoteData.length} heroes to ${HEROES_PATH}`);

  } catch (error) {
    console.error('❌ Error updating hero data:', error);
    process.exit(1);
  }
}

updateHeroes();
