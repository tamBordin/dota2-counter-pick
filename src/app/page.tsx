'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchHeroes, fetchHeroMatchups, HeroStats, Matchup, getHeroImageUrl } from '@/lib/dotaApi';
import { calculateAdvantage } from '@/lib/counterLogic';
import HeroGrid from '@/components/HeroGrid';
import DraftBoard from '@/components/DraftBoard';
import TeamAnalyzer from '@/components/TeamAnalyzer';
import { Loader2, TrendingUp, Trash2, RefreshCw } from 'lucide-react';

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
      try {
        const [heroes, patch] = await Promise.all([
          fetchHeroes(),
          import('@/lib/dotaApi').then(m => m.fetchCurrentPatch())
        ]);
        
        const sortedHeroes = heroes.sort((a, b) => a.localized_name.localeCompare(b.localized_name));
        setAllHeroes(sortedHeroes);
        setCurrentPatch(patch);

        const params = new URLSearchParams(window.location.search);
        const rIds = params.get('r')?.split(',').map(Number) || [];
        const dIds = params.get('d')?.split(',').map(Number) || [];

        const newRadiant = Array(5).fill(null);
        const newDire = Array(5).fill(null);

        rIds.forEach((id, i) => {
          if (i < 5) {
            const h = sortedHeroes.find(hero => hero.id === id);
            if (h) newRadiant[i] = h;
          }
        });

        dIds.forEach((id, i) => {
          if (i < 5) {
            const h = sortedHeroes.find(hero => hero.id === id);
            if (h) newDire[i] = h;
          }
        });

        setRadiantTeam(newRadiant);
        setDireTeam(newDire);

        const uniqueIds = Array.from(new Set([...rIds, ...dIds]));
        for (const id of uniqueIds) {
          if (id) {
            const matchups = await fetchHeroMatchups(id);
            setMatchupsCache(prev => ({ ...prev, [id]: matchups }));
          }
        }

      } catch (error) {
        console.error("Initialization failed", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    const rIds = radiantTeam.filter(h => h !== null).map(h => h?.id).join(',');
    const dIds = direTeam.filter(h => h !== null).map(h => h?.id).join(',');
    
    const url = new URL(window.location.href);
    if (rIds) url.searchParams.set('r', rIds); else url.searchParams.delete('r');
    if (dIds) url.searchParams.set('d', dIds); else url.searchParams.delete('d');
    
    window.history.replaceState({}, '', url.toString());
  }, [radiantTeam, direTeam, loading]);

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

  const clearDraft = () => {
    if (confirm("Clear all selections?")) {
      setRadiantTeam(Array(5).fill(null));
      setDireTeam(Array(5).fill(null));
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
        if (m) totalAdvantage += (0.5 - (m.wins / m.games_played));
      });
    });
    return totalAdvantage / (radiantHeroes.length * direHeroes.length);
  }, [radiantTeam, direTeam, matchupsCache]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-white">
        <div className="relative w-24 h-24 mb-8">
          <Loader2 className="animate-spin text-blue-500 absolute inset-0" size={96} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
        <p className="text-xl font-bold tracking-[0.2em] text-blue-100 animate-pulse uppercase">Syncing Data Feed</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0d14] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-[#0a0d14] text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Live Dataflow</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 max-w-md w-full px-4 lg:px-12">
            <div className="flex justify-between text-[10px] uppercase font-black mb-1.5 tracking-widest">
              <span className="text-green-500">Radiant</span>
              <span className="text-slate-400">Win Probability</span>
              <span className="text-red-500">Dire</span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-sm border border-slate-800 p-[1px] flex relative group">
              <div 
                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                style={{ width: `${50 + (teamAdvantage * 100)}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-black text-white border border-white/10">
                  {Math.abs(teamAdvantage * 100).toFixed(1)}% {teamAdvantage >= 0 ? 'Radiant' : 'Dire'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 p-1 rounded border border-slate-800 shadow-inner">
              <button 
                onClick={() => setActiveTeam('radiant')}
                className={`px-4 py-1.5 rounded text-xs font-black transition-all uppercase tracking-widest ${activeTeam === 'radiant' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Radiant
              </button>
              <button 
                onClick={() => setActiveTeam('dire')}
                className={`px-4 py-1.5 rounded text-xs font-black transition-all uppercase tracking-widest ${activeTeam === 'dire' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-slate-300'}`}
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

        <DraftBoard 
          radiantTeam={radiantTeam} 
          direTeam={direTeam} 
          onRemoveHero={handleRemoveHero} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 mb-8">
          <TeamAnalyzer team={radiantTeam} label="Radiant" color="text-green-500" />
          <TeamAnalyzer team={direTeam} label="Dire" color="text-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <RefreshCw size={14} className="text-blue-500" /> Choose Your Heroes
              </h3>
            </div>
            <HeroGrid 
              heroes={allHeroes} 
              onSelectHero={handleSelectHero} 
              selectedHeroIds={selectedHeroIds} 
            />
          </div>

          <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
            <div className="bg-slate-900/80 backdrop-blur-sm p-5 rounded-lg border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
              <h3 className="text-sm font-black mb-5 flex items-center gap-2 text-yellow-500 uppercase tracking-widest">
                <TrendingUp size={18} /> Analysis Engine
              </h3>
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((s, idx) => {
                    const hero = allHeroes.find(h => h.id === s.heroId);
                    if (!hero) return null;
                    return (
                      <div 
                        key={hero.id} 
                        className="flex items-center gap-3 p-2 bg-slate-800/30 rounded border border-white/5 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group" 
                        onClick={() => handleSelectHero(hero)}
                      >
                        <span className="text-[10px] font-black text-slate-600 w-4">{idx + 1}</span>
                        <div className="relative w-14 aspect-[16/9] overflow-hidden rounded shadow-lg border border-slate-700">
                          <img src={getHeroImageUrl(hero.img)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-[11px] font-bold truncate group-hover:text-white transition-colors">{hero.localized_name}</div>
                          <div className={`text-[9px] font-black uppercase tracking-tighter ${s.score > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            +{ (s.score * 100).toFixed(1) }% Edge
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-800 pb-8 text-center space-y-4">
          <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>Data from OpenDota API</span>
            <span>Images by Valve Corporation</span>
          </div>
          <p className="max-w-2xl mx-auto text-[9px] text-slate-600 leading-relaxed uppercase">
            Dota 2 is a registered trademark of Valve Corporation. This site is not affiliated with or endorsed by Valve. 
            All game assets, images, and names are the property of their respective owners. 
            Built for the community with love.
          </p>
        </footer>
      </div>
    </main>
  );
}
