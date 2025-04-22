import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4848/api/v1",
  withCredentials: true,    // ← send & receive httpOnly cookies
});

export default api;
    