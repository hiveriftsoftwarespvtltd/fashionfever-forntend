import apiClient from '../api/apiClient';

export const REFERRAL_STORAGE_KEY = 'ff_referral_code';
export const REFERRAL_TIMESTAMP_KEY = 'ff_referral_timestamp';
export const REFERRAL_COOKIE_NAME = 'referralCode';
export const REFERRAL_COOKIE_ALT = 'ff_referral_code';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Set a browser cookie with standard attributes
 */
export const setCookie = (name, value, days = 30) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

/**
 * Read a cookie by name
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

/**
 * Clear a cookie by expiring it
 */
export const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};

/**
 * Capture referral code from URL query parameters (?ref=..., ?referralCode=...)
 * Stores in both localStorage and cookies (30-day window) and triggers server-side click tracking.
 */
export const captureReferralFromUrl = (search = typeof window !== 'undefined' ? window.location.search : '') => {
  if (!search) return null;

  try {
    const params = new URLSearchParams(search);
    const rawCode =
      params.get('ref') ||
      params.get('referralCode') ||
      params.get('affiliate') ||
      params.get('aff');

    if (!rawCode || typeof rawCode !== 'string') return null;

    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) return null;

    // Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(REFERRAL_STORAGE_KEY, normalizedCode);
      localStorage.setItem(REFERRAL_TIMESTAMP_KEY, Date.now().toString());
    }

    // Persist to cookies (30 days)
    setCookie(REFERRAL_COOKIE_NAME, normalizedCode, 30);
    setCookie(REFERRAL_COOKIE_ALT, normalizedCode, 30);

    // Fire-and-forget server-side click tracking
    try {
      apiClient.post('/affiliate-tracking/click', { referralCode: normalizedCode }).catch(() => {
        // Silently ignore tracking failures so browsing is never interrupted
      });
    } catch {
      // Ignore background dispatch errors
    }

    return normalizedCode;
  } catch (err) {
    console.warn('[referralTracking] Failed to parse URL parameters:', err);
    return null;
  }
};

/**
 * Retrieve currently active referral code from localStorage or cookies.
 * Enforces the 30-day attribution window.
 */
export const getStoredReferralCode = () => {
  try {
    // 1. Check localStorage first
    if (typeof localStorage !== 'undefined') {
      const storedCode = localStorage.getItem(REFERRAL_STORAGE_KEY);
      const storedTimestamp = localStorage.getItem(REFERRAL_TIMESTAMP_KEY);

      if (storedCode) {
        if (storedTimestamp) {
          const age = Date.now() - parseInt(storedTimestamp, 10);
          if (age > THIRTY_DAYS_MS) {
            clearStoredReferralCode();
            return null;
          }
        }
        return storedCode.trim().toUpperCase();
      }
    }

    // 2. Check cookies fallback
    const cookieCode = getCookie(REFERRAL_COOKIE_NAME) || getCookie(REFERRAL_COOKIE_ALT);
    if (cookieCode) {
      const normalized = cookieCode.trim().toUpperCase();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
        localStorage.setItem(REFERRAL_TIMESTAMP_KEY, Date.now().toString());
      }
      return normalized;
    }

    return null;
  } catch (err) {
    console.warn('[referralTracking] Failed to get stored referral code:', err);
    return null;
  }
};

/**
 * Remove stored referral code from localStorage and cookies (e.g. after successful signup)
 */
export const clearStoredReferralCode = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      localStorage.removeItem(REFERRAL_TIMESTAMP_KEY);
      localStorage.removeItem('referralCode');
    }
    deleteCookie(REFERRAL_COOKIE_NAME);
    deleteCookie(REFERRAL_COOKIE_ALT);
  } catch (err) {
    console.warn('[referralTracking] Failed to clear stored referral code:', err);
  }
};
