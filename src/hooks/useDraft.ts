import { getCategorizedSuggestions } from "@/lib/counterLogic";
import {
  fetchHeroes,
  fetchHeroMatchups,
  HeroStats,
  Matchup,
} from "@/lib/dotaApi";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [userSide, setUserSide] = useState<"radiant" | "dire">("radiant");
  const [activeTeam, setActiveTeam] = useState<"radiant" | "dire">("radiant"); // Used for URL persistence logic maybe, but for UI we now use userSide mostly? No, activeTeam is who we are picking for *right now*

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
        const side = params.get("side") as "radiant" | "dire" | null;

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
        if (side) setUserSide(side);

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

    url.searchParams.set("side", userSide);

    window.history.replaceState({}, "", url.toString());
  }, [radiantTeam, direTeam, userSide, loading]);

  const selectedHeroIds = useMemo(() => {
    return [
      ...radiantTeam.filter((h): h is HeroStats => h !== null).map((h) => h.id),
      ...direTeam.filter((h): h is HeroStats => h !== null).map((h) => h.id),
    ];
  }, [radiantTeam, direTeam]);

  // teamOverride: 'us' | 'enemy' (logical) instead of 'radiant' | 'dire' (absolute)
  // But to keep it compatible with existing Grid UI that might send absolute, let's handle both or refactor Grid.
  // Actually, Grid sends 'radiant' or 'dire' based on current "Active Team" in the old logic.
  // NEW LOGIC: Grid will say "Pick for US" or "Pick for ENEMY".
  // Let's change the signature to be logical.
  const handleSelectHero = useCallback(async (
    hero: HeroStats,
    isForUserTeam: boolean, // true = pick for 'us', false = pick for 'enemy'
  ) => {

    // Determine target absolute team
    let targetTeamKey: "radiant" | "dire";

    if (isForUserTeam) {
      targetTeamKey = userSide;
    } else {
      targetTeamKey = userSide === "radiant" ? "dire" : "radiant";
    }

    const currentTeam = targetTeamKey === "radiant" ? radiantTeam : direTeam;
    const emptySlotIndex = currentTeam.findIndex((h) => h === null);

    if (emptySlotIndex !== -1) {
      const newTeam = [...currentTeam];
      newTeam[emptySlotIndex] = hero;

      if (targetTeamKey === "radiant") {
        setRadiantTeam(newTeam);
      } else {
        setDireTeam(newTeam);
      }

      // We don't really need 'activeTeam' state toggle anymore for the UI interaction if we use split hover.
      // But if we want to track "whose turn is it", we could. For now, let's keep it simple.

      if (!matchupsCache[hero.id]) {
        const matchups = await fetchHeroMatchups(hero.id);
        setMatchupsCache((prev) => ({ ...prev, [hero.id]: matchups }));
      }
    }
  }, [userSide, radiantTeam, direTeam, matchupsCache]);

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
    // Enemy is the opposite of userSide
    const enemyTeam = userSide === "radiant" ? direTeam : radiantTeam;
    const myTeam = userSide === "radiant" ? radiantTeam : direTeam;

    const enemies = enemyTeam.filter((h): h is HeroStats => h !== null);

    if (enemies.length === 0) return { cores: [], supports: [] };

    return getCategorizedSuggestions(allHeroes, enemies, matchupsCache, myTeam);
  }, [
    allHeroes,
    radiantTeam,
    direTeam,
    matchupsCache,
    userSide,
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

  const handleSetUserSide = useCallback((side: "radiant" | "dire") => {
    if (side !== userSide) {
      setUserSide(side);
      // Swap teams so "My Team" stays consistent with the user, visually moving across the board
      // actually, if I am Radiant, Radiant is "My Team". 
      // If I switch to Dire, Dire becomes "My Team".
      // If I want the heroes I picked to remain "My Team", they must move from Radiant -> Dire.
      setRadiantTeam(direTeam);
      setDireTeam(radiantTeam);
    }
  }, [userSide, radiantTeam, direTeam]);

  return {
    allHeroes,
    currentPatch,
    radiantTeam,
    direTeam,
    loading,
    userSide,
    setUserSide: handleSetUserSide,
    activeTeam, // Deprecated maybe? Keep for now if Header uses it visually
    setActiveTeam,
    selectedHeroIds,
    handleSelectHero,
    handleRemoveHero,
    clearDraft,
    suggestions,
    teamAdvantage,
  };
}