/* eslint-disable @typescript-eslint/no-explicit-any */
import { Heroes } from '@/types/heros';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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
