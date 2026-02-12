import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchHeroes,
  fetchHeroMatchups,
  HeroStats,
  Matchup,
} from "@/lib/dotaApi";
import { getCategorizedSuggestions } from "@/lib/counterLogic";

export function useDraft() {
  const [allHeroes, setAllHeroes] = useState<HeroStats[]>([]);
  const [currentPatch, setCurrentPatch] = useState<string>("");
  const [radiantTeam, setRadiantTeam] = useState<(HeroStats | null)[]>(
    Array(5).fill(null),
  );
  const [direTeam, setDireTeam] = useState<(HeroStats | null)[]>(
    Array(5).fill(null),
  );
  const [matchupsCache, setMatchupsCache] = useState<Record<number, Matchup[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState<"radiant" | "dire">("radiant");

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        const [heroes, patch] = await Promise.all([
          fetchHeroes(),
          import("@/lib/dotaApi").then((m) => m.fetchCurrentPatch()),
        ]);

        const sortedHeroes = heroes.sort((a, b) =>
          a.localized_name.localeCompare(b.localized_name),
        );
        setAllHeroes(sortedHeroes);
        setCurrentPatch(patch);

        // Load state from URL
        const params = new URLSearchParams(window.location.search);
        const rIds = params.get("r")?.split(",").map(Number) || [];
        const dIds = params.get("d")?.split(",").map(Number) || [];

        const newRadiant = Array(5).fill(null);
        const newDire = Array(5).fill(null);

        rIds.forEach((id, i) => {
          if (i < 5) {
            const h = sortedHeroes.find((hero) => hero.id === id);
            if (h) newRadiant[i] = h;
          }
        });

        dIds.forEach((id, i) => {
          if (i < 5) {
            const h = sortedHeroes.find((hero) => hero.id === id);
            if (h) newDire[i] = h;
          }
        });

        setRadiantTeam(newRadiant);
        setDireTeam(newDire);

        // Pre-fetch matchups for loaded heroes
        const uniqueIds = Array.from(new Set([...rIds, ...dIds]));
        for (const id of uniqueIds) {
          if (id) {
            const matchups = await fetchHeroMatchups(id);
            setMatchupsCache((prev) => ({ ...prev, [id]: matchups }));
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

  // Sync with URL
  useEffect(() => {
    if (loading) return;
    const rIds = radiantTeam
      .filter((h) => h !== null)
      .map((h) => h?.id)
      .join(",");
    const dIds = direTeam
      .filter((h) => h !== null)
      .map((h) => h?.id)
      .join(",");

    const url = new URL(window.location.href);
    if (rIds) url.searchParams.set("r", rIds);
    else url.searchParams.delete("r");
    if (dIds) url.searchParams.set("d", dIds);
    else url.searchParams.delete("d");

    window.history.replaceState({}, "", url.toString());
  }, [radiantTeam, direTeam, loading]);

  const selectedHeroIds = useMemo(() => {
    return [
      ...radiantTeam.filter((h): h is HeroStats => h !== null).map((h) => h.id),
      ...direTeam.filter((h): h is HeroStats => h !== null).map((h) => h.id),
    ];
  }, [radiantTeam, direTeam]);

  const handleSelectHero = useCallback(async (
    hero: HeroStats,
    teamOverride?: "radiant" | "dire",
  ) => {
    const targetTeam = teamOverride || activeTeam;
    const currentTeam = targetTeam === "radiant" ? radiantTeam : direTeam;
    const emptySlotIndex = currentTeam.findIndex((h) => h === null);

    if (emptySlotIndex !== -1) {
      const newTeam = [...currentTeam];
      newTeam[emptySlotIndex] = hero;

      if (targetTeam === "radiant") {
        setRadiantTeam(newTeam);
        setActiveTeam("dire");
      } else {
        setDireTeam(newTeam);
        setActiveTeam("radiant");
      }

      if (!matchupsCache[hero.id]) {
        const matchups = await fetchHeroMatchups(hero.id);
        setMatchupsCache((prev) => ({ ...prev, [hero.id]: matchups }));
      }
    }
  }, [activeTeam, radiantTeam, direTeam, matchupsCache]);

  const handleRemoveHero = useCallback((team: "radiant" | "dire", index: number) => {
    if (team === "radiant") {
      const newTeam = [...radiantTeam];
      newTeam[index] = null;
      setRadiantTeam(newTeam);
    } else {
      const newTeam = [...direTeam];
      newTeam[index] = null;
      setDireTeam(newTeam);
    }
  }, [radiantTeam, direTeam]);

  const clearDraft = useCallback(() => {
    if (confirm("Clear all selections?")) {
      setRadiantTeam(Array(5).fill(null));
      setDireTeam(Array(5).fill(null));
    }
  }, []);

  const suggestions = useMemo(() => {
    const enemies =
      activeTeam === "radiant"
        ? direTeam.filter((h): h is HeroStats => h !== null)
        : radiantTeam.filter((h): h is HeroStats => h !== null);

    const myTeam = activeTeam === "radiant" ? radiantTeam : direTeam;

    if (enemies.length === 0) return { cores: [], supports: [] };

    return getCategorizedSuggestions(allHeroes, enemies, matchupsCache, myTeam);
  }, [
    allHeroes,
    radiantTeam,
    direTeam,
    matchupsCache,
    activeTeam,
  ]);

  const teamAdvantage = useMemo(() => {
    const radiantHeroes = radiantTeam.filter((h): h is HeroStats => h !== null);
    const direHeroes = direTeam.filter((h): h is HeroStats => h !== null);
    if (radiantHeroes.length === 0 || direHeroes.length === 0) return 0;

    let totalAdvantage = 0;
    radiantHeroes.forEach((r) => {
      const matchups = matchupsCache[r.id] || [];
      direHeroes.forEach((d) => {
        const m = matchups.find((match) => match.hero_id === d.id);
        if (m) totalAdvantage += 0.5 - m.wins / m.games_played;
      });
    });
    return totalAdvantage / (radiantHeroes.length * direHeroes.length);
  }, [radiantTeam, direTeam, matchupsCache]);

  return {
    allHeroes,
    currentPatch,
    radiantTeam,
    direTeam,
    loading,
    activeTeam,
    setActiveTeam,
    selectedHeroIds,
    handleSelectHero,
    handleRemoveHero,
    clearDraft,
    suggestions,
    teamAdvantage,
  };
}
