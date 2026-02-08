"use client";

import React from "react";
import { HeroStats, getHeroImageUrl } from "@/lib/dotaApi";
import { Plus } from "lucide-react";

interface HeroGridProps {
  heroes: HeroStats[];
  onSelectHero: (hero: HeroStats, team: "radiant" | "dire") => void;
  selectedHeroIds: number[];
}

const HeroGrid: React.FC<HeroGridProps> = ({
  heroes,
  onSelectHero,
  selectedHeroIds,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const primaryAttrs = [
    { key: "str", label: "Strength", color: "text-red-500" },
    { key: "agi", label: "Agility", color: "text-green-500" },
    { key: "int", label: "Intelligence", color: "text-blue-400" },
    { key: "all", label: "Universal", color: "text-purple-400" },
  ];

  const filteredHeroes = heroes.filter((hero) =>
    hero.localized_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-xl border border-slate-800">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Hero..."
          className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
        {primaryAttrs.map((attr) => {
          const attrHeroes = filteredHeroes.filter(
            (h) => h.primary_attr === attr.key,
          );
          if (attrHeroes.length === 0) return null;

          return (
            <div key={attr.key}>
              <h4
                className={`text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${attr.color}`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {attr.label}
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {attrHeroes.map((hero) => {
                  const isSelected = selectedHeroIds.includes(hero.id);
                  return (
                    <div
                      key={hero.id}
                      className={`relative group w-full aspect-[16/9] overflow-hidden rounded border border-slate-700 shadow-lg transition-all duration-200 ${
                        isSelected
                          ? "opacity-20 grayscale scale-95"
                          : "opacity-100"
                      }`}
                    >
                      <img
                        src={getHeroImageUrl(hero.img)}
                        alt={hero.localized_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Name Label */}
                      {!isSelected && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[9px] font-medium text-center text-slate-200 truncate px-1 py-0.5 z-0 group-hover:opacity-0 transition-opacity">
                          {hero.localized_name}
                        </div>
                      )}

                      {/* Split Hover Overlays */}
                      {!isSelected && (
                        <div className="absolute inset-0 flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          {/* Pick Radiant (Left - Green) */}
                          <div
                            onClick={() => onSelectHero(hero, "radiant")}
                            className="w-1/2 h-full bg-green-600/60 flex flex-col items-center justify-center cursor-pointer hover:bg-green-500/80 transition-colors border-r border-white/10"
                            title="Pick for Radiant"
                          >
                            <Plus
                              size={16}
                              className="text-white drop-shadow-md"
                            />
                            <span className="text-[8px] font-bold text-white uppercase mt-1">
                              Us
                            </span>
                          </div>

                          {/* Pick Dire (Right - Red) */}
                          <div
                            onClick={() => onSelectHero(hero, "dire")}
                            className="w-1/2 h-full bg-red-600/60 flex flex-col items-center justify-center cursor-pointer hover:bg-red-500/80 transition-colors"
                            title="Pick for Dire"
                          >
                            <Plus
                              size={16}
                              className="text-white drop-shadow-md"
                            />
                            <span className="text-[8px] font-bold text-white uppercase mt-1">
                              Enemy
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroGrid;
