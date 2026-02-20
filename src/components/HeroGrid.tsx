"use client";

import { heroAliases } from "@/data/aliases";
import { analyzeRole } from "@/lib/counterLogic";
import {
  HeroStats,
  getHeroImageUrl,
  getHeroWinRate,
  isProMeta,
  isTrending,
} from "@/lib/dotaApi";
import {
  Activity,
  ChevronDown,
  Command,
  Filter,
  Flame,
  Plus,
  Search,
  Shield,
  ShieldPlus,
  Swords,
  Trophy,
  Wind,
  Zap,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

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
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hotkey to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" ||
        (e.ctrlKey && e.key === "k") ||
        (e.metaKey && e.key === "k")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const primaryAttrs = [
    { key: "all", label: "All", color: "text-white" },
    { key: "str", label: "Strength", color: "text-red-500" },
    { key: "agi", label: "Agility", color: "text-green-500" },
    { key: "int", label: "Intelligence", color: "text-blue-400" },
    { key: "all_attr", label: "Universal", color: "text-purple-400" },
  ];

  const roleFilters = [
    { key: "all", label: "All Roles", icon: Filter },
    { key: "Core", label: "Core", icon: Swords },
    { key: "Support", label: "Support", icon: ShieldPlus },
    { key: "Initiator", label: "Init", icon: Activity },
    { key: "Durable", label: "Tank", icon: Shield },
    { key: "Nuker", label: "Nuke", icon: Zap },
    { key: "Escape", label: "Escape", icon: Wind },
  ];

  // Filtering Logic
  const filteredHeroes = heroes.filter((hero) => {
    const searchLower = searchTerm.toLowerCase();
    const heroName = hero.localized_name.toLowerCase();

    // 1. Search Check
    let matchesSearch = true;
    if (searchLower) {
      matchesSearch = heroName.includes(searchLower);
      if (!matchesSearch) {
        const aliases = heroAliases[hero.localized_name] || [];
        matchesSearch = aliases.some((alias) =>
          alias.toLowerCase().includes(searchLower),
        );
      }
    }

    // 2. Attribute Check
    const matchesAttr =
      selectedAttr === "all" ||
      (selectedAttr === "all_attr"
        ? hero.primary_attr === "all"
        : hero.primary_attr === selectedAttr);

    // 3. Role Check
    let matchesRole = true;
    if (selectedRole !== "all") {
      if (selectedRole === "Core") {
        const role = analyzeRole(hero);
        matchesRole = role === "Core" || role === "Flex";
      } else if (selectedRole === "Support") {
        const role = analyzeRole(hero);
        matchesRole = role === "Support" || role === "Flex";
      } else {
        matchesRole = hero.roles.includes(selectedRole);
      }
    }

    return matchesSearch && matchesAttr && matchesRole;
  });

  // Display Logic: Show fewer heroes by default unless searching or filtering
  const isSearching = searchTerm.length > 0;
  const isFiltering = selectedAttr !== "all" || selectedRole !== "all";

  const displayHeroes =
    showAll || isSearching || isFiltering
      ? filteredHeroes
      : filteredHeroes
          .filter((h) => isProMeta(h) || isTrending(h))
          .slice(0, 30); // Show top 30 Meta/Trending initially

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[550px] transition-all duration-500">
      {/* Header / Filter Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col gap-3 sticky top-0 z-20">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
            size={20}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search heroes (e.g. 'AM', 'Pudge')..."
            className="w-full pl-12 pr-12 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-base text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-600 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-slate-600 text-[10px] font-bold border border-slate-800 px-1.5 py-0.5 rounded bg-slate-900/50">
            <Command size={10} /> K
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-hidden pb-1 no-scrollbar">
              {primaryAttrs.map((attr) => (
                <button
                  key={attr.key}
                  onClick={() => setSelectedAttr(attr.key)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                    selectedAttr === attr.key
                      ? "bg-slate-800 border-slate-600 text-white shadow-lg scale-105"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                  }`}
                >
                  <span className={selectedAttr === attr.key ? attr.color : ""}>
                    {attr.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Toggle Show All (Only visible when not searching/filtering) */}
            {!isSearching && !isFiltering && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-auto">
                {showAll ? "All Heroes" : "Top Meta"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-slate-800/50 pt-2">
            {roleFilters.map((role) => (
              <button
                key={role.key}
                onClick={() => setSelectedRole(role.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all border ${
                  selectedRole === role.key
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <role.icon size={12} />
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {displayHeroes.map((hero) => {
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
                  sizes="(max-width: 768px) 33vw, (max-width: 1280px) 20vw, 14vw"
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
                      onClick={() => {
                        onSelectHero(hero, true);
                        setSearchTerm("");
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase tracking-wide transition-colors shadow-lg"
                    >
                      <Plus size={12} strokeWidth={3} /> Pick Us
                    </button>
                    <button
                      onClick={() => {
                        onSelectHero(hero, false);
                        setSearchTerm("");
                      }}
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

        {/* Empty State */}
        {filteredHeroes.length === 0 && (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500">
            <Filter size={32} className="mb-2 opacity-50" />
            <p className="text-xs font-medium">
              No heroes found matching &quot;{searchTerm}&quot;
            </p>
          </div>
        )}

        {/* "Show More" Trigger - Only show if hiding some heroes */}
        {!showAll &&
          !isSearching &&
          !isFiltering &&
          filteredHeroes.length > 30 && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent flex items-end justify-center pb-6 pointer-events-none">
              <button
                onClick={() => setShowAll(true)}
                className="pointer-events-auto flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg transition-all hover:scale-105"
              >
                Show All Heroes <ChevronDown size={14} />
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default HeroGrid;
