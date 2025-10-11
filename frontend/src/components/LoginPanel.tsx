import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { useAuth } from "../context/AuthContext";

export const LoginPanel: React.FC = () => {
  const { setToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      params.append("grant_type", "password");
      const response = await apiClient.post("/auth/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.access_token);
    },
    onError: () => {
      setError("Invalid credentials. Use the API to register a hunter profile.");
    },
  });

  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
      <h1 className="text-3xl font-bold text-white">Solo Leveling Control Room</h1>
      <p className="mt-2 text-sm text-slate-400">Authenticate to access your personal system dashboard.</p>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          mutation.mutate();
        }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Username</label>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Password</label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {mutation.isPending ? "Initializing System..." : "Enter Gate"}
        </button>
      </form>
    </div>
  );
};
