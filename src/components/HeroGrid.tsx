"use client";

import { heroAliases } from "@/data/aliases";
import {
  HeroStats,
  getHeroImageUrl,
  getHeroWinRate,
  isProMeta,
  isTrending,
} from "@/lib/dotaApi";
import { Filter, Flame, Plus, Search, Trophy } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface HeroGridProps {
  heroes: HeroStats[];
  onSelectHero: (hero: HeroStats, isForUserTeam: boolean) => void;
  selectedHeroIds: number[];
}

const HeroGrid: React.FC<HeroGridProps> = ({
  heroes,
  onSelectHero,
  selectedHeroIds,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttr, setSelectedAttr] = useState<string>("all");

  const primaryAttrs = [
    { key: "all", label: "All", color: "text-white" },
    { key: "str", label: "Strength", color: "text-red-500" },
    { key: "agi", label: "Agility", color: "text-green-500" },
    { key: "int", label: "Intelligence", color: "text-blue-400" },
    { key: "all_attr", label: "Universal", color: "text-purple-400" }, // Note: API uses 'all' for universal usually, check logic below
  ];

  const filteredHeroes = heroes.filter((hero) => {
    const searchLower = searchTerm.toLowerCase();
    const heroName = hero.localized_name.toLowerCase();

    // Check Name
    let matchesSearch = heroName.includes(searchLower);

    // Check Aliases if not found by name
    if (!matchesSearch) {
      const aliases = heroAliases[hero.localized_name] || [];
      matchesSearch = aliases.some((alias) =>
        alias.toLowerCase().includes(searchLower),
      );
    }

    const matchesAttr =
      selectedAttr === "all" ||
      (selectedAttr === "all_attr"
        ? hero.primary_attr === "all"
        : hero.primary_attr === selectedAttr);
    return matchesSearch && matchesAttr;
  });

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[800px]">
      {/* Header / Filter Bar */}
      <div className="p-4 md:p-6 bg-slate-900/80 border-b border-slate-800 flex flex-col gap-4 sticky top-0 z-20">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search heroes (e.g. 'AM', 'Pudge', 'ES')..."
            className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {primaryAttrs.map((attr) => (
            <button
              key={attr.key}
              onClick={() => setSelectedAttr(attr.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${
                selectedAttr === attr.key
                  ? "bg-slate-800 border-slate-600 text-white shadow-lg"
                  : "bg-transparent border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
              }`}
            >
              <span className={selectedAttr === attr.key ? attr.color : ""}>
                {attr.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
          {filteredHeroes.map((hero) => {
            const isSelected = selectedHeroIds.includes(hero.id);
            const isPro = isProMeta(hero);
            const isHot = isTrending(hero);
            const winRate = getHeroWinRate(hero);

            return (
              <div
                key={hero.id}
                className={`relative group aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  isSelected
                    ? "opacity-20 grayscale border-transparent pointer-events-none"
                    : "border-slate-800 hover:border-slate-600 hover:shadow-xl hover:-translate-y-1 bg-slate-900"
                }`}
              >
                <Image
                  src={getHeroImageUrl(hero.img)}
                  alt={hero.localized_name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Badges */}
                <div className="absolute top-1 left-1 flex flex-col gap-1 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                  {isPro && (
                    <div className="bg-yellow-500 text-black p-1 rounded-full shadow-md">
                      <Trophy size={10} strokeWidth={3} />
                    </div>
                  )}
                  {isHot && (
                    <div className="bg-orange-500 text-white p-1 rounded-full shadow-md">
                      <Flame size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center group-hover:opacity-0 transition-opacity duration-200">
                  <span className="text-[10px] md:text-xs font-bold text-white leading-tight drop-shadow-md">
                    {hero.localized_name}
                  </span>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col p-2">
                  <div className="text-center mb-2">
                    <div className="text-xs font-black text-white truncate">
                      {hero.localized_name}
                    </div>
                    <div
                      className={`text-[10px] font-bold ${
                        winRate >= 50 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {winRate.toFixed(1)}% WR
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => onSelectHero(hero, true)}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase tracking-wide transition-colors shadow-lg"
                    >
                      <Plus size={12} strokeWidth={3} /> Pick Us
                    </button>
                    <button
                      onClick={() => onSelectHero(hero, false)}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-wide transition-colors shadow-lg"
                    >
                      <Plus size={12} strokeWidth={3} /> Pick Em
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredHeroes.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500">
            <Filter size={48} className="mb-4 opacity-50" />
            <p className="text-sm font-medium">
              No heroes found matching &quot;{searchTerm}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroGrid;
