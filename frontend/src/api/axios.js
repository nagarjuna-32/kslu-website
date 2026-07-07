import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (baseURL && !baseURL.endsWith('/api')) {
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1);
  }
  baseURL = `${baseURL}/api`;
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Global interceptor for standard error message extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errMsg = error.response?.data?.error || 'A network error occurred. Please try again.';
    return Promise.reject(new Error(errMsg));
  }
);

export default api;
