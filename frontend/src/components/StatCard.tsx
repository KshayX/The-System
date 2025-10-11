import React from "react";
import clsx from "clsx";

type StatCardProps = {
  label: string;
  value: number | string;
  highlight?: boolean;
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, highlight }) => {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 shadow-lg",
        highlight && "border-primary/60 bg-primary/20"
      )}
    >
      <p className="text-sm uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
};
