import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Quest } from "../hooks/useQuests";

dayjs.extend(relativeTime);

type QuestCardProps = {
  quest: Quest;
  onComplete?: (questId: number) => void;
  isCompleting?: boolean;
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete, isCompleting }) => {
  const deadline = quest.deadline ? dayjs(quest.deadline).fromNow() : "No deadline";
  const isDaily = quest.quest_type === "daily";
  const rewardSummary = `${quest.xp_reward} XP • ${quest.stat_reward} stat pts • ${quest.currency_reward} gold`;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">{quest.quest_type}</p>
          <h3 className="text-xl font-bold text-white">{quest.title}</h3>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase text-slate-300">
          {quest.difficulty} Rank
        </span>
      </div>
      <p className="text-slate-300">{quest.description}</p>
      <div className="flex flex-wrap items-center justify-between text-sm text-slate-400">
        <p>Reward: {rewardSummary}</p>
        <p>Deadline: {deadline}</p>
      </div>
      {onComplete && (
        <button
          onClick={() => onComplete(quest.id)}
          disabled={isCompleting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {isDaily ? "Complete Daily Routine" : "Mark Complete"}
        </button>
      )}
    </div>
  );
};
