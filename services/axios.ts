/// <reference types="vite/client" />
import axios from "axios";
import { clearSessionValidation } from "../utils/authSession";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

axios.defaults.baseURL = BASE_URL;

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("authToken");
};

// Set token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
  // Update axios default header
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Remove token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  clearSessionValidation();
  delete axios.defaults.headers.common["Authorization"];
};

// Set initial token if exists
const token = getToken();
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Request interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;

    // 429 Too Many Requests — /admin/login မဟုတ်လျှင် Retry-After (≤ 10s) အတိုင်း သို့မဟုတ် 2s/4s ဖြင့် ၂ ကြိမ်အထိ ပြန်ကြိုးစားမည်
    const MAX_RETRY_WAIT_MS = 10000;
    const isLoginRequest =
      typeof config?.url === "string" && config.url.includes("/admin/login");

    if (error.response?.status === 429 && config && !isLoginRequest) {
      config._retryCount = config._retryCount || 0;
      if (config._retryCount < 2) {
        const retryAfterHeader = error.response.headers?.["retry-after"];
        const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;

        let delay: number;
        if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
          const retryAfterMs = retryAfterSeconds * 1000;
          // Retry-After သည် ၁၀ စက္ကန့်ထက် များနေပါက retry မလုပ်ဘဲ ချက်ချင်း error ပြန်ပေးမည်
          if (retryAfterMs > MAX_RETRY_WAIT_MS) {
            return Promise.reject(error);
          }
          delay = retryAfterMs;
        } else {
          // Retry-After မရှိလျှင် ယခုအတိုင်း 2s, 4s
          delay = (config._retryCount + 1) * 2000;
        }

        config._retryCount += 1;
        await new Promise((r) => setTimeout(r, delay));
        return axios(config);
      }
    }

    if (error.response?.status === 401) {
      removeAuthToken();
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
