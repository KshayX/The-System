import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const defaultData = Array.from({ length: 7 }).map((_, index) => ({
  name: `Day ${index + 1}`,
  xp: Math.round(Math.random() * 800 + 200),
}));

type AnalyticsCardProps = {
  averageDailyXp: number;
};

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ averageDailyXp }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase text-slate-400">Weekly XP Trend</p>
          <p className="text-3xl font-bold text-white">{averageDailyXp.toFixed(0)} avg XP</p>
        </div>
      </div>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={defaultData}>
            <defs>
              <linearGradient id="xp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6d28d9" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}xp`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", borderColor: "#312e81", color: "#fff" }}
              formatter={(value) => [`${value} XP`, "XP"]}
            />
            <Area type="monotone" dataKey="xp" stroke="#7c3aed" fill="url(#xp)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
