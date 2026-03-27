import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentCSRFToken = null;

const fetchCSRFToken = async () => {
  try {
    const response = await axios.get('/api/csrf-token');
    currentCSRFToken = response.data?.csrfToken;
    return currentCSRFToken;
  } catch (error) {
    console.warn('Failed to fetch CSRF token:', error.message);
    return null;
  }
};

const ensureCSRFToken = async (config) => {
  if (!currentCSRFToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    await fetchCSRFToken();
  }
  if (currentCSRFToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    config.headers['X-CSRF-Token'] = currentCSRFToken;
  }
  return config;
};

const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config = await ensureCSRFToken(config);

  if (['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = generateIdempotencyKey();
    }
  }

  return config;
});

const clearAuthAndRedirect = () => {
  console.log('Clearing auth and redirecting to login');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Add a small delay to ensure state is cleared before redirect
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
};

export const getApiErrorMessage = (error, fallbackMessage = 'Something went wrong') => {
  const status = error?.response?.status;
  const retryAfterSeconds = error?.response?.data?.retryAfterSeconds;

  if (status === 429) {
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      return `Too many requests. Please try again in ${retryAfterSeconds} seconds.`;
    }
    return 'Too many requests. Please try again later.';
  }

  return error?.response?.data?.error || fallbackMessage;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401) {
      // Log non-401 errors for debugging
      if (error.response?.status) {
        console.warn(`API Error: ${originalRequest?.url} returned ${error.response.status}`, error.response.data);
      }
      return Promise.reject(error);
    }

    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    // If already retried or is auth endpoint, clear auth
    if (originalRequest?._retry || isAuthEndpoint) {
      console.warn('Auth check: originalRequest._retry=', originalRequest?._retry, 'isAuthEndpoint=', isAuthEndpoint);
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      console.warn('Auth check: No refresh token found in localStorage');
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      console.log('Attempting to refresh token...');
      const refreshResponse = await axios.post('/api/auth/refresh', {
        refreshToken: storedRefreshToken,
      });

      const { token: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

      if (!newAccessToken) {
        console.error('Refresh response missing token');
        clearAuthAndRedirect();
        return Promise.reject(new Error('Token refresh failed: no new token received'));
      }

      localStorage.setItem('token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      console.log('Token refreshed successfully');
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError.message, refreshError.response?.status);
      
      // Only logout on token refresh failure, not on transient errors
      if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
        clearAuthAndRedirect();
      } else {
        // For other errors (network, 500, etc.), just reject the original request
        console.warn('Refresh failed with non-auth error, retrying original request might be needed');
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;
