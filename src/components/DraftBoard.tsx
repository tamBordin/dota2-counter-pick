"use client";

import { HeroStats, getHeroImageUrl } from "@/lib/dotaApi";
import { Swords, X } from "lucide-react";
import Image from "next/image";
import React from "react";

interface DraftBoardProps {
  radiantTeam: (HeroStats | null)[];
  direTeam: (HeroStats | null)[];
  onRemoveHero: (team: "radiant" | "dire", index: number) => void;
}

const TeamSlot = ({
  hero,
  index,
  team,
  onRemove,
}: {
  hero: HeroStats | null;
  index: number;
  team: "radiant" | "dire";
  onRemove: (team: "radiant" | "dire", index: number) => void;
}) => {
  const isRadiant = team === "radiant";
  const borderColor = isRadiant ? "border-green-500/40" : "border-red-500/40";
  const shadowColor = isRadiant ? "shadow-green-500/20" : "shadow-red-500/20";
  const emptyBg = isRadiant ? "bg-green-900/10" : "bg-red-900/10";

  return (
    <div
      className={`relative w-full aspect-[3/4] md:aspect-[4/5] rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
        hero
          ? `${borderColor} ${shadowColor} shadow-lg scale-100`
          : `border-slate-800/60 ${emptyBg} border-dashed`
      }`}
    >
      {hero ? (
        <>
          <Image
            src={getHeroImageUrl(hero.img)}
            alt={hero.localized_name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

          <button
            onClick={() => onRemove(team, index)}
            className="absolute top-1 right-1 p-1.5 bg-black/60 backdrop-blur-md text-white/70 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80 hover:text-white transform translate-y-2 group-hover:translate-y-0"
          >
            <X size={14} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-2 text-center transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <div className="text-[10px] md:text-xs font-bold text-white truncate drop-shadow-md">
              {hero.localized_name}
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
          <div
            className={`w-8 h-8 rounded-full border-2 ${borderColor} flex items-center justify-center`}
          >
            <span
              className={`text-xs font-bold ${isRadiant ? "text-green-500" : "text-red-500"}`}
            >
              {index + 1}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const DraftBoard: React.FC<DraftBoardProps> = ({
  radiantTeam,
  direTeam,
  onRemoveHero,
}) => {
  return (
    <div className="w-full mb-10">
      {/* VS Badge */}
      <div className="flex justify-center mb-6 relative">
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        <div className="relative z-10 bg-[#0a0d14] px-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-xl">
            <Swords size={18} className="text-slate-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-12 lg:gap-20">
        {/* Radiant Side */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-green-500/20">
            <div className="w-2 h-8 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 uppercase tracking-widest">
              Radiant
            </h2>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {radiantTeam.map((hero, index) => (
              <TeamSlot
                key={`radiant-${index}`}
                hero={hero}
                index={index}
                team="radiant"
                onRemove={onRemoveHero}
              />
            ))}
          </div>
        </div>

        {/* Dire Side */}
        <div className="space-y-4 text-right">
          <div className="flex items-center justify-end gap-3 pb-2 border-b border-red-500/20">
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 uppercase tracking-widest">
              Dire
            </h2>
            <div className="w-2 h-8 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {direTeam.map((hero, index) => (
              <TeamSlot
                key={`dire-${index}`}
                hero={hero}
                index={index}
                team="dire"
                onRemove={onRemoveHero}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftBoard;
