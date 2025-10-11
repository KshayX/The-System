import { useQuery } from "@tanstack/react-query";
import { authorizedClient } from "../api/client";
import { useAuth } from "../context/AuthContext";

export type Analytics = {
  level: number;
  xp: number;
  quests_completed: number;
  quests_failed: number;
  streak: number;
  average_daily_xp: number;
};

export const useAnalytics = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const response = await authorizedClient(token).get<Analytics>("/analytics/me");
      return response.data;
    },
    enabled: !!token,
  });
};
