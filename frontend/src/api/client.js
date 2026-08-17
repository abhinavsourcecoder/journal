import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach DRF Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gratitude_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if not logging in
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('gratitude_token');
        localStorage.removeItem('gratitude_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (data) => apiClient.post('/auth/register/', data),
  login: (data) => apiClient.post('/auth/login/', data),
  logout: () => apiClient.post('/auth/logout/'),
  getCurrentUser: () => apiClient.get('/auth/user/'),
};

// Journal Entries Endpoints
export const journalAPI = {
  // List all entries for the user (can pass query params like ?month=YYYY-MM)
  getEntries: (params) => apiClient.get('/entries/', { params }),

  // Get single entry by date (GET /api/entries/by-date/?date=YYYY-MM-DD)
  getEntryByDate: (date) => apiClient.get('/entries/by-date/', { params: { date } }),

  // Get lightweight calendar dates summary
  getCalendarSummary: () => apiClient.get('/entries/calendar-summary/'),

  // Create new entry (POST /api/entries/)
  createEntry: (data) => apiClient.post('/entries/', data),

  // Update existing entry (PATCH /api/entries/<id>/)
  updateEntry: (id, data) => apiClient.patch(`/entries/${id}/`, data),

  // Delete entry (DELETE /api/entries/<id>/)
  deleteEntry: (id) => apiClient.delete(`/entries/${id}/`),
};

export default apiClient;
