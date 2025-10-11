import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
});

export const authorizedClient = (token?: string) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
