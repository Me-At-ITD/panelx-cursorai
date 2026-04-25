const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://backend-panel-x.conxorbit.com/api/v1',
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export default API_CONFIG;