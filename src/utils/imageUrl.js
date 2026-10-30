import config from '../config/config';

export const DEFAULT_PRODUCT_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="%23f8fafc"><rect width="300" height="300" fill="%23f8fafc"/><path d="M110 130a20 20 0 100-40 20 20 0 000 40zm80 20l-50 65-30-40-40 55h160l-40-80z" fill="%23cbd5e1"/><text x="150" y="255" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="%2394a3b8" text-anchor="middle" letter-spacing="1">FASHION FEVER</text></svg>';

export const handleImageError = (e, fallback = DEFAULT_PRODUCT_PLACEHOLDER) => {
  if (e && e.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
};

export const getImageUrl = (img) => {
  if (!img) return '';

  if (typeof File !== 'undefined' && img instanceof File) {
    return URL.createObjectURL(img);
  }
  if (typeof Blob !== 'undefined' && img instanceof Blob) {
    return URL.createObjectURL(img);
  }

  if (Array.isArray(img) && img.length > 0) {
    return getImageUrl(img[0]);
  }

  let url = '';
  if (typeof img === 'string') {
    url = img;
  } else if (typeof img === 'object') {
    if (img?.url) {
      url = img.url;
    } else if (img?.thumbnail) {
      return getImageUrl(img.thumbnail);
    } else if (img?.productImage) {
      return getImageUrl(img.productImage);
    } else if (Array.isArray(img?.images) && img.images.length > 0) {
      return getImageUrl(img.images[0]);
    } else if (img?.image) {
      return getImageUrl(img.image);
    } else if (img?.photo) {
      return getImageUrl(img.photo);
    } else if (img?.profilePhoto) {
      return getImageUrl(img.profilePhoto);
    } else if (img?.avatar) {
      return getImageUrl(img.avatar);
    } else if (img?.logo) {
      return getImageUrl(img.logo);
    } else if (img?.banner) {
      return getImageUrl(img.banner);
    } else if (img?.path) {
      return getImageUrl(img.path);
    } else if (Array.isArray(img?.variants) && img.variants.length > 0) {
      return getImageUrl(img.variants[0]);
    } else if (img?.variant && typeof img.variant === 'object') {
      return getImageUrl(img.variant);
    } else if (img?.product && typeof img.product === 'object') {
      return getImageUrl(img.product);
    }
  }

  if (!url) return '';

  // Normalize Windows backslashes
  url = url.replace(/\\/g, '/');

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

  // When running locally, rewrite live domain URLs to local backendBase so local uploads can be displayed
  if (!backendBase.includes('fashionfever.in') && url.includes('fashionfever.in')) {
    url = url.replace(/https?:\/\/fashionfever\.in(\/fashion_fever_api)?(\/api\/v1)?/, backendBase);
  }

  let resolved = url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    resolved = url;
  } else if (url.startsWith('/uploads') || url.startsWith('uploads')) {
    resolved = `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  } else if (/^[0-9a-fA-F]{24}$/.test(url)) {
    resolved = `${config.API_URL}/file/get-file/${url}`;
  } else if (!url.startsWith('http') && !url.startsWith('/')) {
    resolved = `${backendBase}/uploads/${url}`;
  }

  if (resolved && (resolved.startsWith('http://') || resolved.startsWith('https://'))) {
    try {
      resolved = encodeURI(decodeURI(resolved));
    } catch (_) {}
  }

  return resolved;
};
