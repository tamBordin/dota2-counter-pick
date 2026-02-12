"use client";

import DraftBoard from "@/components/DraftBoard";
import HeroGrid from "@/components/HeroGrid";
import TeamAnalyzer from "@/components/TeamAnalyzer";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import AnalysisEngine from "@/components/AnalysisEngine";
import { Loader2, RefreshCw } from "lucide-react";
import { useDraft } from "@/hooks/useDraft";

export default function CounterPickPage() {
  const {
    allHeroes,
    currentPatch,
    radiantTeam,
    direTeam,
    loading,
    userSide,
    setUserSide,
    selectedHeroIds,
    handleSelectHero,
    handleRemoveHero,
    clearDraft,
    suggestions,
    teamAdvantage,
  } = useDraft();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-white">
        <div className="relative w-24 h-24 mb-8">
          <Loader2
            className="animate-spin text-blue-500 absolute inset-0"
            size={96}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
        <p className="text-xl font-bold tracking-[0.2em] text-blue-100 animate-pulse uppercase">
          Syncing Data Feed
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0d14] bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-[#0a0d14] text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AppHeader
          currentPatch={currentPatch}
          teamAdvantage={teamAdvantage}
          userSide={userSide}
          setUserSide={setUserSide}
          clearDraft={clearDraft}
        />

        <DraftBoard
          radiantTeam={radiantTeam}
          direTeam={direTeam}
          onRemoveHero={handleRemoveHero}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 mb-8">
          <TeamAnalyzer
            team={radiantTeam}
            label="Radiant"
            color="text-green-500"
          />
          <TeamAnalyzer team={direTeam} label="Dire" color="text-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <RefreshCw size={14} className="text-blue-500" /> Choose Your
                Heroes
              </h3>
            </div>
            <HeroGrid
              heroes={allHeroes}
              onSelectHero={handleSelectHero}
              selectedHeroIds={selectedHeroIds}
            />
          </div>

          <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
            <AnalysisEngine
              suggestions={suggestions}
              allHeroes={allHeroes}
              onSelectHero={(hero) => handleSelectHero(hero, true)} // Suggestion click always picks for 'Us'
            />
          </div>
        </div>

        <AppFooter />
      </div>
    </main>
  );
}
