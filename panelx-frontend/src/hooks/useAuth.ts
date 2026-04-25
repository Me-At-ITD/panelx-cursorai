import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import API_CONFIG from '../config/api';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

interface LogoutRequest {
  refresh_token: string;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiInstance = useRef<AxiosInstance | null>(null);
  const isRefreshing = useRef(false);
  const failedQueue = useRef<Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }>>([]);

  const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.current.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue.current = [];
  };

  const createApiInstance = useCallback((): AxiosInstance => {
    const instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: API_CONFIG.HEADERS,
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with proper refresh handling
    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // If not 401 or already retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // Don't try to refresh if the request is to /auth/refresh itself
        if (originalRequest.url?.includes('/auth/refresh')) {
          console.error('❌ REFRESH API ITSELF FAILED with 401');
          console.error('This means refresh_token is invalid or server rejected it');
          
          // ⚠️ DEBUG MODE: Do NOT logout - allow debugging
          // localStorage.clear();
          // setIsAuthenticated(false);
          // if (!window.location.pathname.includes('/login')) {
          //   window.location.href = '/login';
          // }
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing.current) {
          return new Promise((resolve, reject) => {
            failedQueue.current.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing.current = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (!refreshToken) {
            throw new Error('No refresh token found');
          }

          console.log('🔄 INTERCEPTOR: Attempting token refresh...');
          console.log('Refresh token:', refreshToken.substring(0, 20) + '...');
          
          // ✅ CORRECT: Send refresh_token in request body
          const response = await axios.post<RefreshTokenResponse>(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }, // Body with refresh_token
            { headers: API_CONFIG.HEADERS }
          );

          const { access_token, refresh_token: newRefreshToken } = response.data;
          
          console.log('✅ INTERCEPTOR: Refresh succeeded');
          console.log('New access_token:', access_token ? access_token.substring(0, 20) + '...' : 'MISSING');
          console.log('New refresh_token:', newRefreshToken ? newRefreshToken.substring(0, 20) + '...' : 'MISSING');
          
          // Save new tokens
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          console.log('✅ INTERCEPTOR: New tokens stored');
          
          // Update instance default headers
          instance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          // Process queued requests
          processQueue(null, access_token);
          
          // Retry original request
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return instance(originalRequest);
          
        } catch (refreshError: any) {
          console.error('❌ INTERCEPTOR: Refresh token failed');
          console.error('Error status:', refreshError.response?.status);
          console.error('Error data:', refreshError.response?.data);
          console.error('Error message:', refreshError.message);
          
          // ⚠️ DEBUG MODE: Do NOT logout on refresh failure
          // This allows you to debug the API issue without being kicked out
          // TODO: Once refresh API is fixed, uncomment logout logic below
          
          // // Clear all tokens
          // localStorage.clear();
          // setIsAuthenticated(false);
          
          // Reject all queued requests
          processQueue(refreshError, null);
          
          // // Only redirect if not already on login page
          // if (!window.location.pathname.includes('/login')) {
          //   window.location.href = '/login';
          // }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing.current = false;
        }
      }
    );

    return instance;
  }, []);

  const getApi = useCallback((): AxiosInstance => {
    if (!apiInstance.current) {
      apiInstance.current = createApiInstance();
    }
    return apiInstance.current;
  }, [createApiInstance]);

  // Check authentication and validate token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (accessToken && refreshToken) {
        // Optional: Validate token expiry
        try {
          const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
          const isExpired = Date.now() >= tokenData.exp * 1000;
          
          if (isExpired) {
            console.log('Token expired, attempting refresh...');
            const refreshSuccess = await attemptTokenRefresh();
            setIsAuthenticated(refreshSuccess);
          } else {
            setIsAuthenticated(true);
          }
        } catch (e) {
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    const attemptTokenRefresh = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;
      
      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: API_CONFIG.HEADERS }
        );
        
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        return true;
      } catch (error) {
        console.error('Initial token refresh failed:', error);
        localStorage.clear();
        return false;
      }
    };
    
    checkAuth();
  }, []);

  // Automatically refresh token every 1 minute when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshTokenInterval = setInterval(async () => {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        console.warn('No refresh_token found in localStorage');
        return;
      }

      try {
        console.log('=== AUTO-REFRESH ATTEMPT ===');
        console.log('Current refresh_token:', refreshTokenValue.substring(0, 20) + '...');
        
        const response = await axios.post<RefreshTokenResponse>(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refresh_token: refreshTokenValue },
          { headers: API_CONFIG.HEADERS }
        );

        console.log('✅ Refresh API Response Status:', response.status);
        console.log('Response data:', response.data);
        
        const { access_token, refresh_token, token_type } = response.data;
        
        console.log('New access_token:', access_token ? access_token.substring(0, 20) + '...' : 'MISSING');
        console.log('New refresh_token:', refresh_token ? refresh_token.substring(0, 20) + '...' : 'MISSING');
        console.log('Token type:', token_type);

        // Store the tokens
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        console.log('✅ Tokens stored in localStorage');
        console.log('Stored access_token:', localStorage.getItem('access_token')?.substring(0, 20) + '...');
        console.log('Stored refresh_token:', localStorage.getItem('refresh_token')?.substring(0, 20) + '...');
        
        // Update instance default headers with new token
        const api = getApi();
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        console.log('✅ Axios instance headers updated');
        console.log('=== AUTO-REFRESH SUCCEEDED ===\n');
      } catch (error: any) {
        console.error('❌ AUTO-REFRESH FAILED');
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Error message:', error.message);
        console.error('=== AUTO-REFRESH ERROR END ===\n');
        // ⚠️ DEBUG MODE: Do NOT logout - allow you to see the error
        // Once fixed, remove this comment and add logout logic back
      }
    }, 20 * 60 * 1000); // Refresh every 20 minutes (1200 seconds) - Backend TTL is 30 minutes

    return () => clearInterval(refreshTokenInterval);
  }, [isAuthenticated, getApi]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<AuthTokens>(
        `${API_CONFIG.BASE_URL}/auth/login`,
        credentials,
        { headers: API_CONFIG.HEADERS }
      );
      
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setIsAuthenticated(true);
      setIsLoading(false);
      
      return { success: true };
    } catch (error: any) {
      setIsAuthenticated(false);
      setIsLoading(false);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0].msg;
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/auth/forgot-password`,
        { email },
        { headers: API_CONFIG.HEADERS }
      );
      
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      
      let errorMessage = 'Failed to send reset link. Please try again.';
      if (error.response?.status === 422) {
        errorMessage = 'Invalid email address';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0].msg;
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/auth/reset-password`,
        { token, new_password: newPassword },
        { headers: API_CONFIG.HEADERS }
      );
      
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      if (error.response?.status === 422) {
        errorMessage = 'Invalid or expired reset token';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0].msg;
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const api = getApi(); // Use the API client with interceptors
      
      if (refreshToken) {
        try {
          // Call logout using the API client - interceptor will handle token refresh if needed
          await api.post(
            `/auth/logout`,
            { refresh_token: refreshToken }
          );
        } catch (err: any) {
          console.error('Logout API error:', err.message);
          // Continue with logout even if API call fails
        }
      }
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
    } finally {
      // Only clear tokens AFTER logout attempt completes
      localStorage.clear();
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
      apiInstance.current = null;
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }, [getApi]);

  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      return { success: false };
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${API_CONFIG.BASE_URL}/auth/refresh`,
        { refresh_token: refreshTokenValue },
        { headers: API_CONFIG.HEADERS }
      );
      
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      
      setIsAuthenticated(true);
      return { success: true, token: response.data.access_token };
    } catch (error) {
      console.error('Manual refresh failed:', error);
      localStorage.clear();
      setIsAuthenticated(false);
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return { success: false };
    }
  }, []);
const getTokenExpiryTime = useCallback((): number | null => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) return null;
  
  try {
    const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
    return tokenData.exp * 1000; // Convert to milliseconds
  } catch (e) {
    console.error('Failed to parse token expiry:', e);
    return null;
  }
}, []);


const isTokenExpired = useCallback((): boolean => {
  const expiryTime = getTokenExpiryTime();
  if (!expiryTime) return true;
  return Date.now() >= expiryTime;
}, [getTokenExpiryTime]);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    forgotPassword,
    resetPassword,
    logout,
    refreshToken,
    getApi,
    getTokenExpiryTime, 
     isTokenExpired,  
  };
}