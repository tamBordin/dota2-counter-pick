'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchHeroes, fetchHeroMatchups, HeroStats, Matchup, getHeroImageUrl } from '@/lib/dotaApi';
import { calculateAdvantage, CounterScore } from '@/lib/counterLogic';
import HeroGrid from '@/components/HeroGrid';
import DraftBoard from '@/components/DraftBoard';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

export default function CounterPickPage() {
  const [allHeroes, setAllHeroes] = useState<HeroStats[]>([]);
  const [currentPatch, setCurrentPatch] = useState<string>('');
  const [radiantTeam, setRadiantTeam] = useState<(HeroStats | null)[]>(Array(5).fill(null));
  const [direTeam, setDireTeam] = useState<(HeroStats | null)[]>(Array(5).fill(null));
  const [matchupsCache, setMatchupsCache] = useState<Record<number, Matchup[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState<'radiant' | 'dire'>('radiant');

  useEffect(() => {
    const init = async () => {
      const [heroes, patch] = await Promise.all([
        fetchHeroes(),
        import('@/lib/dotaApi').then(m => m.fetchCurrentPatch())
      ]);
      
      setAllHeroes(heroes.sort((a, b) => a.localized_name.localeCompare(b.localized_name)));
      setCurrentPatch(patch);
      setLoading(false);
    };
    init();
  }, []);

  const selectedHeroIds = useMemo(() => {
    return [
      ...radiantTeam.filter((h): h is HeroStats => h !== null).map(h => h.id),
      ...direTeam.filter((h): h is HeroStats => h !== null).map(h => h.id),
    ];
  }, [radiantTeam, direTeam]);

  const handleSelectHero = async (hero: HeroStats, teamOverride?: 'radiant' | 'dire') => {
    const targetTeam = teamOverride || activeTeam;
    const currentTeam = targetTeam === 'radiant' ? radiantTeam : direTeam;
    const emptySlotIndex = currentTeam.findIndex(h => h === null);

    if (emptySlotIndex !== -1) {
      const newTeam = [...currentTeam];
      newTeam[emptySlotIndex] = hero;
      
      if (targetTeam === 'radiant') setRadiantTeam(newTeam);
      else setDireTeam(newTeam);

      // Fetch matchups for the selected hero if not in cache
      if (!matchupsCache[hero.id]) {
        const matchups = await fetchHeroMatchups(hero.id);
        setMatchupsCache(prev => ({ ...prev, [hero.id]: matchups }));
      }
    }
  };

  const handleRemoveHero = (team: 'radiant' | 'dire', index: number) => {
    if (team === 'radiant') {
      const newTeam = [...radiantTeam];
      newTeam[index] = null;
      setRadiantTeam(newTeam);
    } else {
      const newTeam = [...direTeam];
      newTeam[index] = null;
      setDireTeam(newTeam);
    }
  };

  const suggestions = useMemo(() => {
    const enemies = activeTeam === 'radiant' 
      ? direTeam.filter((h): h is HeroStats => h !== null)
      : radiantTeam.filter((h): h is HeroStats => h !== null);

    if (enemies.length === 0) return [];

    return calculateAdvantage(allHeroes, enemies, matchupsCache)
      .filter(s => !selectedHeroIds.includes(s.heroId))
      .slice(0, 10);
  }, [allHeroes, radiantTeam, direTeam, matchupsCache, activeTeam, selectedHeroIds]);

  const teamAdvantage = useMemo(() => {
    const radiantHeroes = radiantTeam.filter((h): h is HeroStats => h !== null);
    const direHeroes = direTeam.filter((h): h is HeroStats => h !== null);
    
    if (radiantHeroes.length === 0 || direHeroes.length === 0) return 0;
    
    let totalAdvantage = 0;
    
    radiantHeroes.forEach(r => {
      const matchups = matchupsCache[r.id] || [];
      direHeroes.forEach(d => {
        const m = matchups.find(match => match.hero_id === d.id);
        if (m) {
          // If Radiant hero R wins against Dire hero D
          totalAdvantage += (0.5 - (m.wins / m.games_played));
        }
      });
    });
    
    return totalAdvantage / (radiantHeroes.length * direHeroes.length);
  }, [radiantTeam, direTeam, matchupsCache]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-xl animate-pulse">Loading Dota 2 Data...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-800 pb-4 gap-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black italic tracking-tighter text-white">
              DOTA 2 <span className="text-red-600">COUNTER</span> PICK
            </h1>
            {currentPatch && (
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                  Patch {currentPatch}
                </span>
                <span className="text-[10px] text-slate-500 italic">Updated Data</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 max-w-md w-full px-8">
            <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
              <span className="text-green-500">Radiant Advantage</span>
              <span className="text-red-500">Dire Advantage</span>
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex relative">
              <div 
                className="h-full bg-green-600 transition-all duration-500" 
                style={{ width: `${50 + (teamAdvantage * 100)}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                {Math.abs(teamAdvantage * 100).toFixed(1)}% {teamAdvantage >= 0 ? 'Radiant' : 'Dire'}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTeam('radiant')}
              className={`px-4 py-2 rounded font-bold transition-all ${activeTeam === 'radiant' ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-slate-800 text-slate-400'}`}
            >
              Radiant
            </button>
            <button 
              onClick={() => setActiveTeam('dire')}
              className={`px-4 py-2 rounded font-bold transition-all ${activeTeam === 'dire' ? 'bg-red-600 text-white ring-2 ring-red-400' : 'bg-slate-800 text-slate-400'}`}
            >
              Dire
            </button>
          </div>
        </header>

        <DraftBoard 
          radiantTeam={radiantTeam} 
          direTeam={direTeam} 
          onRemoveHero={handleRemoveHero} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Select Hero
            </h3>
            <HeroGrid 
              heroes={allHeroes} 
              onSelectHero={handleSelectHero} 
              selectedHeroIds={selectedHeroIds} 
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-500">
                <TrendingUp size={20} /> Suggested Picks
              </h3>
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((s, idx) => {
                    const hero = allHeroes.find(h => h.id === s.heroId);
                    if (!hero) return null;
                    return (
                      <div key={hero.id} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors cursor-pointer group" onClick={() => handleSelectHero(hero)}>
                        <span className="text-xs text-slate-500 w-4">{idx + 1}.</span>
                        <img src={getHeroImageUrl(hero.img)} className="w-12 aspect-[16/9] object-cover rounded shadow" alt="" />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-medium truncate group-hover:text-white">{hero.localized_name}</div>
                          <div className={`text-[10px] ${s.score > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            Adv: {(s.score * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-8">
                  Pick enemy heroes to see suggestions
                </p>
              )}
            </div>
            
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">How it works</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We analyze Real-time data from OpenDota API. When you pick enemy heroes, we calculate which heroes have the highest win rate against them in the current patch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}