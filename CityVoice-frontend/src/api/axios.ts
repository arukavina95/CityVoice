import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim().length > 0
    ? import.meta.env.VITE_API_BASE_URL.trim()
    : '/api';

const api = axios.create({
  baseURL,
  // You can add default headers here if needed
});

export default api;