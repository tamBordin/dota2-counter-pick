"use client";

import { HeroStats, getHeroImageUrl } from "@/lib/dotaApi";
import { Plus, Search } from "lucide-react";
import Image from "next/image";
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
    "Initiator",
  ];

  const primaryAttrs = [
    {
      key: "str",
      label: "Strength",
      color: "text-red-500",
      bg: "bg-red-500/5",
    },
    {
      key: "agi",
      label: "Agility",
      color: "text-green-500",
      bg: "bg-green-500/5",
    },
    {
      key: "int",
      label: "Intelligence",
      color: "text-blue-400",
      bg: "bg-blue-400/5",
    },
    {
      key: "all",
      label: "Universal",
      color: "text-purple-400",
      bg: "bg-purple-400/5",
    },
  ];

  const filteredHeroes = heroes.filter((hero) => {
    const matchesSearch = hero.localized_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || hero.roles.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-lg border border-slate-800 shadow-2xl overflow-hidden">
      <div className="p-4 md:p-6 bg-slate-900/60 border-b border-slate-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search heroes by name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedRole(null)}
              className={`whitespace-nowrap px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-tighter transition-all border ${
                selectedRole === null
                  ? "bg-white text-black border-white"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
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
                className={`whitespace-nowrap px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-tighter transition-all border ${
                  selectedRole === role
                    ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                    : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-10 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
        {primaryAttrs.map((attr) => {
          const attrHeroes = filteredHeroes.filter(
            (h) => h.primary_attr === attr.key,
          );
          if (attrHeroes.length === 0) return null;

          return (
            <div
              key={attr.key}
              className={`p-4 rounded-lg ${attr.bg} border border-white/5`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-1 h-4 rounded-full ${attr.color.replace("text", "bg")}`}
                ></div>
                <h4
                  className={`text-[11px] font-black uppercase tracking-[0.2em] ${attr.color}`}
                >
                  {attr.label}
                </h4>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                {attrHeroes.map((hero) => {
                  const isSelected = selectedHeroIds.includes(hero.id);
                  return (
                    <div
                      key={hero.id}
                      className={`relative group aspect-[16/9] overflow-hidden rounded shadow-xl transition-all duration-300 ${
                        isSelected
                          ? "opacity-10 grayscale scale-90 border-transparent pointer-events-none"
                          : "hover:scale-110 hover:z-20 cursor-pointer border border-white/10"
                      }`}
                    >
                      <Image
                        src={getHeroImageUrl(hero.img)}
                        alt={hero.localized_name}
                        fill
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-1 text-[8px] font-black text-center text-slate-300 truncate uppercase tracking-tighter z-0 group-hover:opacity-0 transition-opacity">
                        {hero.localized_name}
                      </div>

                      <div className="absolute inset-0 flex opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-y-2 group-hover:translate-y-0">
                        <div
                          onClick={() => onSelectHero(hero, "radiant")}
                          className="w-1/2 h-full bg-green-600/80 backdrop-blur-[2px] flex flex-col items-center justify-center hover:bg-green-500 transition-colors border-r border-white/10"
                        >
                          <Plus
                            size={14}
                            className="text-white drop-shadow-lg"
                            strokeWidth={3}
                          />
                          <span className="text-[7px] font-black text-white uppercase mt-1">
                            Pick Us
                          </span>
                        </div>
                        <div
                          onClick={() => onSelectHero(hero, "dire")}
                          className="w-1/2 h-full bg-red-600/80 backdrop-blur-[2px] flex flex-col items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <Plus
                            size={14}
                            className="text-white drop-shadow-lg"
                            strokeWidth={3}
                          />
                          <span className="text-[7px] font-black text-white uppercase mt-1">
                            Pick Em
                          </span>
                        </div>
                      </div>
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
