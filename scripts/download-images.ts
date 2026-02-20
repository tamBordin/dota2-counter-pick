/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { COUNTER_ITEMS_MAP, HERO_ITEM_COUNTERS } from '@/data/items';

const HEROES_PATH = path.join(process.cwd(), 'src/data/heroes.json');
const HEROES_OUTPUT_DIR = path.join(process.cwd(), 'public', 'dota', 'heroes');
const ITEMS_OUTPUT_DIR = path.join(process.cwd(), 'public', 'dota', 'items');

const HERO_BASE_URL = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes';
const ITEM_BASE_URL = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadFile(url: string, outputPath: string) {
  if (fs.existsSync(outputPath)) {
    console.log(`✅ Exists, skip: ${outputPath}`);
    return;
  }

  console.log(`⬇️  Downloading ${url}`);

  const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(outputPath, Buffer.from(response.data));
  console.log(`💾 Saved to ${outputPath}`);
}

async function downloadHeroImages() {
  console.log('=== Downloading hero images ===');
  ensureDir(HEROES_OUTPUT_DIR);

  const raw = fs.readFileSync(HEROES_PATH, 'utf-8');
  const heroes: any[] = JSON.parse(raw);

  const filenames = new Set<string>();

  for (const hero of heroes) {
    if (!hero.img) continue;

    const withoutQuery = (hero.img as string).split('?')[0];
    const filename = withoutQuery.split('/').pop();
    if (!filename) continue;

    filenames.add(filename);
  }

  for (const filename of filenames) {
    const url = `${HERO_BASE_URL}/${filename}`;
    const outputPath = path.join(HEROES_OUTPUT_DIR, filename);

    try {
      await downloadFile(url, outputPath);
    } catch (error) {
      console.error(`❌ Failed to download hero image ${filename}:`, error);
    }
  }
}

function getAllCounterItemIds(): string[] {
  const ids = new Set<string>();

  // From COUNTER_ITEMS_MAP
  Object.values(COUNTER_ITEMS_MAP).forEach((entries) => {
    entries.forEach((entry) => {
      entry.items.forEach((itemId) => ids.add(itemId));
    });
  });

  // From HERO_ITEM_COUNTERS (these are category keys into COUNTER_ITEMS_MAP)
  Object.values(HERO_ITEM_COUNTERS).forEach((categories) => {
    categories.forEach((categoryKey) => {
      const entries = COUNTER_ITEMS_MAP[categoryKey];
      if (!entries) return;
      entries.forEach((entry) => {
        entry.items.forEach((itemId) => ids.add(itemId));
      });
    });
  });

  return Array.from(ids);
}

async function downloadItemImages() {
  console.log('=== Downloading item images ===');
  ensureDir(ITEMS_OUTPUT_DIR);

  const itemIds = getAllCounterItemIds();

  for (const itemId of itemIds) {
    // Apply same mapping as getItemImageUrl
    const mapping: Record<string, string> = {
      scythe_of_vyse: 'sheepstick',
    };
    const name = mapping[itemId] || itemId;
    const filename = `${name}.png`;

    const url = `${ITEM_BASE_URL}/${filename}`;
    const outputPath = path.join(ITEMS_OUTPUT_DIR, filename);

    try {
      await downloadFile(url, outputPath);
    } catch (error) {
      console.error(`❌ Failed to download item image ${filename}:`, error);
    }
  }
}

async function main() {
  try {
    await downloadHeroImages();
    await downloadItemImages();
    console.log('🎉 Finished downloading hero and item images.');
  } catch (error) {
    console.error('❌ Error while downloading images:', error);
    process.exit(1);
  }
}

main();

