"use client";

import { getPositionTopHeroes, PositionHeroEntry } from "@/lib/counterLogic";
import { getHeroImageUrl, HeroStats } from "@/lib/dotaApi";
import { BarChart2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type PositionId = 1 | 2 | 3 | 4 | 5;

interface PositionConfig {
  id: PositionId;
  label: string;
  short: string;
  posLabel: string;
  activeTab: string;
  accentBar: string;
  textAccent: string;
  wrHighColor: string;
  wrHighBg: string;
}

const POSITION_CONFIGS: PositionConfig[] = [
  {
    id: 1,
    label: "Safelane Carry",
    short: "Carry",
    posLabel: "Pos 1",
    activeTab:
      "bg-emerald-600/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
    accentBar: "bg-emerald-500",
    textAccent: "text-emerald-400",
    wrHighColor: "text-emerald-400",
    wrHighBg: "bg-emerald-900/20",
  },
  {
    id: 2,
    label: "Midlane",
    short: "Mid",
    posLabel: "Pos 2",
    activeTab:
      "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
    accentBar: "bg-blue-500",
    textAccent: "text-blue-400",
    wrHighColor: "text-blue-400",
    wrHighBg: "bg-blue-900/20",
  },
  {
    id: 3,
    label: "Offlane",
    short: "Offlane",
    posLabel: "Pos 3",
    activeTab:
      "bg-rose-600/20 border-rose-500/50 text-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.2)]",
    accentBar: "bg-rose-500",
    textAccent: "text-rose-400",
    wrHighColor: "text-rose-400",
    wrHighBg: "bg-rose-900/20",
  },
  {
    id: 4,
    label: "Soft Support",
    short: "Pos 4",
    posLabel: "Pos 4",
    activeTab:
      "bg-purple-600/20 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.2)]",
    accentBar: "bg-purple-500",
    textAccent: "text-purple-400",
    wrHighColor: "text-purple-400",
    wrHighBg: "bg-purple-900/20",
  },
  {
    id: 5,
    label: "Hard Support",
    short: "Pos 5",
    posLabel: "Pos 5",
    activeTab:
      "bg-cyan-600/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]",
    accentBar: "bg-cyan-500",
    textAccent: "text-cyan-400",
    wrHighColor: "text-cyan-400",
    wrHighBg: "bg-cyan-900/20",
  },
];

function PositionHeroRow({
  entry,
  rank,
  config,
}: {
  entry: PositionHeroEntry;
  rank: number;
  config: PositionConfig;
}) {
  const { hero, winRate, picks } = entry;

  const winRateClass =
    winRate >= 52
      ? `${config.wrHighColor} ${config.wrHighBg}`
      : winRate >= 50
        ? "text-green-400 bg-green-900/20"
        : "text-red-400 bg-red-900/20";

  return (
    <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded border border-white/5 hover:border-slate-600/50 hover:bg-slate-800/60 transition-all">
      <span
        className={`text-[11px] font-black w-5 text-center shrink-0 ${
          rank <= 3 ? config.textAccent : "text-slate-600"
        }`}
      >
        {rank}
      </span>

      <div className="relative w-12 aspect-video overflow-hidden rounded shadow-lg border border-slate-700 shrink-0">
        <Image
          src={getHeroImageUrl(hero.img)}
          fill
          className="object-cover"
          alt={hero.localized_name}
          sizes="48px"
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="text-[11px] font-bold text-slate-200 truncate">
          {hero.localized_name}
        </div>
        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
          {picks.toLocaleString()} picks
        </div>
      </div>

      <div
        className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${winRateClass}`}
      >
        {winRate.toFixed(1)}%
      </div>
    </div>
  );
}

interface PositionMetaProps {
  heroes: HeroStats[];
}

export default function PositionMeta({ heroes }: PositionMetaProps) {
  const [selectedPos, setSelectedPos] = useState<PositionId>(1);

  const config = POSITION_CONFIGS.find((p) => p.id === selectedPos)!;

  const topHeroes = useMemo(
    () => getPositionTopHeroes(heroes, selectedPos),
    [heroes, selectedPos],
  );

  return (
    <div className="mt-8 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
      <div
        className={`absolute top-0 left-0 w-1 h-full ${config.accentBar} transition-colors duration-300`}
      />

      <div className="px-6 pt-5 pb-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-200">
            <BarChart2 size={16} className={config.textAccent} />
            Position Meta
            <span className={`text-xs font-bold ${config.textAccent}`}>
              — {config.label}
            </span>
          </h2>
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest hidden sm:block">
            Min 500 picks · Win Rate
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {POSITION_CONFIGS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => setSelectedPos(pos.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                selectedPos === pos.id
                  ? pos.activeTab
                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              <span className="opacity-60 font-bold">{pos.posLabel}</span>
              {pos.short}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {topHeroes.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs font-bold uppercase tracking-widest">
            No data available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {topHeroes.map((entry, idx) => (
              <PositionHeroRow
                key={entry.hero.id}
                entry={entry}
                rank={idx + 1}
                config={config}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
