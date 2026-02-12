"use client";

import { HeroStats } from "@/lib/dotaApi";
import { Activity, Shield, TowerControl as Tower, Zap } from "lucide-react";
import React from "react";

interface TeamAnalyzerProps {
  team: (HeroStats | null)[];
  label: string;
  color: string;
}

const TeamAnalyzer: React.FC<TeamAnalyzerProps> = ({ team, label, color }) => {
  const selectedHeroes = team.filter((h): h is HeroStats => h !== null);

  if (selectedHeroes.length === 0) return null;

  const calculateMetric = (role: string) => {
    return (
      (selectedHeroes.filter((h) => h.roles.includes(role)).length / 5) * 100
    );
  };

  const metrics = [
    {
      label: "Stun/Disable",
      icon: Zap,
      value: calculateMetric("Disabler"),
      color: "bg-yellow-500",
    },
    {
      label: "Durability",
      icon: Shield,
      value: calculateMetric("Durable"),
      color: "bg-red-500",
    },
    {
      label: "Push Potential",
      icon: Tower,
      value: calculateMetric("Pusher"),
      color: "bg-green-500",
    },
    {
      label: "Initiation",
      icon: Activity,
      value: calculateMetric("Initiator"),
      color: "bg-purple-500",
    },
  ];

  const magicHeroes = selectedHeroes.filter((h) =>
    h.roles.includes("Nuker"),
  ).length;
  const physicalHeroes = selectedHeroes.filter(
    (h) => h.attack_type === "Melee" || h.roles.includes("Carry"),
  ).length;
  const total = magicHeroes + physicalHeroes || 1;
  const magicWeight = (magicHeroes / total) * 100;

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
      <h3 className={`text-sm font-bold uppercase tracking-tighter ${color}`}>
        {label} Composition
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
              <span className="flex items-center gap-1">
                <m.icon size={10} /> {m.label}
              </span>
              <span>{Math.round(m.value)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.color} transition-all duration-500`}
                style={{ width: `${m.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-800">
        <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
          <span className="text-blue-400">Magic Dmg</span>
          <span className="text-orange-400">Physical Dmg</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${magicWeight}%` }}
          ></div>
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${100 - magicWeight}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalyzer;
