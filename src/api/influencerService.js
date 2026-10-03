import apiClient from './apiClient';

/**
 * Fetch detailed influencer overview (sales, commissions, orders)
 * Method: GET
 * Route: /influencers/overview
 */
export const getInfluencerOverview = async () => {
  try {
    const response = await apiClient.get('/influencers/overview');
    return response.data;
  } catch (error) {
    console.error('Fetch influencer overview error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer overview.',
      statusCode: 500
    };
  }
};

/**
 * Fetch audience & buyer analytics for logged in influencer
 * Method: GET
 * Route: /influencers/audience-analytics
 */
export const getInfluencerAudienceAnalytics = async () => {
  try {
    const response = await apiClient.get('/influencers/audience-analytics');
    return response.data;
  } catch (error) {
    console.error('Fetch influencer audience analytics error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch audience analytics.',
      statusCode: 500
    };
  }
};

/**
 * Fetch detailed influencer analytics (commissions, orders, coupon usage, recent orders)
 * Method: GET
 * Route: /influencers/analytics
 * @param {number} days - Time duration in days (default: 45)
 */
export const getInfluencerAnalytics = async (days = 45) => {
  try {
    const response = await apiClient.get('/influencers/analytics', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Fetch influencer analytics error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer analytics.',
      statusCode: 500
    };
  }
};

/**
 * Generate affiliate referral link for the influencer
 * Method: POST
 * Route: /affiliate-program/generate-link
 */
export const generateAffiliateLink = async () => {
  try {
    const response = await apiClient.post('/affiliate-program/generate-link');
    return response.data;
  } catch (error) {
    console.error('Generate affiliate link error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to generate affiliate link.',
      statusCode: 500
    };
  }
};

/**
 * Fetch affiliate dashboard stats and pie chart data for influencer
 * Method: GET
 * Route: /affiliate-dashboard/influencer
 */
export const getAffiliateDashboardStats = async () => {
  try {
    const response = await apiClient.get('/affiliate-dashboard/influencer');
    return response.data;
  } catch (error) {
    console.error('Fetch affiliate dashboard stats error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch affiliate dashboard stats.',
      statusCode: 500
    };
  }
};

/**
 * Submit a new influencer story
 * Method: POST
 * Route: /influencers/submit-story
 * Body: { storyUrl }
 */
export const submitStory = async (storyData) => {
  try {
    const response = await apiClient.post('/influencers/submit-story', storyData);
    return response.data;
  } catch (error) {
    console.error('Submit story error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to submit story.',
      statusCode: 500
    };
  }
};

/**
 * Fetch public influencer stories
 * Method: GET
 * Route: /influencers/get-influencer-stories
 */
export const getInfluencerStories = async () => {
  try {
    const response = await apiClient.get('/influencers/get-influencer-stories');
    return response.data;
  } catch (error) {
    console.error('Fetch influencer stories error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch influencer stories.',
      statusCode: 500
    };
  }
};

/**
 * Delete an influencer story by ID
 * Method: DELETE
 * Route: /influencers/delete-story/:id
 */
export const deleteStory = async (id) => {
  try {
    const response = await apiClient.delete(`/influencers/delete-story/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete story error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete story.',
      statusCode: 500
    };
  }
};

/**
 * Fetch influencer tasks
 * Method: GET
 * Route: /influencer-taskbar/get-task-data
 */
export const getTaskData = async () => {
  try {
    const response = await apiClient.get('/influencer-taskbar/get-task-data');
    return response.data;
  } catch (error) {
    console.error('Fetch task data error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch task data.',
      statusCode: 500
    };
  }
};

/**
 * Submit campaign task data
 * Method: POST
 * Route: /influencer-taskbar/submit-task-data
 * Body: { mediaLink, platform, postingDate }
 */
export const submitTaskData = async (taskData) => {
  try {
    const response = await apiClient.post('/influencer-taskbar/submit-task-data', taskData);
    return response.data;
  } catch (error) {
    console.error('Submit task data error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to submit task data.',
      statusCode: 500
    };
  }
};

/**
 * Update campaign task data by ID
 * Method: PUT
 * Route: /influencer-taskbar/update-task-data/:id
 * Body: { mediaLink, platform, postingDate }
 */
export const updateTaskData = async (id, taskData) => {
  try {
    const response = await apiClient.put(`/influencer-taskbar/update-task-data/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Update task data error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to update task data.',
      statusCode: 500
    };
  }
};

/**
 * Delete campaign task data by ID
 * Method: DELETE
 * Route: /influencer-taskbar/delete-task-data/:id
 */
export const deleteTaskData = async (id) => {
  try {
    const response = await apiClient.delete(`/influencer-taskbar/delete-task-data/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete task data error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to delete task data.',
      statusCode: 500
    };
  }
};

/**
 * Fetch influencer wallet balance details
 * Method: GET
 * Route: /wallet/influencer/balance
 */
export const getInfluencerWalletBalance = async () => {
  try {
    const response = await apiClient.get('/wallet/influencer/balance');
    return response.data;
  } catch (error) {
    console.error('Fetch influencer wallet balance error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch wallet balance.',
      statusCode: 500
    };
  }
};

/**
 * Fetch influencer wallet transactions log list
 * Method: GET
 * Route: /wallet/influencer/transactions
 */
export const getInfluencerWalletTransactions = async () => {
  try {
    const response = await apiClient.get('/wallet/influencer/transactions');
    return response.data;
  } catch (error) {
    console.error('Fetch influencer wallet transactions error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch wallet transactions.',
      statusCode: 500
    };
  }
};

/**
 * Validate customer referral code
 * Method: GET
 * Route: /influencers/check-referral/:code
 * @param {string} code
 */
export const checkReferralCode = async (code) => {
  try {
    const response = await apiClient.get(`/influencers/check-referral/${encodeURIComponent(code)}`);
    return response.data;
  } catch (error) {
    console.error('Check referral code error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to validate referral code.',
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
 * Creator request payout for approved commissions
 * Method: POST
 * Route: /wallet/influencer/request-payout
 */
export const requestInfluencerPayout = async (payload = {}) => {
  try {
    const response = await apiClient.post('/wallet/influencer/request-payout', payload);
    return response.data;
  } catch (error) {
    console.error('Request influencer payout error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to request payout.',
      statusCode: 500
    };
  }
};

/**
 * Creator get payout requests history
 * Method: GET
 * Route: /wallet/influencer/payout-requests
 */
export const getInfluencerPayoutRequests = async () => {
  try {
    const response = await apiClient.get('/wallet/influencer/payout-requests');
    return response.data;
  } catch (error) {
    console.error('Get influencer payout requests error:', error);
    return error.response?.data || {
      success: false,
      message: 'Failed to fetch payout requests.',
      statusCode: 500
    };
  }
};



