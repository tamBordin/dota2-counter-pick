"use client";

import React from "react";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { HeroStats, getHeroImageUrl } from "@/lib/dotaApi";
import { CounterScore } from "@/lib/counterLogic";

interface AnalysisEngineProps {
  suggestions: {
    cores: CounterScore[];
    supports: CounterScore[];
  };
  allHeroes: HeroStats[];
  onSelectHero: (hero: HeroStats) => void;
}

const AnalysisEngine: React.FC<AnalysisEngineProps> = ({
  suggestions,
  allHeroes,
  onSelectHero,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm p-5 rounded-lg border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
      <h3 className="text-sm font-black mb-5 flex items-center gap-2 text-yellow-500 uppercase tracking-widest">
        <TrendingUp size={18} /> Analysis Engine
      </h3>
      {suggestions.cores.length > 0 || suggestions.supports.length > 0 ? (
        <div className="space-y-6">
          {suggestions.cores.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-2">
                Core Picks
              </h4>
              {suggestions.cores.slice(0, 5).map((s, idx) => {
                const hero = allHeroes.find((h) => h.id === s.heroId);
                if (!hero) return null;
                return (
                  <div
                    key={hero.id}
                    className="flex items-center gap-3 p-2 bg-slate-800/30 rounded border border-white/5 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group"
                    onClick={() => onSelectHero(hero)}
                  >
                    <span className="text-[10px] font-black text-slate-600 w-4">
                      {idx + 1}
                    </span>
                    <div className="relative w-14 aspect-video overflow-hidden rounded shadow-lg border border-slate-700">
                      <Image
                        src={getHeroImageUrl(hero.img)}
                        fill
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        alt={hero.localized_name}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[11px] font-bold truncate group-hover:text-white transition-colors">
                        {hero.localized_name}
                      </div>
                      <div
                        className={`text-[9px] font-black uppercase tracking-tighter ${s.score > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        +{(s.score * 100).toFixed(1)}% Edge
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {suggestions.supports.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-2">
                Support Picks
              </h4>
              {suggestions.supports.slice(0, 5).map((s, idx) => {
                const hero = allHeroes.find((h) => h.id === s.heroId);
                if (!hero) return null;
                return (
                  <div
                    key={hero.id}
                    className="flex items-center gap-3 p-2 bg-slate-800/30 rounded border border-white/5 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group"
                    onClick={() => onSelectHero(hero)}
                  >
                    <span className="text-[10px] font-black text-slate-600 w-4">
                      {idx + 1}
                    </span>
                    <div className="relative w-14 aspect-video overflow-hidden rounded shadow-lg border border-slate-700">
                      <Image
                        src={getHeroImageUrl(hero.img)}
                        fill
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        alt={hero.localized_name}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[11px] font-bold truncate group-hover:text-white transition-colors">
                        {hero.localized_name}
                      </div>
                      <div
                        className={`text-[9px] font-black uppercase tracking-tighter ${s.score > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        +{(s.score * 100).toFixed(1)}% Edge
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <TrendingUp size={20} className="text-slate-600" />
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest px-4">
            Waiting for enemy picks to analyze
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisEngine;
