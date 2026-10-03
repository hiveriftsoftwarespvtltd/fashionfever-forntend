const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocal) {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:9000/api/v1`;
  }
  return 'https://fashionfever.in/fashion_fever_api/api/v1';
};

const getBaseUrl = () => {
  if (import.meta.env.VITE_BASE_URL) {
    return import.meta.env.VITE_BASE_URL;
  }
  return getApiUrl().replace(/\/api\/v1\/?$/, '');
};

const config = {
  API_URL: getApiUrl(),
  BASE_URL: getBaseUrl(),
};

export default config;
