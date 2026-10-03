import apiClient from './apiClient';

/**
 * Register a new Service Provider
 * Method: POST
 * URL: /service/register-service-provider
 */
export const registerServiceProvider = async (providerData) => {
  try {
    const response = await apiClient.post('/service/register-service-provider', providerData);
    return response.data;
  } catch (error) {
    console.error('Register service provider error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to register service provider.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch all Services
 * Method: GET
 * URL: /service/list
 */
export const getServicesList = async () => {
  try {
    const response = await apiClient.get('/service/list');
    return response.data;
  } catch (error) {
    console.error('Get services list error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch services.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch all Services for a specific Provider
 * Method: GET
 * URL: /service/get-all-services/:providerId
 */
export const getProviderServices = async (providerId) => {
  try {
    const response = await apiClient.get(`/service/get-all-services/${providerId}`);
    return response.data;
  } catch (error) {
    console.error('Get provider services list error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch provider services.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Create a new Service
 * Method: POST
 * URL: /service/create-service
 */
export const createService = async (formData) => {
  try {
    const response = await apiClient.post('/service/create-service', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create service error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create service.',
      statusCode: error.response?.status || 500
    };
  }
};


/**
 * Update an existing Service
 * Method: PUT
 * URL: /service/update-service/:id
 */
export const updateService = async (id, formData) => {
  try {
    const response = await apiClient.put(`/service/update-service/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update service error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update service.',
      statusCode: error.response?.status || 500
    };
  }
};


/**
 * Fetch Service Details by ID
 * Method: GET
 * URL: /service/details/:id
 */
export const getServiceDetails = async (id) => {
  try {
    const response = await apiClient.get(`/service/details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get service details error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch service details.',
      statusCode: error.response?.status || 500
    };
  }
};


/**
 * Delete a Service
 * Method: DELETE
 * URL: /service/delete-service/:id
 */
export const deleteService = async (id) => {
  try {
    const response = await apiClient.delete(`/service/delete-service/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete service error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete service.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Add a new Service Staff member
 * Method: POST
 * URL: /service/add-service-staff
 */
export const addServiceStaff = async (formData) => {
  try {
    const response = await apiClient.post('/service/add-service-staff', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Add service staff error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add service staff.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch all Service Staff members by Provider ID (User ID)
 * Method: GET
 * URL: /service/get-service-staff/:providerId
 */
export const getServiceStaff = async (providerId) => {
  try {
    const response = await apiClient.get(`/service/get-all-service-staff/${providerId}`);
    return response.data;
  } catch (error) {
    console.error('Get service staff error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch service staff.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch Service Staff details by Provider ID (User ID) and Staff ID
 * Method: GET
 * URL: /service/get-service-staff/:providerId/:staffId
 */
export const getServiceStaffDetails = async (providerId, staffId) => {
  try {
    const response = await apiClient.get(`/service/get-service-staff/${providerId}/${staffId}`);
    return response.data;
  } catch (error) {
    console.error('Get service staff details error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff details.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Delete Service Staff member by Staff ID
 * Method: DELETE
 * URL: /service/delete-service-staff/:staffId
 */
export const deleteServiceStaff = async (staffId) => {
  try {
    const response = await apiClient.delete(`/service/delete-service-staff/${staffId}`);
    return response.data;
  } catch (error) {
    console.error('Delete service staff error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete staff member.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Update an existing Service Staff member by Staff ID
 * Method: PUT
 * URL: /service/update-service-staff/:staffId
 * @param {string} staffId - The staff member ID
 * @param {FormData} data - Form data with name, phone, email, experienceYears, skills[i], file
 */
export const updateServiceStaff = async (staffId, data) => {
  try {
    const response = await apiClient.put(`/service/update-service-staff/${staffId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update service staff error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update staff member.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Create/Update Service Provider Availability
 * Method: POST
 * URL: /service/create-provider-availability
 * @param {object} data - Payload: { availabilities: [{ dayOfWeek, startTime, endTime, breakStart, breakEnd }] }
 */
export const createProviderAvailability = async (data) => {
  try {
    const response = await apiClient.post('/service/create-provider-availability', data);
    return response.data;
  } catch (error) {
    console.error('Create provider availability error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to save provider availability.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Update Service Provider Availability
 * Method: PUT
 * URL: /service/update-provider-availability
 * @param {object} data - Payload: { availabilities: [{ dayOfWeek, startTime, endTime, breakStart, breakEnd }] }
 */
export const updateProviderAvailability = async (data) => {
  try {
    const response = await apiClient.put('/service/update-provider-availability', data);
    return response.data;
  } catch (error) {
    console.error('Update provider availability error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update provider availability.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch Service Provider Availability by Provider ID
 * Method: GET
 * URL: /service/get-availability/:providerId
 * @param {string} providerId - The provider ID or user ID depending on endpoint requirement
 */
export const getProviderAvailability = async (providerId) => {
  try {
    const response = await apiClient.get(`/service/get-availability/${providerId}`);
    return response.data;
  } catch (error) {
    console.error('Get provider availability error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch provider availability.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Search Service Providers and their Catalog
 * Method: GET
 * URL: /service-search
 * @param {object} params - Query params: lat, lng, maxDistanceKm, city, etc.
 */
export const searchServices = async (params) => {
  try {
    const response = await apiClient.get('/service-search', { params });
    return response.data;
  } catch (error) {
    console.error('Search services error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to search services.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Update an existing Service Provider profile details
 * Method: PUT
 * URL: /service/update-service-provider
 */
export const updateServiceProvider = async (providerData) => {
  try {
    const response = await apiClient.put('/service/update-service-provider', providerData);
    return response.data;
  } catch (error) {
    console.error('Update service provider error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update service provider profile.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch available time slots for a specific provider, services list, and date
 * Method: POST
 * URL: /service/slots/:providerId
 * @param {string} providerId
 * @param {Array<string>} serviceIds
 * @param {string} date - Format: YYYY-MM-DD
 */
export const getAvailableSlots = async (providerId, serviceIds, date) => {
  try {
    const response = await apiClient.post(`/service/slots/${providerId}`, {
      serviceIds,
      date
    }, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Get available slots error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch available slots.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Create a new service booking
 * Method: POST
 * URL: /service-booking/create-booking
 * @param {object} bookingData - Payload: { items: [{ serviceId }], staffId, serviceProviderId, bookingDate, slotStartTime, serviceAddress }
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await apiClient.post('/service-booking/create-booking', bookingData);
    return response.data;
  } catch (error) {
    console.error('Create booking error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create booking.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Get user service booking history
 * Method: GET
 * URL: /service-booking/user-service-booking-history
 * @param {string} startDate - format: YYYY-MM-DD
 * @param {string} endDate - format: YYYY-MM-DD
 */
export const getUserBookingHistory = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get('/service-booking/user-service-booking-history', { params });
    return response.data;
  } catch (error) {
    console.error('Get booking history error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch booking history.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Create a new service lead
 * Method: POST
 * URL: /service/create-lead
 * @param {object} leadData - Contains categoryIds, requirement, budget, preferredDate, address, pincode, city, state, location, quantity, phoneNumber, gender
 */
export const createServiceLead = async (leadData) => {
  try {
    const response = await apiClient.post('/service/create-lead', leadData);
    return response.data;
  } catch (error) {
    console.error('Create service lead error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create service lead.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Get user service leads list
 * Method: GET
 * URL: /service/user-service-leads
 */
export const getUserServiceLeads = async () => {
  try {
    const response = await apiClient.get('/service/user-service-leads');
    return response.data;
  } catch (error) {
    console.error('Get user service leads error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch service leads.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch service provider wallet balance
 * Method: GET
 * URL: /wallet/service-provider/balance
 */
export const getServiceProviderWalletBalance = async () => {
  try {
    const response = await apiClient.get('/wallet/service-provider/balance');
    return response.data;
  } catch (error) {
    console.error('Get service provider wallet balance error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch wallet balance.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch service provider wallet transactions list
 * Method: GET
 * URL: /wallet/service-provider/transactions
 */
export const getServiceProviderWalletTransactions = async () => {
  try {
    const response = await apiClient.get('/wallet/service-provider/transactions');
    return response.data;
  } catch (error) {
    console.error('Get service provider wallet transactions error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch transactions.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch service provider specific leads (assigned / relevant)
 * Method: GET
 * URL: /service-leads/provider/my-leads
 */
export const getServiceProviderMyLeads = async () => {
  try {
    const response = await apiClient.get('/service-leads/provider/my-leads');
    return response.data;
  } catch (error) {
    console.error('Get service provider my leads error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch service provider leads.',
      statusCode: error.response?.status || 500
    };
  }
};

// ── Service-Provider Coupon APIs ──────────────────────────────────────────────

/** Create a service-specific coupon (SP dashboard) */
export const spCreateCoupon = async (dto) => {
  try {
    const response = await apiClient.post('/coupons/sp/create', dto);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/** List all coupons owned by the logged-in SP */
export const spGetMyCoupons = async () => {
  try {
    const response = await apiClient.get('/coupons/sp/my-coupons');
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/** List the SP's own services for the coupon create dropdown */
export const spGetMyServicesForCoupon = async () => {
  try {
    const response = await apiClient.get('/coupons/sp/my-services');
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/** Update a coupon (ownership enforced server-side) */
export const spUpdateCoupon = async (id, dto) => {
  try {
    const response = await apiClient.put(`/coupons/sp/update/${id}`, dto);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/** Toggle coupon active status */
export const spToggleCoupon = async (id) => {
  try {
    const response = await apiClient.patch(`/coupons/sp/toggle/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/** Delete a coupon (ownership enforced server-side) */
export const spDeleteCoupon = async (id) => {
  try {
    const response = await apiClient.delete(`/coupons/sp/delete/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Customer: validate a service-specific coupon during booking Step 4.
 * @param {string} couponCode
 * @param {string} serviceId  - the service the coupon is being applied to
 * @param {string} providerId - the selected salon's provider ID
 */
export const validateServiceCoupon = async (couponCode, serviceId, providerId) => {
  try {
    const response = await apiClient.post('/service-booking/validate-service-coupon', {
      couponCode,
      serviceId,
      providerId,
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

