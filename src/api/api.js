import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL?.trim() || "https://thesis-backend-mjeh.onrender.com";
const normalizedUrl = rawUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
const baseURL = `${normalizedUrl}/api`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export default api;
