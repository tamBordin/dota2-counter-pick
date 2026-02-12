"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface AppHeaderProps {
  currentPatch: string;
  teamAdvantage: number;
  activeTeam: "radiant" | "dire";
  setActiveTeam: (team: "radiant" | "dire") => void;
  clearDraft: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  currentPatch,
  teamAdvantage,
  activeTeam,
  setActiveTeam,
  clearDraft,
}) => {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-center mb-8 border-b border-slate-800/50 pb-6 gap-6">
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
        <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          DOTA 2 <span className="text-red-600">COUNTER</span> PICK
        </h1>
        {currentPatch && (
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold rounded uppercase tracking-tighter">
              Ver {currentPatch}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Live Dataflow
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 max-w-md w-full px-4 lg:px-12">
        <div className="flex justify-between text-[10px] uppercase font-black mb-1.5 tracking-widest">
          <span className="text-green-500">Radiant</span>
          <span className="text-slate-400">Win Probability</span>
          <span className="text-red-500">Dire</span>
        </div>
        <div className="h-3 w-full bg-slate-900 rounded-sm border border-slate-800 p-px flex relative group">
          <div
            className="h-full bg-linear-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]"
            style={{ width: `${50 + teamAdvantage * 100}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-black text-white border border-white/10">
              {Math.abs(teamAdvantage * 100).toFixed(1)}%{" "}
              {teamAdvantage >= 0 ? "Radiant" : "Dire"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-slate-900 p-1 rounded border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTeam("radiant")}
            className={`px-4 py-1.5 rounded text-xs font-black transition-all uppercase tracking-widest ${activeTeam === "radiant" ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "text-slate-500 hover:text-slate-300"}`}
          >
            Radiant
          </button>
          <button
            onClick={() => setActiveTeam("dire")}
            className={`px-4 py-1.5 rounded text-xs font-black transition-all uppercase tracking-widest ${activeTeam === "dire" ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-slate-500 hover:text-slate-300"}`}
          >
            Dire
          </button>
        </div>
        <button
          onClick={clearDraft}
          className="p-2 bg-slate-900 text-slate-400 hover:text-red-500 border border-slate-800 rounded transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
