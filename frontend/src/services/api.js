import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Some services use x-user-id directly
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.user_id) {
        config.headers['x-user-id'] = parsed.user_id;
      }
    } catch (e) {}
  }

  return config;
});


// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post("/api/v1/users/register", data),
  login: (data) => api.post("/api/v1/users/login", data),
};

// Users
export const userAPI = {
  getProfile: (userId) => api.get(`/api/v1/users/${userId}`),
};
export const mediaAPI = {
  upload: (formData) => api.post('/api/v1/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
// Posts
export const postAPI = {
  create: (data) => api.post("/api/v1/posts", data),
  getFeed: (params) => api.get("/api/v1/feed/home", { params }),
  getExploreFeed: (params) => api.get("/api/v1/feed/explore", { params }),
  getUserPosts: (userId) => api.get(`/api/v1/feed/user/${userId}`),
};

// Social
export const socialAPI = {
  follow: (userId) => api.post(`/api/v1/follows/${userId}`),
  unfollow: (userId) => api.delete(`/api/v1/follows/${userId}`),
  like: (postId) => api.post(`/api/v1/likes/${postId}`),
  unlike: (postId) => api.delete(`/api/v1/likes/${postId}`),
  comment: (postId, data) => api.post(`/api/v1/comments/${postId}`, data),
};

// Search
export const searchAPI = {
  search: (q) => api.get("/api/v1/search", { params: { q } }),
  autocomplete: (q) =>
    api.get("/api/v1/search/autocomplete", { params: { q } }),
};

export default api;
