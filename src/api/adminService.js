import apiClient from './apiClient';

export const getAllUsers = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch users error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch users.',
      statusCode: 500
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete user.',
      statusCode: 500
    };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Fetch user detail error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch user details.',
      statusCode: 500
    };
  }
};

export const getUserWalletBalance = async (userId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/user/${userId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Fetch user wallet balance error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch user wallet balance.',
      statusCode: 500
    };
  }
};

export const getUserWalletTransactions = async (userId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/user/${userId}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Fetch user wallet transactions error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch user wallet transactions.',
      statusCode: 500
    };
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await apiClient.patch(`/admin/users/toggle-active/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Toggle user status error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to toggle user status.',
      statusCode: 500
    };
  }
};

export const getAllVendors = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/vendors', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch vendors error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch vendors.',
      statusCode: 500
    };
  }
};

/**
 * Get pending vendors for approval
 */
export const getPendingVendors = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/pending-vendors', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch pending vendors error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch pending vendors.',
      statusCode: 500
    };
  }
};

export const getVendorById = async (vendorId) => {
  try {
    const response = await apiClient.get(`/admin/vendors/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error('Fetch vendor detail error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch vendor details.',
      statusCode: 500
    };
  }
};

export const deleteVendor = async (vendorId) => {
  try {
    const response = await apiClient.delete(`/admin/vendors/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error('Delete vendor error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete vendor.',
      statusCode: 500
    };
  }
};

/**
 * Accept/Approve a vendor
 * @param {string} vendorId - ID of the vendor to approve
 */
export const acceptVendor = async (vendorId) => {
  try {
    const response = await apiClient.patch(`/admin/accept-vendor/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error('Accept vendor error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to approve vendor.',
      statusCode: 500
    };
  }
};

/**
 * Reject a vendor
 * @param {string} vendorId - ID of the vendor to reject
 */
export const rejectVendor = async (vendorId) => {
  try {
    const response = await apiClient.patch(`/admin/reject-vendor/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error('Reject vendor error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to reject vendor.',
      statusCode: 500
    };
  }
};

/**
 * Toggle vendor active status (Activate/Deactivate)
 * @param {string} vendorId - ID of the vendor to toggle
 */
export const toggleVendorStatus = async (vendorId) => {
  try {
    const response = await apiClient.patch(`/admin/vendors/toggle-active/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error('Toggle vendor status error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to toggle vendor status.',
      statusCode: 500
    };
  }
};

/**
 * Onboard a new influencer
 * @param {Object} influencerData - Data for the influencer
 */
export const onboardInfluencer = async (influencerData) => {
  try {
    const response = await apiClient.post('/influencers/onboard-influencer', influencerData);
    return response.data;
  } catch (error) {
    console.error('Onboard influencer error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to onboard influencer.',
      statusCode: 500
    };
  }
};

/**
 * Get all influencers
 */
export const getAllInfluencers = async (params = {}) => {
  try {
    const response = await apiClient.get('/influencers/all-influencers', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch influencers error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencers.',
      statusCode: 500
    };
  }
};

/**
 * Update an existing influencer
 * @param {string} id - Influencer ID
 * @param {Object} data - Updated influencer data
 */
export const updateInfluencer = async (id, data) => {
  try {
    const response = await apiClient.put(`/influencers/update-influencer/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update influencer error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update influencer.',
      statusCode: 500
    };
  }
};

/**
 * Update influencer status (active, rejected, pending, blocked)
 * @param {string} id - Influencer ID
 * @param {string} status - New status (active, rejected, pending, blocked)
 */
export const updateInfluencerStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`/influencers/update-influencer-status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('Update influencer status error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update influencer status.',
      statusCode: 500
    };
  }
};

/**
 * Delete an influencer profile
 * @param {string} id - Influencer ID
 */
export const deleteInfluencer = async (id) => {
  try {
    const response = await apiClient.delete(`/influencers/delete-influencer/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete influencer error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete influencer.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed influencer profile
 * @param {string} id - Influencer ID
 */
export const getInfluencerById = async (id) => {
  try {
    const response = await apiClient.get(`/influencers/influencer-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch influencer details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer details.',
      statusCode: 500
    };
  }
};

/**
 * Create a new coupon
 * @param {Object} data - Coupon data
 */
export const createCoupon = async (data) => {
  try {
    const response = await apiClient.post('/coupons/create-coupon', data);
    return response.data;
  } catch (error) {
    console.error('Create coupon error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to create coupon.',
      statusCode: 500
    };
  }
};

/**
 * Update an existing coupon
 * @param {string} id - Coupon ID
 * @param {Object} data - Updated coupon data
 */
export const updateCoupon = async (id, data) => {
  try {
    const response = await apiClient.put(`/coupons/update-coupon/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update coupon error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update coupon.',
      statusCode: 500
    };
  }
};

/**
 * Delete a coupon
 * @param {string} id - Coupon ID
 */
export const deleteCoupon = async (id) => {
  try {
    const response = await apiClient.delete(`/coupons/delete-coupon/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete coupon error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete coupon.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed coupon info
 * @param {string} id - Coupon ID
 */
export const getCouponById = async (id) => {
  try {
    const response = await apiClient.get(`/coupons/coupon-detail/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch coupon details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch coupon details.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all coupons with pagination and search
 * @param {Object} params - Query params
 */
export const getAllCoupons = async (params) => {
  try {
    const response = await apiClient.get('/coupons/all', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch coupons error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch coupons.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all categories for administrative controls
 */
export const fetchCategories = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/fetch-categories', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch categories error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch categories.',
      statusCode: 500
    };
  }
};

/**
 * Create a new category with form-data (supporting image upload)
 */
export const createCategory = async (formData) => {
  try {
    const response = await apiClient.post('/admin/create-category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create category error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to create category.',
      statusCode: 500
    };
  }
};

/**
 * Update an existing category with form-data (supporting image upload)
 * Method: PUT
 * URL: /admin/update-category/:id
 */
export const updateCategory = async (id, formData) => {
  try {
    const response = await apiClient.put(`/admin/update-category/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update category error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update category.',
      statusCode: 500
    };
  }
};

/**
 * Delete an existing category by ID
 * Method: DELETE
 * URL: /admin/delete-category/:id
 */
export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/delete-category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete category error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete category.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed category information by ID
 * Method: GET
 * URL: /admin/fetch-catoegry/:id
 */
export const fetchCategoryById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/fetch-catoegry/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch category details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch category details.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all orders with pagination and search
 * Method: GET
 * URL: /admin/orders
 */
export const getAllOrders = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch all orders error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch orders.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed order information by ID
 * Method: GET
 * URL: /admin/orderDetails/:orderId
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/admin/orderDetails/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Fetch order details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch order details.',
      statusCode: 500
    };
  }
};

/**
 * Delete an order by ID
 * Method: DELETE
 * URL: /admin/order-delete/:orderId
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await apiClient.delete(`/admin/order-delete/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Delete order error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete order.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all products with pagination and search
 * Method: GET
 * URL: /admin/products
 */
export const getAllProducts = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/products', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch all products error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch products.',
      statusCode: 500
    };
  }
};

/**
 * Delete a product by Vendor ID and Product ID
 * Method: DELETE
 * URL: /admin/delete-product/:vendorId/:productId
 */
export const deleteProduct = async (vendorId, productId) => {
  try {
    let vId = vendorId;
    let pId = productId;
    if (typeof vId === 'object' && vId !== null) {
      vId = vId._id || vId.id || vId.vendorId || 'all';
    }
    if (!pId && vId) {
      pId = vId;
      vId = 'all';
    }
    if (typeof pId === 'object' && pId !== null) {
      pId = pId._id || pId.id;
    }
    const response = await apiClient.delete(`/admin/delete-product/${vId}/${pId}`);
    return response.data;
  } catch (error) {
    console.error('Delete product error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete product.',
      statusCode: 500
    };
  }
};

/**
 * Delete all products
 * Method: DELETE
 * URL: /admin/delete-all-products
 */
export const deleteAllProducts = async () => {
  try {
    const response = await apiClient.delete('/admin/delete-all-products');
    return response.data;
  } catch (error) {
    console.error('Delete all products error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete all products.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Administrative Overview Statistics
 * Method: GET
 * URL: /admin-dashboard/overview
 */
export const getDashboardOverview = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/overview');
    return response.data;
  } catch (error) {
    console.error('Fetch dashboard overview error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch dashboard overview.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Administrative Revenue Trend
 * Method: GET
 * URL: /admin-dashboard/revenue-trend
 * @param {number} days - Number of days to fetch trend for (default 10)
 */
export const getRevenueTrend = async (days = 10) => {
  try {
    const response = await apiClient.get(`/admin-dashboard/revenue-trend?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Fetch revenue trend error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch revenue trend.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Top Performing Categories
 * Method: GET
 * URL: /admin-dashboard/top-categories
 */
export const getTopCategories = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/top-categories');
    return response.data;
  } catch (error) {
    console.error('Fetch top categories error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch top categories.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Order Status Analytics
 * Method: GET
 * URL: /admin-dashboard/order-status-analytics
 */
export const getOrderStatusAnalytics = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/order-status-analytics');
    return response.data;
  } catch (error) {
    console.error('Fetch order status analytics error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch order status analytics.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Category Product Distribution
 * Method: GET
 * URL: /admin-dashboard/category-distribution
 */
export const getCategoryDistribution = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/category-distribution');
    return response.data;
  } catch (error) {
    console.error('Fetch category distribution error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch category distribution.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Order Status Graph Data
 * Method: GET
 * URL: /admin-dashboard/order-status-graph
 */
export const getOrderStatusGraph = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/order-status-graph');
    return response.data;
  } catch (error) {
    console.error('Fetch order status graph error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch order status graph data.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Monthly Analytics
 * Method: GET
 * URL: /admin-dashboard/monthly-analytics?year=:year
 */
export const getMonthlyAnalytics = async (year = 2026) => {
  try {
    const response = await apiClient.get(`/admin-dashboard/monthly-analytics?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Fetch monthly analytics error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch monthly analytics.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Yearly Analytics
 * Method: GET
 * URL: /admin-dashboard/yearly-analytics
 */
export const getYearlyAnalytics = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/yearly-analytics');
    return response.data;
  } catch (error) {
    console.error('Fetch yearly analytics error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch yearly analytics.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Comprehensive Analytics Graph Data
 * Method: GET
 * URL: /admin-dashboard/analytics-graph
 */
export const getAnalyticsGraph = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/analytics-graph');
    return response.data;
  } catch (error) {
    console.error('Fetch analytics graph error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch analytics graph data.',
      statusCode: 500
    };
  }
};

/**
 * Fetch Top Performing Vendors Graph Data
 * Method: GET
 * URL: /admin-dashboard/top-vendors-graph
 */
export const getTopVendorsGraph = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/top-vendors-graph');
    return response.data;
  } catch (error) {
    console.error('Fetch top vendors graph error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch top vendors graph data.',
      statusCode: 500
    };
  }
};


/**
 * Send invitation link to a potential influencer
 * Method: POST
 * URL: /admin/send-influencer-invitation-link
 * @param {{ email: string, name: string }} data
 */
export const sendInfluencerInvitationLink = async (data) => {
  try {
    const response = await apiClient.post('/admin/send-influencer-invitation-link', data);
    return response.data;
  } catch (error) {
    console.error('Send influencer invitation error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to send invitation link.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all influencer commission slabs
 * Method: GET
 * URL: /admin/all-influencer-commission-slabs
 */
export const getAllInfluencerCommissionSlabs = async () => {
  try {
    const response = await apiClient.get('/admin/all-influencer-commission-slabs');
    return response.data;
  } catch (error) {
    console.error('Fetch commission slabs error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch commission slabs.',
      statusCode: 500
    };
  }
};

/**
 * Create a new influencer commission slab
 * Method: POST
 * URL: /admin/create-influencer-commission-slab
 * @param {{ minSales: number, maxSales: number, commissionRate: number }} data
 */
export const createInfluencerCommissionSlab = async (data) => {
  try {
    const response = await apiClient.post('/admin/create-influencer-commission-slab', data);
    return response.data;
  } catch (error) {
    console.error('Create commission slab error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to create commission slab.',
      statusCode: 500
    };
  }
};

/**
 * Update an influencer commission slab
 * Method: PUT
 * URL: /admin/update-commission-slab/:id
 * @param {string} id - Slab ID
 * @param {{ minSales: number, maxSales: number, commissionRate: number, isActive: boolean }} data
 */
export const updateInfluencerCommissionSlab = async (id, data) => {
  try {
    const response = await apiClient.put(`/admin/update-commission-slab/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update commission slab error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update commission slab.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed influencer commission slab by ID
 * Method: GET
 * URL: /admin/slab-details/:id
 * @param {string} id - Slab ID
 */
export const getCommissionSlabById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/slab-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch commission slab details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch commission slab details.',
      statusCode: 500
    };
  }
};

/**
 * Delete an influencer commission slab by ID
 * Method: DELETE
 * URL: /admin/delete-slab/:id
 * @param {string} id - Slab ID
 */
export const deleteInfluencerCommissionSlab = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/delete-slab/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete commission slab error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete commission slab.',
      statusCode: 500
    };
  }
};

/**
 * Fetch influencer commissions with filters
 * Method: GET
 * URL: /admin/influencer-commissions
 * @param {{ page: number, limit: number, status: string, month: number, year: number }} params
 */
export const getInfluencerCommissions = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/influencer-commissions', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch influencer commissions error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer commissions.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed influencer commissions by influencer ID
 * Method: GET
 * URL: /admin/influencer-commissions/:influencerId
 * @param {string} influencerId - Influencer ID
 * @param {{ month: number, year: number }} params - Month and year filters
 */
export const getInfluencerCommissionDetails = async (influencerId, params = {}) => {
  try {
    const response = await apiClient.get(`/admin/influencer-commissions/${influencerId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Fetch influencer commission details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer commission details.',
      statusCode: 500
    };
  }
};

/**
 * Fetch vendor payouts dashboard with filters
 * Method: GET
 * URL: /admin/vendor-payouts
 * @param {{ page: number, limit: number, status: string, month: number, year: number }} params
 */
export const getVendorPayouts = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/vendor-payouts', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch vendor payouts error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch vendor payouts.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed vendor payouts by vendor ID
 * Method: GET
 * URL: /admin/vendor-payouts/:vendorId
 * @param {string} vendorId - Vendor ID
 * @param {{ month: number, year: number, status: string, page: number, limit: number }} params - Query filters
 */
export const getVendorPayoutDetails = async (vendorId, params = {}) => {
  try {
    const response = await apiClient.get(`/admin/vendor-payouts/${vendorId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Fetch vendor payout details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch vendor payout details.',
      statusCode: 500
    };
  }
};

/**
 * Settle vendor payouts (completed payout transactions)
 * Method: POST
 * URL: /payout/vendor-payout/settle
 * @param {{ vendorId: string, remarks: string, transactionId: string, month: number, year: number, vendorOrderIds: string[] }} data
 */
export const settleVendorPayout = async (data) => {
  try {
    const response = await apiClient.post('/payout/vendor-payout/settle', data);
    return response.data;
  } catch (error) {
    console.error('Settle vendor payout error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to settle vendor payout.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all service subscription plans
 * Method: GET
 * URL: /service/get-all-service-subscription-plans
 */
export const getAllServiceCategories = async () => {
  try {
    const response = await apiClient.get('/service/get-all-service-categories', { skipAuth: true });
    return response.data;
  } catch (error) {
    console.error('Fetch service categories error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch service categories.',
      statusCode: 500
    };
  }
};

export const getAllServiceSubscriptionPlans = async () => {
  try {
    const response = await apiClient.get('/service/get-all-service-subscription-plans');
    return response.data;
  } catch (error) {
    console.error('Fetch subscription plans error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch subscription plans.',
      statusCode: 500
    };
  }
};

/**
 * Create a new service category
 * Method: POST
 * URL: /service/create-service-category
 * @param {FormData} data - Form data with name, label, description, file
 */
export const createServiceCategory = async (data) => {
  try {
    const response = await apiClient.post('/service/create-service-category', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Create service category error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to create service category.',
      statusCode: 500
    };
  }
};

/**
 * Update an existing service category
 * Method: PUT
 * URL: /service/update-service-category/:id
 * @param {string} id - The category ID
 * @param {FormData} data - Form data with name, label, description, file, isActive
 */
export const updateServiceCategory = async (id, data) => {
  try {
    const response = await apiClient.put(`/service/update-service-category/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update service category error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update service category.',
      statusCode: 500
    };
  }
};

/**
 * Fetch details of a service category
 * Method: GET
 * URL: /service/get-service-category-details/:id
 * @param {string} id - Service category ID
 */
export const getServiceCategoryDetails = async (id) => {
  try {
    const response = await apiClient.get(`/service/get-service-category-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch service category details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch service category details.',
      statusCode: 500
    };
  }
};

/**
 * Delete an existing service category
 * Method: DELETE
 * URL: /service/delete-service-category/:id
 * @param {string} id - Service category ID
 */
export const deleteServiceCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/service/delete-service-category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete service category error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete service category.',
      statusCode: 500
    };
  }
};

/**
 * Create a new service subscription plan
 * Method: POST
 * URL: /service/create-service-subscription-plan
 * @param {Object} data - Subscription plan details
 */
export const createServiceSubscriptionPlan = async (data) => {
  try {
    const response = await apiClient.post('/service/create-service-subscription-plan', data);
    return response.data;
  } catch (error) {
    console.error('Create service subscription plan error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to create subscription plan.',
      statusCode: 500
    };
  }
};

/**
 * Update an existing service subscription plan
 * Method: PUT
 * URL: /service/update-service-subscription-plan/:id
 */
export const updateServiceSubscriptionPlan = async (id, data) => {
  try {
    const response = await apiClient.put(`/service/update-service-subscription-plan/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update subscription plan error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update subscription plan.',
      statusCode: 500
    };
  }
};

/**
 * Delete a service subscription plan
 * Method: DELETE
 * URL: /service/delete-service-subscription-plan/:id
 */
export const deleteServiceSubscriptionPlan = async (id) => {
  try {
    const response = await apiClient.delete(`/service/delete-service-subscription-plan/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete subscription plan.',
      statusCode: 500
    };
  }
};

/**
 * Fetch details of a service subscription plan by ID
 * Method: GET
 * URL: /service/get-service-subscription-plan-details/:id
 * @param {string} id - The subscription plan ID
 */
export const getServiceSubscriptionPlanDetails = async (id) => {
  try {
    const response = await apiClient.get(`/service/get-service-subscription-plan-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch subscription plan details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch subscription plan details.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all service providers
 * Method: GET
 * URL: /service/get-all-service-providers
 */
export const getAllServiceProviders = async (params = {}) => {
  try {
    const response = await apiClient.get('/service/get-all-service-providers', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch service providers error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch service providers.',
      statusCode: 500
    };
  }
};

/**
 * Verify a service provider (Approve/Reject)
 * Method: PUT
 * URL: /service/service-provider/:providerId/verify
 * @param {string} providerId - Service provider ID
 * @param {string} status - Target status (e.g. APPROVED, REJECTED)
 */
export const verifyServiceProvider = async (providerId, status) => {
  try {
    const response = await apiClient.put(`/service/service-provider/${providerId}/verify`, { status });
    return response.data;
  } catch (error) {
    console.error('Verify service provider error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to verify service provider.',
      statusCode: 500
    };
  }
};

/**
 * Add home content banner / item (POST /admin/home-content/add)
 * @param {Object} data - Homepage content configuration including title, images, and redirect options
 */
export const addHomeContent = async (data) => {
  try {
    const formData = new FormData();

    // Core text attributes
    if (data.title !== undefined && data.title !== null) formData.append('title', data.title);
    if (data.subTitle !== undefined && data.subTitle !== null) formData.append('subTitle', data.subTitle);
    if (data.description !== undefined && data.description !== null) formData.append('description', data.description);

    // Append tags/labels if present
    if (data.labels && Array.isArray(data.labels)) {
      data.labels.forEach((label, index) => {
        formData.append(`labels[${index}]`, label);
      });
    }

    // Multi-platform banner images (File structures)
    if (data.computerImage) {
      formData.append('computerImage', data.computerImage);
    }
    if (data.mobileImage) {
      formData.append('mobileImage', data.mobileImage);
    }

    // Styling & configuration controls
    if (data.contentType !== undefined && data.contentType !== null) formData.append('contentType', data.contentType);
    if (data.redirectType !== undefined && data.redirectType !== null) formData.append('redirectType', data.redirectType);
    if (data.redirectId !== undefined && data.redirectId !== null) formData.append('redirectId', data.redirectId);
    if (data.redirectUrl !== undefined && data.redirectUrl !== null) formData.append('redirectUrl', data.redirectUrl);
    if (data.backgroundColor !== undefined && data.backgroundColor !== null) formData.append('backgroundColor', data.backgroundColor);
    if (data.textColor !== undefined && data.textColor !== null) formData.append('textColor', data.textColor);
    if (data.isActive !== undefined && data.isActive !== null) formData.append('isActive', data.isActive);
    if (data.startDate && String(data.startDate).trim() !== '') {
      try { formData.append('startDate', new Date(data.startDate).toISOString()); } catch (_) { formData.append('startDate', data.startDate); }
    }
    if (data.endDate && String(data.endDate).trim() !== '') {
      try { formData.append('endDate', new Date(data.endDate).toISOString()); } catch (_) { formData.append('endDate', data.endDate); }
    }

    if (data.metaData !== undefined && data.metaData !== null) {
      formData.append('metaData', typeof data.metaData === 'object' ? JSON.stringify(data.metaData) : data.metaData);
    }
    if (data.isFeatured !== undefined && data.isFeatured !== null) formData.append('isFeatured', data.isFeatured);
    if (data.page !== undefined && data.page !== null) formData.append('page', data.page);
    if (data.buttonText !== undefined && data.buttonText !== null) formData.append('buttonText', data.buttonText);

    const response = await apiClient.post('/admin/home-content/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Add home content error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to add home content.',
      statusCode: 500
    };
  }
};

/**
 * Fetch homepage banner content items (GET /admin/home-content/list)
 * @param {Object} params - Query parameters for pagination / filtering
 */
export const getHomeContents = async (params = {}) => {
  try {
    // Attempt fetching from standard list endpoint
    const response = await apiClient.get('/admin/home-content/list', { params });
    return response.data;
  } catch (error) {
    // Resilient fallback to base route if /list returns 404
    if (error.response?.status === 404) {
      try {
        const response = await apiClient.get('/admin/home-content', { params });
        return response.data;
      } catch (innerErr) {
        console.error('Fetch home contents base fallback error:', innerErr);
      }
    }
    console.error('Fetch home contents error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch home contents.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all home contents (public view, no authorization token required)
 * GET /admin/home-content/get-all
 */
export const getHomeContentsPublic = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/home-content/get-all', {
      params,
      skipAuth: true
    });
    return response.data;
  } catch (error) {
    console.error('Fetch home contents public error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch public home contents.',
      statusCode: 500
    };
  }
};

/**
 * Update homepage banner / content configuration (PUT /admin/home-content/update/:id)
 * @param {string} id - The home content config ID
 * @param {Object} data - Configuration attributes including files to upload
 */
export const updateHomeContent = async (id, data) => {
  try {
    const formData = new FormData();

    // Core text attributes
    if (data.title !== undefined && data.title !== null) formData.append('title', data.title);
    if (data.subTitle !== undefined && data.subTitle !== null) formData.append('subTitle', data.subTitle);
    if (data.description !== undefined && data.description !== null) formData.append('description', data.description);

    // Append tags/labels if present
    if (data.labels && Array.isArray(data.labels)) {
      data.labels.forEach((label, index) => {
        formData.append(`labels[${index}]`, label);
      });
    }

    // Multi-platform banner images (Only append if they are new File instances)
    if (data.computerImage instanceof File) {
      formData.append('computerImage', data.computerImage);
    }
    if (data.mobileImage instanceof File) {
      formData.append('mobileImage', data.mobileImage);
    }

    // Styling & configuration controls
    if (data.contentType !== undefined && data.contentType !== null) formData.append('contentType', data.contentType);
    if (data.redirectType !== undefined && data.redirectType !== null) formData.append('redirectType', data.redirectType);
    if (data.redirectId !== undefined && data.redirectId !== null) formData.append('redirectId', data.redirectId);
    if (data.redirectUrl !== undefined && data.redirectUrl !== null) formData.append('redirectUrl', data.redirectUrl);
    if (data.backgroundColor !== undefined && data.backgroundColor !== null) formData.append('backgroundColor', data.backgroundColor);
    if (data.textColor !== undefined && data.textColor !== null) formData.append('textColor', data.textColor);
    if (data.displayOrder !== undefined && data.displayOrder !== null) formData.append('displayOrder', data.displayOrder);
    if (data.startDate && String(data.startDate).trim() !== '') {
      try { formData.append('startDate', new Date(data.startDate).toISOString()); } catch (_) { formData.append('startDate', data.startDate); }
    }
    if (data.endDate && String(data.endDate).trim() !== '') {
      try { formData.append('endDate', new Date(data.endDate).toISOString()); } catch (_) { formData.append('endDate', data.endDate); }
    }

    if (data.metaData !== undefined && data.metaData !== null) {
      formData.append('metaData', typeof data.metaData === 'object' ? JSON.stringify(data.metaData) : data.metaData);
    }
    if (data.isFeatured !== undefined && data.isFeatured !== null) formData.append('isFeatured', data.isFeatured);
    if (data.page !== undefined && data.page !== null) formData.append('page', data.page);
    if (data.buttonText !== undefined && data.buttonText !== null) formData.append('buttonText', data.buttonText);

    const response = await apiClient.put(`/admin/home-content/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update home content error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update home content.',
      statusCode: 500
    };
  }
};

/**
 * Delete homepage banner / content config (DELETE /admin/home-content/delete-home-content/:id)
 * @param {string} id - The banner config ID
 */
export const deleteHomeContent = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/home-content/delete-home-content/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete home content error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete home content.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed homepage banner configuration by ID (GET /admin/home-content/get-details/:id)
 * @param {string} id - The banner config ID
 */
export const getHomeContentDetails = async (id) => {
  try {
    const response = await apiClient.get(`/admin/home-content/get-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch home content details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch home content details.',
      statusCode: 500
    };
  }
};

/**
 * Approve or Reject an Educator profile
 * Method: PUT
 * URL: /educator/approve/:educatorId
 * @param {string} educatorId
 * @param {boolean} isApproved
 */
export const approveEducator = async (educatorId, isApproved) => {
  try {
    const response = await apiClient.put(`/educator/approve/${educatorId}`, { isApproved });
    return response.data;
  } catch (error) {
    console.error('Approve educator error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update educator status.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch all pending educator approval profiles
 * Method: GET
 * URL: /educator/pending-approvals
 */
export const getPendingEducators = async () => {
  try {
    const response = await apiClient.get('/educator/pending-approvals');
    return response.data;
  } catch (error) {
    console.error('Fetch pending educators error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch pending educators.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Toggle Educator Active status
 * Method: PUT
 * URL: /educator/toggle-active/:educatorId
 * @param {string} educatorId
 * @param {boolean} isActive
 */
export const toggleEducatorActive = async (educatorId, isActive) => {
  try {
    const response = await apiClient.put(`/educator/toggle-active/${educatorId}`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Toggle educator active error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to toggle educator status.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch all educators list
 * Method: GET
 * URL: /educator/list
 */
export const getAllEducators = async () => {
  try {
    const response = await apiClient.get('/educator/list');
    return response.data;
  } catch (error) {
    console.error('Fetch all educators error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch educators.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Add a new Course Category
 * Method: POST
 * URL: /courses/add-course-category
 * @param {FormData} formData
 */
export const addCourseCategory = async (formData) => {
  try {
    const response = await apiClient.post('/courses/add-course-category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Add course category error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add course category.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Get all Course Categories
 * Method: GET
 * URL: /courses/get-all-course-categories
 */
export const getCourseCategories = async () => {
  try {
    const response = await apiClient.get('/courses/get-all-course-categories');
    return response.data;
  } catch (error) {
    console.error('Get course categories error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch course categories.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Get Course Category Details by ID
 * Method: GET
 * URL: /courses/course-category-details/:id
 * @param {string} id - Course Category ID
 */
export const getCourseCategoryDetails = async (id) => {
  try {
    const response = await apiClient.get(`/courses/course-category-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get course category details error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch category details.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Delete a Course Category by ID
 * Method: DELETE
 * URL: /courses/delete-course-category/:id
 * @param {string} id - Course Category ID
 */
export const deleteCourseCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/courses/delete-course-category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete course category error:', error.response || error);
    return error.response?.data || {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete course category.',
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Fetch all cashback slabs
 * Method: GET
 * URL: /wallet/admin/cashback-slabs/list-cashback-slab
 */
export const getAllCashbackSlabs = async () => {
  try {
    const response = await apiClient.get('/wallet/admin/cashback-slabs/list-cashback-slab');
    return response.data;
  } catch (error) {
    console.error('Fetch cashback slabs error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch cashback slabs.',
      statusCode: 500
    };
  }
};

/**
 * Create a new cashback slab
 * Method: POST
 * URL: /wallet/admin/cashback-slabs/add-cashback-slab
 */
export const createCashbackSlab = async (data) => {
  try {
    const response = await apiClient.post('/wallet/admin/cashback-slabs/add-cashback-slab', data);
    return response.data;
  } catch (error) {
    console.error('Create cashback slab error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to create cashback slab.',
      statusCode: 500
    };
  }
};

/**
 * Update an existing cashback slab
 * Method: PUT
 * URL: /wallet/admin/cashback-slabs/update-cashback-slab/:id
 */
export const updateCashbackSlab = async (id, data) => {
  try {
    const response = await apiClient.put(`/wallet/admin/cashback-slabs/update-cashback-slab/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update cashback slab error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update cashback slab.',
      statusCode: 500
    };
  }
};

/**
 * Delete a cashback slab by ID
 * Method: DELETE
 * URL: /wallet/admin/cashback-slabs/delete-cashback-slab/:id
 */
export const deleteCashbackSlab = async (id) => {
  try {
    const response = await apiClient.delete(`/wallet/admin/cashback-slabs/delete-cashback-slab/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete cashback slab error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete cashback slab.',
      statusCode: 500
    };
  }
};

/**
 * Fetch users wallet balances
 * Method: GET
 * URL: /wallet/admin/balances/users
 */
export const getUsersBalances = async () => {
  try {
    const response = await apiClient.get('/wallet/admin/balances/users');
    return response.data;
  } catch (error) {
    console.error('Fetch users balances error:', error);
    return error.response?.data || { success: false, message: 'Failed to fetch users balances.' };
  }
};

/**
 * Fetch vendors wallet balances
 * Method: GET
 * URL: /wallet/admin/balances/vendors
 */
export const getVendorsBalances = async () => {
  try {
    const response = await apiClient.get('/wallet/admin/balances/vendors');
    return response.data;
  } catch (error) {
    console.error('Fetch vendors balances error:', error);
    return error.response?.data || { success: false, message: 'Failed to fetch vendors balances.' };
  }
};

/**
 * Fetch influencers wallet balances
 * Method: GET
 * URL: /wallet/admin/balances/influencers
 */
export const getInfluencersBalances = async () => {
  try {
    const response = await apiClient.get('/wallet/admin/balances/influencers');
    return response.data;
  } catch (error) {
    console.error('Fetch influencers balances error:', error);
    return error.response?.data || { success: false, message: 'Failed to fetch influencers balances.' };
  }
};

/**
 * Fetch service providers wallet balances
 * Method: GET
 * URL: /wallet/admin/balances/service-providers
 */
export const getServiceProvidersBalances = async () => {
  try {
    const response = await apiClient.get('/wallet/admin/balances/service-providers');
    return response.data;
  } catch (error) {
    console.error('Fetch service providers balances error:', error);
    return error.response?.data || { success: false, message: 'Failed to fetch service providers balances.' };
  }
};

/**
 * Fetch educators wallet balances
 * Method: GET
 * URL: /wallet/admin/balances/educators
 */
export const getEducatorsBalances = async () => {
  try {
    const response = await apiClient.get('/wallet/admin/balances/educators');
    return response.data;
  } catch (error) {
    console.error('Fetch educators balances error:', error);
    return error.response?.data || { success: false, message: 'Failed to fetch educators balances.' };
  }
};

/**
 * Fetch platform wallet balance details
 * Method: GET
 * URL: /wallet/admin/balances/platform
 */
export const getPlatformBalances = async () => {
  try {
    const response = await apiClient.get('/wallet/admin/balances/platform');
    return response.data;
  } catch (error) {
    console.error('Fetch platform balances error:', error);
    return error.response?.data || { success: false, message: 'Failed to fetch platform balances.' };
  }
};

/**
 * Fetch specific vendor wallet balance details
 * Method: GET
 * URL: /wallet/admin/vendor/:vendorId/balance
 */
export const getVendorWalletBalance = async (vendorId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/vendor/${vendorId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Fetch vendor wallet balance error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch vendor wallet balance.',
      statusCode: 500
    };
  }
};

/**
 * Fetch specific vendor wallet transactions details
 * Method: GET
 * URL: /wallet/admin/vendor/:vendorId/transactions
 */
export const getVendorWalletTransactions = async (vendorId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/vendor/${vendorId}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Fetch vendor wallet transactions error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch vendor wallet transactions.',
      statusCode: 500
    };
  }
};

/**
 * Fetch specific service provider wallet balance details
 * Method: GET
 * URL: /wallet/admin/service-provider/:serviceProviderId/balance
 */
export const getServiceProviderWalletBalance = async (serviceProviderId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/service-provider/${serviceProviderId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Fetch service provider wallet balance error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch service provider wallet balance.',
      statusCode: 500
    };
  }
};

/**
 * Fetch specific influencer wallet balance details
 * Method: GET
 * URL: /wallet/admin/influencer/:influencerId/balance
 */
export const getInfluencerWalletBalance = async (influencerId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/influencer/${influencerId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Fetch influencer wallet balance error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer wallet balance.',
      statusCode: 500
    };
  }
};

/**
 * Fetch specific influencer wallet transactions details
 * Method: GET
 * URL: /wallet/admin/influencer/:influencerId/transactions
 */
export const getInfluencerWalletTransactions = async (influencerId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/influencer/${influencerId}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Fetch influencer wallet transactions error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer wallet transactions.',
      statusCode: 500
    };
  }
};

/**
 * Fetch specific educator wallet balance details
 * Method: GET
 * URL: /wallet/admin/educator/:educatorId/balance
 */
export const getEducatorWalletBalance = async (educatorId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/educator/${educatorId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Fetch educator wallet balance error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch educator wallet balance.',
      statusCode: 500
    };
  }
};

/**
 * Fetch specific educator wallet transactions details
 * Method: GET
 * URL: /wallet/admin/educator/:educatorId/transactions
 */
export const getEducatorWalletTransactions = async (educatorId) => {
  try {
    const response = await apiClient.get(`/wallet/admin/educator/${educatorId}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Fetch educator wallet transactions error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch educator wallet transactions.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all support tickets
 * Method: GET
 * URL: /ticket/get-all-tickets
 */
export const getAllTickets = async (params = {}) => {
  try {
    const response = await apiClient.get('/ticket/get-all-tickets', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch all tickets error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch tickets.',
      statusCode: 500
    };
  }
};

/**
 * Update support ticket status
 * Method: PUT
 * URL: /ticket/update-status/:ticketId
 */
export const updateTicketStatus = async (ticketId, payload) => {
  try {
    const response = await apiClient.put(`/ticket/update-status/${ticketId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update ticket status error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update ticket status.',
      statusCode: 500
    };
  }
};

/**
 * Delete support ticket
 * Method: DELETE
 * URL: /ticket/delete/:ticketId
 */
export const deleteTicket = async (ticketId) => {
  try {
    const response = await apiClient.delete(`/ticket/delete/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('Delete ticket error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete ticket.',
      statusCode: 500
    };
  }
};

/**
 * Add a new sub-admin
 * Method: POST
 * URL: /admin/sub-admins/add
 */
export const addSubAdmin = async (payload) => {
  try {
    const response = await apiClient.post('/admin/sub-admins/add', payload);
    return response.data;
  } catch (error) {
    console.error('Add sub-admin error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to add sub-admin.',
      statusCode: 500
    };
  }
};

/**
 * Get all sub-admins
 * Method: GET
 * URL: /admin/sub-admins/all
 */
export const getSubAdmins = async () => {
  try {
    const response = await apiClient.get('/admin/sub-admins/all');
    return response.data;
  } catch (error) {
    console.error('Get sub-admins error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch sub-admins.',
      statusCode: 500
    };
  }
};

/**
 * Update a sub-admin (full modification)
 * Method: PUT
 * URL: /admin/sub-admins/update-sub-admin/:id
 */
export const updateSubAdmin = async (id, payload) => {
  try {
    const response = await apiClient.put(`/admin/sub-admins/update-sub-admin/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update sub-admin error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update sub-admin.',
      statusCode: 500
    };
  }
};

/**
 * Delete a sub-admin
 * Method: DELETE
 * URL: /admin/sub-admins/:id
 */
export const deleteSubAdmin = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/sub-admins/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete sub-admin error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete sub-admin.',
      statusCode: 500
    };
  }
};

/**
 * Get sub-admin details by ID
 * Method: GET
 * URL: /admin/sub-admins/sub-admin-details/:id
 */
export const getSubAdminDetails = async (id) => {
  try {
    const response = await apiClient.get(`/admin/sub-admins/sub-admin-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get sub-admin details error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch sub-admin details.',
      statusCode: 500
    };
  }
};

/**
 * Fetch affiliate dashboard stats for admin
 * Method: GET
 * URL: /affiliate-dashboard/admin
 */
export const getAdminAffiliateDashboard = async () => {
  try {
    const response = await apiClient.get('/affiliate-dashboard/admin');
    return response.data;
  } catch (error) {
    console.error('Fetch admin affiliate dashboard error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch admin affiliate dashboard stats.',
      statusCode: 500
    };
  }
};

/**
 * Fetch affiliate ranking leaderboard for admin
 * Method: GET
 * URL: /affiliate-dashboard/ranking
 * Params: month, year
 */
export const getAffiliateRanking = async (month, year) => {
  try {
    const response = await apiClient.get('/affiliate-dashboard/ranking', {
      params: { month, year }
    });
    return response.data;
  } catch (error) {
    console.error('Fetch affiliate ranking error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch affiliate ranking leaderboard.',
      statusCode: 500
    };
  }
};

/**
 * Get logged-in admin profile details
 * Method: GET
 * URL: /admin/profile/me
 */
export const getAdminProfile = async () => {
  try {
    const response = await apiClient.get('/admin/profile/me');
    return response.data;
  } catch (error) {
    console.error('Get admin profile error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch admin profile.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all notification campaigns
 * Method: GET
 * URL: /admin/notification/all-campaigns
 * Params: page, limit
 */
export const getAllCampaigns = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get('/admin/notification/all-campaigns', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Fetch notification campaigns error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch notification campaigns.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all notifications
 * Method: GET
 * URL: /admin/notification/all-notifications
 * Params: page, limit
 */
export const getAllNotifications = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get('/admin/notification/all-notifications', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Fetch all notifications error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch all notifications.',
      statusCode: 500
    };
  }
};

/**
 * Create a new notification campaign
 * Method: POST
 * URL: /admin/notification/add-campaign
 * Body: { title, body, moduleType, action, data, sendOption, actionUrl, targetRoles, [scheduledAt], [isRecurring] }
 */
export const addCampaign = async (payload) => {
  try {
    const response = await apiClient.post('/admin/notification/add-campaign', payload);
    return response.data;
  } catch (error) {
    console.error('Create campaign error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to create campaign.',
      statusCode: 500
    };
  }
};

/**
 * Update a notification campaign
 * Method: PUT
 * URL: /admin/notification/update-campaign/:id
 * Body: { title, body, action, actionUrl, scheduledAt, targetRoles, sendOption }
 */
export const updateCampaign = async (id, payload) => {
  try {
    const response = await apiClient.put(`/admin/notification/update-campaign/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update campaign error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update campaign.',
      statusCode: 500
    };
  }
};

/**
 * Delete a notification campaign
 * Method: DELETE
 * URL: /admin/notification/delete-campaign/:id
 */
export const deleteCampaign = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/notification/delete-campaign/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete campaign error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete campaign.',
      statusCode: 500
    };
  }
};

/**
 * Fetch all service leads for admin panel
 * Method: GET
 * URL: /service-leads/admin/all
 */
export const getAllServiceLeadsAdmin = async () => {
  try {
    const response = await apiClient.get('/service-leads/admin/all');
    return response.data;
  } catch (error) {
    console.error('Fetch all service leads admin error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch service leads.',
      statusCode: 500
    };
  }
};

/**
 * Delete a service lead by ID (Admin only)
 * Method: DELETE
 * URL: /service-leads/admin/delete-lead/:id
 * @param {string} id - The Lead ID
 */
export const deleteServiceLeadAdmin = async (id) => {
  try {
    const response = await apiClient.delete(`/service-leads/admin/delete-lead/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete service lead admin error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete service lead.',
      statusCode: 500
    };
  }
};

/**
 * Admin update custom commission rate for an influencer
 * Method: PUT
 * Route: /influencers/:id/commission-rate
 * @param {string} influencerId
 * @param {number|null} commissionRate
 */
export const updateInfluencerCommissionRate = async (influencerId, commissionRate) => {
  try {
    const response = await apiClient.put(`/influencers/${influencerId}/commission-rate`, {
      commissionRate
    });
    return response.data;
  } catch (error) {
    console.error('Update influencer commission rate error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update commission rate.',
      statusCode: 500
    };
  }
};

/**
 * Get all creator payout requests for admin
 * GET /payout/influencer-payouts
 */
export const getAdminInfluencerPayouts = async (params = {}) => {
  try {
    const response = await apiClient.get('/payout/influencer-payouts', { params });
    return response.data;
  } catch (error) {
    console.error('Get admin influencer payouts error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer payouts.',
      statusCode: 500
    };
  }
};

/**
 * Admin settle creator payout request
 * POST /payout/influencer-payout/settle
 */
export const settleAdminInfluencerPayout = async (payload) => {
  try {
    const response = await apiClient.post('/payout/influencer-payout/settle', payload);
    return response.data;
  } catch (error) {
    console.error('Settle influencer payout error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to settle payout.',
      statusCode: 500
    };
  }
};

/**
 * Admin reject creator payout request
 * POST /payout/influencer-payout/reject
 */
export const rejectAdminInfluencerPayout = async (payload) => {
  try {
    const response = await apiClient.post('/payout/influencer-payout/reject', payload);
    return response.data;
  } catch (error) {
    console.error('Reject influencer payout error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to reject payout.',
      statusCode: 500
    };
  }
};




