"use client";

import React from "react";
import { HeroStats, getHeroImageUrl } from "@/lib/dotaApi";
import { X } from "lucide-react";
import Image from "next/image";

interface DraftBoardProps {
  radiantTeam: (HeroStats | null)[];
  direTeam: (HeroStats | null)[];
  onRemoveHero: (team: "radiant" | "dire", index: number) => void;
}

const DraftBoard: React.FC<DraftBoardProps> = ({
  radiantTeam,
  direTeam,
  onRemoveHero,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-green-500 uppercase tracking-[0.3em]">
            Radiant Draft
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-green-500/50 to-transparent ml-4"></div>
        </div>
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {radiantTeam.map((hero, index) => (
            <div
              key={`radiant-${index}`}
              className={`relative group aspect-[16/9] rounded border-2 transition-all duration-300 overflow-hidden ${
                hero 
                  ? "border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] shadow-inner" 
                  : "border-slate-800 bg-slate-900/50"
              }`}
            >
              {hero ? (
                <>
                  <Image
                    src={getHeroImageUrl(hero.img)}
                    alt={hero.localized_name}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => onRemoveHero("radiant", index)}
                    className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 scale-75 group-hover:scale-100"
                  >
                    <X size={10} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/40 to-transparent text-[8px] font-black text-center text-white truncate px-1 py-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    {hero.localized_name}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <div className="w-4 h-4 rounded-full border border-slate-400"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-px flex-1 bg-gradient-to-l from-red-500/50 to-transparent mr-4"></div>
          <h2 className="text-xs font-black text-red-500 uppercase tracking-[0.3em]">
            Dire Draft
          </h2>
        </div>
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {direTeam.map((hero, index) => (
            <div
              key={`dire-${index}`}
              className={`relative group aspect-[16/9] rounded border-2 transition-all duration-300 overflow-hidden ${
                hero 
                  ? "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] shadow-inner" 
                  : "border-slate-800 bg-slate-900/50"
              }`}
            >
              {hero ? (
                <>
                  <Image
                    src={getHeroImageUrl(hero.img)}
                    alt={hero.localized_name}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => onRemoveHero("dire", index)}
                    className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 scale-75 group-hover:scale-100"
                  >
                    <X size={10} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/40 to-transparent text-[8px] font-black text-center text-white truncate px-1 py-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    {hero.localized_name}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <div className="w-4 h-4 rounded-full border border-slate-400"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DraftBoard;
