// Automatically detect environment and use appropriate API URL
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_URL = process.env.REACT_APP_API_URL || 
  (isDevelopment ? 'http://localhost:5000/api' : 'https://enginia-do.onrender.com/api');

console.log('🌐 API Configuration:', {
  environment: isDevelopment ? 'development' : 'production',
  apiUrl: API_URL,
  hostname: window.location.hostname
});

export default API_URL;
