export interface CounterItem {
  id: string;
  name: string;
  img: string;
  reason: string;
  priority: number;
}

export const COUNTER_ITEMS_MAP: Record<string, { items: string[]; reason: string }[]> = {
  // Evasion
  "evasion": [
    { items: ["monkey_king_bar"], reason: "To counter Evasion" }
  ],
  // Passives
  "passives": [
    { items: ["silver_edge"], reason: "To break strong passives" }
  ],
  // High Regen / Healing
  "regen": [
    { items: ["spirit_vessel", "shivas_guard"], reason: "To reduce healing/regen" }
  ],
  // Magic Damage / CC
  "magic": [
    { items: ["black_king_bar", "pipe"], reason: "To survive magic burst/CC" }
  ],
  // Elusive (Blink/Invis/Escapes)
  "elusive": [
    { items: ["orchid", "bloodthorn", "scythe_of_vyse"], reason: "To lock down elusive targets" }
  ],
  // High Physical Damage
  "physical": [
    { items: ["ghost", "crimson_guard", "shivas_guard"], reason: "To mitigate physical damage" }
  ],
  // Buffs / Ghost Scepter
  "buffs": [
    { items: ["nullifier"], reason: "To dispel buffs and items" }
  ],
  // Mana reliance (Medusa)
  "mana": [
    { items: ["diffusal_blade"], reason: "To burn mana" }
  ]
};

// Hero specific item counters
export const HERO_ITEM_COUNTERS: Record<string, string[]> = {
  "Phantom Assassin": ["evasion", "passives"],
  "Bristleback": ["passives", "regen"],
  "Spectre": ["passives"],
  "Dragon Knight": ["passives"],
  "Alchemist": ["regen"],
  "Morphling": ["regen", "elusive"],
  "Huskar": ["regen"],
  "Necrophos": ["regen", "buffs"],
  "Anti-Mage": ["elusive", "mana"],
  "Storm Spirit": ["elusive"],
  "Puck": ["elusive"],
  "Ember Spirit": ["elusive"],
  "Void Spirit": ["elusive"],
  "Medusa": ["mana"],
  "Timbersaw": ["regen", "passives"],
  "Windranger": ["evasion"],
  "Slark": ["passives", "elusive"],
  "Life Stealer": ["physical"],
  "Omniknight": ["buffs"],
  "Ursa": ["physical", "buffs"],
};
