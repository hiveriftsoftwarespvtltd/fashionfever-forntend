import config from '../config/config';

export const getImageUrl = (img) => {
  if (!img) return '';
  let url = '';
  if (typeof img === 'string') {
    url = img;
  } else if (typeof img === 'object' && img?.url) {
    url = img.url;
  }

  if (!url) return '';

  const backendBase = config.API_URL.replace(/\/api\/v1\/?$/, '');

  // Convert old localhost or IP URLs stored in database to backendBase
  if (url.includes('localhost') || url.includes('192.168.') || url.includes(':9000')) {
    url = url.replace(/http:\/\/(192\.168\.\d+\.\d+|localhost|[\w.-]+)(:\d+)?(\/api\/v1)?/, backendBase);
    if (url.startsWith('http://fashionfever.in')) {
      url = url.replace('http://fashionfever.in', 'https://fashionfever.in');
    }
  }

  // Convert old live domain URLs missing subpath
  if (config.API_URL.includes('/fashion_fever_api') && url.includes('fashionfever.in/') && !url.includes('/fashion_fever_api/')) {
    url = url.replace(/https?:\/\/fashionfever\.in(\/api\/v1)?/, backendBase);
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  if (url.startsWith('/uploads') || url.startsWith('uploads')) {
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  if (/^[0-9a-fA-F]{24}$/.test(url)) {
    return `${config.API_URL}/document/${url}`;
  }

  return url;
};
