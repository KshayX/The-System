import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authorizedClient } from "../api/client";
import { useAuth } from "../context/AuthContext";

export type Quest = {
  id: number;
  title: string;
  description: string;
  quest_type: "daily" | "penalty" | "emergency" | "story";
  status: "active" | "completed" | "failed";
  difficulty: string;
  xp_reward: number;
  stat_reward: number;
  loot_box_reward: boolean;
  currency_reward: number;
  deadline?: string | null;
  started_at: string;
  completed_at?: string | null;
};

export const useActiveQuests = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["quests", "active"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const response = await authorizedClient(token).get<Quest[]>("/quests/active");
      return response.data;
    },
    enabled: !!token,
  });
};

export const useCompleteQuest = () => {
  const { token } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (questId: number) => {
      if (!token) throw new Error("Not authenticated");
      const response = await authorizedClient(token).post(`/quests/${questId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["quests"] });
      client.invalidateQueries({ queryKey: ["player"] });
      client.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useDailyQuest = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["quests", "daily"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const response = await authorizedClient(token).get<Quest>("/quests/daily");
      return response.data;
    },
    enabled: !!token,
  });
};
