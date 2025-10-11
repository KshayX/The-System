import { useQuery } from "@tanstack/react-query";
import { authorizedClient } from "../api/client";
import { useAuth } from "../context/AuthContext";

export const usePlayerData = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["player"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const client = authorizedClient(token);
      const response = await client.get("/players/me");
      return response.data as PlayerResponse;
    },
    enabled: !!token,
  });
};

export type PlayerResponse = {
  id: number;
  username: string;
  level: number;
  xp: number;
  stat_points: number;
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  sense: number;
  mana: number;
  currency: number;
  daily_streak: number;
  best_streak: number;
  rank: string;
  class_name?: string | null;
};
