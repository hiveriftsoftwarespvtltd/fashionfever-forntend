/**
 * Pincode Lookup Utility
 * Automatically fetches City and State based on a 6-digit Indian Postal PIN Code.
 * Uses official Indian Postal Department Pincode API (https://api.postalpincode.in)
 * Includes in-memory caching and request timeout handling.
 */

const pincodeCache = new Map();

/**
 * Fetch City and State from a 6-digit Indian PIN Code
 * @param {string|number} pincode 
 * @returns {Promise<{ success: boolean, city?: string, state?: string, district?: string, error?: string }>}
 */
export const lookupPincode = async (pincode) => {
  const cleanPin = String(pincode || '').replace(/\D/g, '').trim();
  if (cleanPin.length !== 6) {
    return { success: false, error: 'Pincode must be 6 digits' };
  }

  // Return from cache if already fetched
  if (pincodeCache.has(cleanPin)) {
    return { success: true, ...pincodeCache.get(cleanPin) };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: 'Failed to connect to location service' };
    }

    const data = await response.json();
    if (
      Array.isArray(data) && 
      data[0]?.Status === 'Success' && 
      Array.isArray(data[0]?.PostOffice) && 
      data[0].PostOffice.length > 0
    ) {
      const postOffice = data[0].PostOffice[0];
      
      // Determine City (prefer recognizable town/block if valid, fallback to District/Division)
      let city = '';
      if (postOffice.Block && postOffice.Block !== 'NA' && !/north|south|east|west/i.test(postOffice.Block)) {
        city = postOffice.Block;
      } else {
        city = postOffice.District || postOffice.Division || postOffice.Name || '';
      }

      const state = postOffice.State || '';
      const district = postOffice.District || city;

      const result = { city, state, district };
      pincodeCache.set(cleanPin, result);
      return { success: true, ...result };
    }

    return { success: false, error: 'Invalid or unserviceable pincode' };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Location lookup timed out' };
    }
    console.warn('Pincode lookup error:', error);
    return { success: false, error: error.message || 'Lookup error' };
  }
};
