// Authentication service for FireworksPlay Release Notes Dashboard
// Handles user authentication, registration, and session management

import React from 'react';

const WORKER_API_URL = process.env.REACT_APP_WORKER_API_URL || 'https://fireworksplay-database-api.khanhduy-dev-bt.workers.dev';

if (!process.env.REACT_APP_WORKER_API_URL) {
  console.warn('REACT_APP_WORKER_API_URL environment variable is not set, using default:', WORKER_API_URL);
}

// Token storage keys
const TOKEN_KEY = 'fireworksplay_auth_token';
const USER_KEY = 'fireworksplay_user_data';

// Authentication service
class AuthService {
  constructor() {
    this.token = this.getToken();
    this.user = this.getUser();
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Get stored user data
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Store authentication data
  _storeAuthData(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token = token;
    this.user = user;
  }

  // Clear authentication data
  _clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token = null;
    this.user = null;
  }

  // Register new user
  async register(userData) {
    // WORKER_API_URL now has a fallback, so no need to check

    try {
      const response = await fetch(`${WORKER_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        this._storeAuthData(data.token, data.user);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  async login(credentials) {
    // WORKER_API_URL now has a fallback, so no need to check

    try {
      const response = await fetch(`${WORKER_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        this._storeAuthData(data.token, data.user);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Logout user
  async logout() {
    if (!WORKER_API_URL) {
      this._clearAuthData();
      return { success: true, message: 'Logged out locally' };
    }

    try {
      const response = await fetch(`${WORKER_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      // Clear local data regardless of server response
      this._clearAuthData();

      return data;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if server logout fails
      this._clearAuthData();
      return { success: true, message: 'Logged out locally' };
    }
  }

  // Get current user from server
  async getCurrentUser() {
    if (!this.token) {
      throw new Error('No authentication token found');
    }

    // WORKER_API_URL now has a fallback, so no need to check

    try {
      const response = await fetch(`${WORKER_API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear local data
          this._clearAuthData();
        }
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        this.user = data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error(`Failed to get user data: ${error.message}`);
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Check if user has admin role
  isAdmin() {
    return this.user && this.user.role === 'admin';
  }

  // Get authorization headers for API requests
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  // Validate token by checking current user
  async validateToken() {
    if (!this.token) {
      return false;
    }

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      this._clearAuthData();
      return false;
    }
  }

  // Refresh user data
  async refreshUserData() {
    if (!this.isAuthenticated()) {
      throw new Error('User is not authenticated');
    }

    return await this.getCurrentUser();
  }
}

// Create singleton instance
const authService = new AuthService();

// Export the service and individual functions for convenience
export default authService;

export const {
  register: registerUser,
  login: loginUser,
  logout: logoutUser,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  getAuthHeaders,
  validateToken,
  refreshUserData,
} = {
  register: (userData) => authService.register(userData),
  login: (credentials) => authService.login(credentials),
  logout: () => authService.logout(),
  getCurrentUser: () => authService.getCurrentUser(),
  isAuthenticated: () => authService.isAuthenticated(),
  isAdmin: () => authService.isAdmin(),
  getAuthHeaders: () => authService.getAuthHeaders(),
  validateToken: () => authService.validateToken(),
  refreshUserData: () => authService.refreshUserData(),
};

// React hook for authentication state
export const useAuth = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.token) {
          const isValid = await authService.validateToken();
          setIsAuthenticated(isValid);
          setUser(isValid ? authService.user : null);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  };

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    register,
    refreshUserData: authService.refreshUserData.bind(authService),
  };
};