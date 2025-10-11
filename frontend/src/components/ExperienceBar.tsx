import React from "react";

type ExperienceBarProps = {
  currentXp: number;
  xpForNext: number;
};

export const ExperienceBar: React.FC<ExperienceBarProps> = ({ currentXp, xpForNext }) => {
  const percent = Math.min(100, Math.round((currentXp / xpForNext) * 100));
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs uppercase tracking-widest text-slate-400">
        <span>Experience</span>
        <span>
          {currentXp.toLocaleString()} / {xpForNext.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-gradient-to-r from-primary to-purple-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};
