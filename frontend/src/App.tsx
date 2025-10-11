import React from "react";
import { useAuth } from "./context/AuthContext";
import { LoginPanel } from "./components/LoginPanel";
import { usePlayerData } from "./hooks/usePlayerData";
import { StatCard } from "./components/StatCard";
import { ExperienceBar } from "./components/ExperienceBar";
import { xpRequiredForLevel } from "./utils/leveling";
import { useAnalytics } from "./hooks/useAnalytics";
import { AnalyticsCard } from "./components/AnalyticsCard";
import { useActiveQuests, useCompleteQuest, useDailyQuest } from "./hooks/useQuests";
import { QuestCard } from "./components/QuestCard";

const Loader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
    <p>Synchronizing with the System...</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { setToken } = useAuth();
  const { data: player, isLoading: isPlayerLoading } = usePlayerData();
  const { data: analytics, isLoading: isAnalyticsLoading } = useAnalytics();
  const { data: dailyQuest } = useDailyQuest();
  const { data: activeQuests } = useActiveQuests();
  const completeMutation = useCompleteQuest();

  if (isPlayerLoading || !player || isAnalyticsLoading || !analytics) {
    return <Loader />;
  }

  const xpForNext = xpRequiredForLevel(player.level);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Hunter Dashboard</h1>
            <p className="text-sm text-slate-400">Welcome back, {player.username}. Rank {player.rank} Hunter.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-right">
              <p className="text-xs uppercase tracking-widest text-slate-400">Power Level</p>
              <p className="text-2xl font-semibold text-white">{player.level * 120 + player.strength + player.agility}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-right">
              <p className="text-xs uppercase tracking-widest text-slate-400">Streak</p>
              <p className="text-2xl font-semibold text-white">{player.daily_streak} days</p>
            </div>
            <button
              onClick={() => setToken(null)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-primary hover:text-white"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto mt-10 flex max-w-6xl flex-col gap-10 px-6">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Level" value={player.level} highlight />
          <StatCard label="XP" value={player.xp.toLocaleString()} />
          <StatCard label="Mana" value={player.mana} />
          <StatCard label="Gold" value={player.currency} />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-2 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Core Stats</h2>
              <span className="rounded-full border border-primary/60 px-3 py-1 text-xs uppercase text-primary">
                {player.stat_points} Stat Points Available
              </span>
            </div>
            <ExperienceBar currentXp={player.xp} xpForNext={xpForNext} />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <StatCard label="Strength" value={player.strength} />
              <StatCard label="Agility" value={player.agility} />
              <StatCard label="Intelligence" value={player.intelligence} />
              <StatCard label="Vitality" value={player.vitality} />
              <StatCard label="Sense" value={player.sense} />
              <StatCard label="Best Streak" value={`${player.best_streak} days`} />
            </div>
          </div>
          <AnalyticsCard averageDailyXp={analytics.average_daily_xp} />
        </section>

        {dailyQuest && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Daily Operation</h2>
            <QuestCard
              quest={dailyQuest}
              onComplete={(id) => completeMutation.mutate(id)}
              isCompleting={completeMutation.isPending}
            />
          </section>
        )}

        {activeQuests && activeQuests.length > 1 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Active Missions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeQuests
                .filter((quest) => quest.quest_type !== "daily")
                .map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={(id) => completeMutation.mutate(id)}
                    isCompleting={completeMutation.isPending}
                  />
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const { token } = useAuth();

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950">
        <LoginPanel />
      </div>
    );
  }

  return <Dashboard />;
};

export default App;
