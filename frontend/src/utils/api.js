import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 30000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("crToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally - auto logout
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("crToken");
      localStorage.removeItem("crUser");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth endpoints
export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  profile: () => API.get("/auth/profile"),
  verify: () => API.post("/auth/verify"),
};

// Report endpoints
export const reportAPI = {
  submit: (formData) => API.post("/reports", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  track: (trackingId) => API.get(`/reports/track/${trackingId}`),
  getAll: (params) => API.get("/reports", { params }),
  getById: (id) => API.get(`/reports/${id}`),
  getHistory: (id) => API.get(`/reports/${id}/history`),
  getStats: () => API.get("/reports/stats"),
  update: (id, data) => API.patch(`/reports/${id}`, data),
};

export const escalationAPI = {
  raise: (data) => API.post("/escalate", data)
};

export default API;
