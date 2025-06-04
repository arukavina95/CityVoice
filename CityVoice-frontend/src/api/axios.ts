import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.74:5088', // Backend API base URL
  // You can add default headers here if needed
});

export default api; 