"use client";

import { HeroStats, getHeroImageUrl } from "@/lib/dotaApi";
import { Plus } from "lucide-react";
import React, { useState } from "react";

interface HeroGridProps {
  heroes: HeroStats[];
  onSelectHero: (hero: HeroStats, team: "radiant" | "dire") => void;
  selectedHeroIds: number[];
}

const HeroGrid: React.FC<HeroGridProps> = ({
  heroes,
  onSelectHero,
  selectedHeroIds,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    "Carry",
    "Support",
    "Nuker",
    "Disabler",
    "Durable",
    "Escape",
    "Initiator",
    "Pusher",
  ];

  const primaryAttrs = [
    { key: "str", label: "Strength", color: "text-red-500" },
    { key: "agi", label: "Agility", color: "text-green-500" },
    { key: "int", label: "Intelligence", color: "text-blue-400" },
    { key: "all", label: "Universal", color: "text-purple-400" },
  ];

  const filteredHeroes = heroes.filter((hero) => {
    const matchesSearch = hero.localized_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || hero.roles.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-xl border border-slate-800">
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Hero..."
          className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Role Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRole(null)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${
              selectedRole === null
                ? "bg-blue-600 border-blue-400 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
            }`}
          >
            All Roles
          </button>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() =>
                setSelectedRole(role === selectedRole ? null : role)
              }
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${
                selectedRole === role
                  ? "bg-blue-600 border-blue-400 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {primaryAttrs.map((attr) => {
          const attrHeroes = filteredHeroes.filter(
            (h) => h.primary_attr === attr.key,
          );
          if (attrHeroes.length === 0) return null;

          return (
            <div key={attr.key}>
              <h4
                className={`text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${attr.color}`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {attr.label}
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {attrHeroes.map((hero) => {
                  const isSelected = selectedHeroIds.includes(hero.id);
                  return (
                    <div
                      key={hero.id}
                      className={`relative group w-full aspect-[16/9] overflow-hidden rounded border border-slate-700 shadow-lg transition-all duration-200 ${
                        isSelected
                          ? "opacity-20 grayscale scale-95"
                          : "opacity-100"
                      }`}
                    >
                      <img
                        src={getHeroImageUrl(hero.img)}
                        alt={hero.localized_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {!isSelected && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[9px] font-medium text-center text-slate-200 truncate px-1 py-0.5 z-0 group-hover:opacity-0 transition-opacity">
                          {hero.localized_name}
                        </div>
                      )}
                      {!isSelected && (
                        <div className="absolute inset-0 flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div
                            onClick={() => onSelectHero(hero, "radiant")}
                            className="w-1/2 h-full bg-green-600/60 flex flex-col items-center justify-center cursor-pointer hover:bg-green-500/80 transition-colors border-r border-white/10"
                          >
                            <Plus size={16} className="text-white" />
                            <span className="text-[8px] font-bold text-white uppercase">
                              Us
                            </span>
                          </div>
                          <div
                            onClick={() => onSelectHero(hero, "dire")}
                            className="w-1/2 h-full bg-red-600/60 flex flex-col items-center justify-center cursor-pointer hover:bg-red-500/80 transition-colors"
                          >
                            <Plus size={16} className="text-white" />
                            <span className="text-[8px] font-bold text-white uppercase">
                              Enemy
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroGrid;
