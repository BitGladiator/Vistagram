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
    } catch (e) { }
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
  uploadStory: (formData) => api.post('/api/v1/media/upload-story', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
// Posts
export const postAPI = {
  create: (data) => api.post('/api/v1/posts', data),
  getFeed: (params) => api.get('/api/v1/feed/home', { params }),
  getExploreFeed: (params) => api.get('/api/v1/feed/explore', { params }),
  getUserPosts: (userId) => api.get(`/api/v1/feed/user/${userId}`),
  getPost: (postId) => api.get(`/api/v1/posts/${postId}`),
  clearFeedCache: () => api.delete('/api/v1/feed/cache'),
};

// Social
export const socialAPI = {
  follow: (userId) => api.post(`/api/v1/follows/${userId}`),
  unfollow: (userId) => api.delete(`/api/v1/follows/${userId}`),
  like: (postId) => api.post(`/api/v1/likes/${postId}`),
  unlike: (postId) => api.delete(`/api/v1/likes/${postId}`),
  comment: (postId, data) => api.post(`/api/v1/comments/${postId}`, data),
};
export const storiesAPI = {
  getFeed: () => api.get('/api/v1/stories/feed'),
  getUserStories: (userId) => api.get(`/api/v1/stories/user/${userId}`),
  markViewed: (storyId) => api.post(`/api/v1/stories/${storyId}/view`),
  delete: (storyId) => api.delete(`/api/v1/stories/${storyId}`),
  getViewers: (storyId) => api.get(`/api/v1/stories/${storyId}/viewers`),
};
// Search
export const searchAPI = {
  search: (q) => api.get("/api/v1/search", { params: { q } }),
  searchPosts: (q, params) => api.get('/api/v1/search/posts', { params: { q, ...params } }),
  autocomplete: (q) =>
    api.get("/api/v1/search/autocomplete", { params: { q } }),
};

export default api;
