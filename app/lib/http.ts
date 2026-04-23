import axios from "axios";

const normalizeBaseUrl = (value?: string) => {
  if (!value) return undefined;
  return value.replace(/\/+$/, "");
};

const envBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const fallbackBaseUrl = import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "https://api.example.com";

export const http = axios.create({
  baseURL: envBaseUrl ?? fallbackBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
