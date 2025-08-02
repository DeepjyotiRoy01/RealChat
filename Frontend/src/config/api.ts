// API Configuration for different environments
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://your-backend-url.railway.app'; // You'll update this after backend deployment

export const SOCKET_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://your-backend-url.railway.app'; // You'll update this after backend deployment 