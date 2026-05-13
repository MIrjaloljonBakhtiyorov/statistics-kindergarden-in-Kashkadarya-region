import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/kindergarten-api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
