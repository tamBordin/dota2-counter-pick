import axios from 'axios';
import fs from 'fs';
import path from 'path';

const HEROES_PATH = path.join(process.cwd(), 'src/data/heroes.json');
const MATCHUPS_PATH = path.join(process.cwd(), 'src/data/matchups.json');
const BASE_URL = 'https://api.opendota.com/api';

// Simple delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function updateMatchups() {
  console.log('🔄 Starting bulk matchup update...');

  try {
    // 1. Read heroes list
    if (!fs.existsSync(HEROES_PATH)) {
      throw new Error('heroes.json not found. Run update-data first.');
    }

    const heroes = JSON.parse(fs.readFileSync(HEROES_PATH, 'utf-8'));
    console.log(`📋 Found ${heroes.length} heroes. Fetching matchups...`);

    const allMatchups: Record<string, unknown> = {};
    let count = 0;

    // 2. Fetch matchups for each hero
    for (const hero of heroes) {
      count++;
      process.stdout.write(`\r⏳ Fetching ${count}/${heroes.length}: ${hero.localized_name}...`);

      try {
        const response = await axios.get(`${BASE_URL}/heroes/${hero.id}/matchups`);
        // We only strictly need hero_id, games_played, wins to keep file size down
        // Mapping to reduce size
        const minifiedMatchups = response.data.map((m: { hero_id: number; games_played: number; wins: number }) => ({
          hero_id: m.hero_id,
          games_played: m.games_played,
          wins: m.wins
        }));

        allMatchups[hero.id] = minifiedMatchups;

        // Polite delay (OpenDota limit is 60 req/min free, so ~1 sec delay is safe)
        await delay(1000);

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`\n❌ Failed to fetch ${hero.localized_name}: ${errorMessage}`);
      }
    }

    console.log('\n💾 Saving to matchups.json...');
    fs.writeFileSync(MATCHUPS_PATH, JSON.stringify(allMatchups, null, 0)); // No pretty print to save space
    console.log(`🎉 Successfully saved matchups for ${Object.keys(allMatchups).length} heroes!`);

  } catch (error) {
    console.error('\n❌ Error updating matchups:', error);
    process.exit(1);
  }
}

updateMatchups();