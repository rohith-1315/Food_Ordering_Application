import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const requestTokenRefresh = async () => {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (!storedRefreshToken) {
    throw new Error('No refresh token available');
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${apiBaseURL}/auth/refresh`,
        { refreshToken: storedRefreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
      .then((response) => {
        const payload = response.data?.data || {};

        if (!payload.token) {
          throw new Error('Refresh response missing access token');
        }

        localStorage.setItem('token', payload.token);

        if (payload.refreshToken) {
          localStorage.setItem('refreshToken', payload.refreshToken);
        }

        if (payload.name && payload.email) {
          localStorage.setItem(
            'user',
            JSON.stringify({
              name: payload.name,
              email: payload.email,
            })
          );
        }

        return payload.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config || {};
    const status = err.response?.status;
    const url = originalConfig.url || '';
    const isAuthEndpoint = url.includes('/auth/');

    if (status === 401 && !originalConfig._retry && !isAuthEndpoint) {
      originalConfig._retry = true;

      try {
        const newToken = await requestTokenRefresh();
        originalConfig.headers = originalConfig.headers || {};
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalConfig);
      } catch {
        clearAuthStorage();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    if (status === 401 && isAuthEndpoint) {
      clearAuthStorage();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
