import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  config.headers['X-Correlation-ID'] = crypto.randomUUID();
  config.headers['Accept-Language'] = 'en-US';
  return config;
});
