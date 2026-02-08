"use client";

import { HeroStats, getHeroImageUrl } from "@/lib/dotaApi";
import { X } from "lucide-react";
import React from "react";

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
    <div className="grid grid-cols-2 gap-8 mb-8">
      {/* Radiant Team */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-green-500 text-center uppercase tracking-widest">
          Radiant
        </h2>
        <div className="flex justify-between gap-2">
          {radiantTeam.map((hero, index) => (
            <div
              key={`radiant-${index}`}
              className="relative group w-full aspect-[16/9] bg-slate-800 rounded border-2 border-green-900/30 overflow-hidden"
            >
              {hero ? (
                <>
                  <img
                    src={getHeroImageUrl(hero.img)}
                    alt={hero.localized_name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onRemoveHero("radiant", index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center text-white truncate px-1">
                    {hero.localized_name}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                  Slot {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dire Team */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-red-500 text-center uppercase tracking-widest">
          Dire
        </h2>
        <div className="flex justify-between gap-2">
          {direTeam.map((hero, index) => (
            <div
              key={`dire-${index}`}
              className="relative group w-full aspect-[16/9] bg-slate-800 rounded border-2 border-red-900/30 overflow-hidden"
            >
              {hero ? (
                <>
                  <img
                    src={getHeroImageUrl(hero.img)}
                    alt={hero.localized_name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onRemoveHero("dire", index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center text-white truncate px-1">
                    {hero.localized_name}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                  Slot {index + 1}
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
