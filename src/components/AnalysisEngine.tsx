"use client";

import { CounterScore, CounterType } from "@/lib/counterLogic";
import {
  HeroStats,
  getHeroImageUrl,
  getHeroWinRate,
  getItemImageUrl,
  isProMeta,
  isTrending,
} from "@/lib/dotaApi";
import { CounterItem } from "@/data/items";
import {
  AlertTriangle,
  Flame,
  Star,
  Target,
  TrendingUp,
  Trophy,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import React from "react";

interface AnalysisEngineProps {
  suggestions: {
    cores: CounterScore[];
    supports: CounterScore[];
    items: CounterItem[];
  };
  allHeroes: HeroStats[];
  onSelectHero: (hero: HeroStats) => void;
}

const CounterTypeBadge = ({ type }: { type: CounterType }) => {
  switch (type) {
    case "Meta":
      return (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[8px] font-black text-purple-300 uppercase tracking-tighter"
          title="Meta Pick: High Win Rate & Advantage"
        >
          <Star size={8} className="fill-current" /> META
        </div>
      );
    case "Specialist":
      return (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[8px] font-black text-blue-300 uppercase tracking-tighter"
          title="Specialist: Hard Counter"
        >
          <Target size={8} /> SPEC
        </div>
      );
    case "Situational":
      return (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-[8px] font-black text-orange-300 uppercase tracking-tighter"
          title="Situational: Extreme Advantage"
        >
          <AlertTriangle size={8} /> SITU
        </div>
      );
    default:
      return null;
  }
};

const SuggestionItem = ({
  hero,
  suggestion, // Pass the full suggestion object
  idx,
  onSelect,
}: {
  hero: HeroStats;
  suggestion: CounterScore;
  idx: number;
  onSelect: () => void;
}) => {
  const isPro = isProMeta(hero);
  const isHot = isTrending(hero);
  const winRate = getHeroWinRate(hero);

  return (
    <div
      className="flex items-center gap-3 p-2 bg-slate-800/30 rounded border border-white/5 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group relative overflow-hidden"
      onClick={onSelect}
    >
      {/* Advantage Bar Background */}
      <div
        className="absolute left-0 bottom-0 top-0 bg-gradient-to-r from-blue-500/5 to-transparent transition-all duration-500"
        style={{ width: `${Math.min(suggestion.score * 500, 100)}%` }} // Visual indicator of advantage strength
      ></div>

      <span className="text-[10px] font-black text-slate-600 w-4 relative z-10">
        {idx + 1}
      </span>
      <div className="relative w-12 aspect-video overflow-hidden rounded shadow-lg border border-slate-700 z-10">
        <Image
          src={getHeroImageUrl(hero.img)}
          fill
          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          alt={hero.localized_name}
        />
      </div>
      <div className="flex-1 overflow-hidden relative z-10">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="text-[11px] font-bold truncate group-hover:text-white transition-colors">
              {hero.localized_name}
            </div>
            {isPro && <Trophy size={10} className="text-yellow-500" />}
            {isHot && <Flame size={10} className="text-orange-500" />}
          </div>
          <CounterTypeBadge type={suggestion.counterType} />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={`text-[9px] font-black uppercase tracking-tighter ${suggestion.score > 0 ? "text-green-500" : "text-red-500"}`}
            >
              +{(suggestion.score * 100).toFixed(1)}%
            </div>
            <div className="text-[8px] text-slate-500 font-bold uppercase">
              Advantage
            </div>
          </div>

          <div
            className={`text-[8px] font-bold px-1 rounded ${winRate >= 50 ? "text-green-400 bg-green-900/30" : "text-red-400 bg-red-900/30"}`}
          >
            {winRate.toFixed(1)}% WR
          </div>
        </div>
      </div>
    </div>
  );
};

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
          {/* Item Recommendations */}
          {suggestions.items && suggestions.items.length > 0 && (
            <div className="space-y-3 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
              <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} /> Essential Counter Items
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded border border-white/5"
                    title={item.reason}
                  >
                    <div className="relative w-8 h-6 overflow-hidden rounded border border-slate-700 shrink-0">
                      <Image
                        src={getItemImageUrl(item.id)}
                        fill
                        className="object-cover"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-bold text-slate-200 truncate leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[7px] text-slate-500 truncate uppercase font-bold tracking-tighter">
                        {item.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.cores.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-2">
                Core Picks
              </h4>
              {suggestions.cores.slice(0, 5).map((s, idx) => {
                const hero = allHeroes.find((h) => h.id === s.heroId);
                if (!hero) return null;
                return (
                  <SuggestionItem
                    key={hero.id}
                    hero={hero}
                    suggestion={s}
                    idx={idx}
                    onSelect={() => onSelectHero(hero)}
                  />
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
                  <SuggestionItem
                    key={hero.id}
                    hero={hero}
                    suggestion={s}
                    idx={idx}
                    onSelect={() => onSelectHero(hero)}
                  />
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
