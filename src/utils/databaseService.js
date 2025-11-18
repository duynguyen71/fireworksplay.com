// Utility service for handling release notes via Cloudflare D1 Database
// Clean service with no Notion references, includes authentication

// Import authService for authentication
import authService from './authService';

// Cloudflare Worker API URL - MUST be configured in environment variables
const WORKER_API_URL = process.env.REACT_APP_WORKER_API_URL;

if (!WORKER_API_URL) {
  console.error('REACT_APP_WORKER_API_URL environment variable is not set');
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'fireworksplay_releases_cache';

const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Error reading from cache:', error);
  }
  return null;
};

const setCachedData = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Error writing to cache:', error);
  }
};

// Clear cache function
const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
};

// Fetch all releases from Cloudflare D1 database
export const fetchReleases = async (page = 1, limit = 50, useCache = true) => {
  if (!WORKER_API_URL) {
    throw new Error('Worker API URL not configured. Please set REACT_APP_WORKER_API_URL');
  }

  // Check cache first for page 1 requests (most common case)
  if (useCache && page === 1) {
    const cachedData = getCachedData();
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const headers = authService.getAuthHeaders();
    const response = await fetch(`${WORKER_API_URL}/api/releases?${params}`, {
      headers: headers, // Will be empty object if no user is logged in (public access)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache only page 1 results
    if (useCache && page === 1) {
      setCachedData(data);
    }

    return data;
  } catch (error) {
    console.error('Error fetching releases from database:', error);
    throw new Error(`Failed to fetch from Cloudflare Database: ${error.message}`);
  }
};

// Create new release
export const createRelease = async (releaseData) => {
  if (!WORKER_API_URL) {
    throw new Error('Worker API URL not configured. Please set REACT_APP_WORKER_API_URL');
  }

  try {
    const response = await fetch(`${WORKER_API_URL}/api/releases`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(releaseData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create release');
    }

    // Clear cache after creating new release
    clearCache();
    return data.release;
  } catch (error) {
    console.error('Error creating release:', error);
    throw new Error(`Failed to create release: ${error.message}`);
  }
};

// Update existing release
export const updateRelease = async (id, releaseData) => {
  if (!WORKER_API_URL) {
    throw new Error('Worker API URL not configured. Please set REACT_APP_WORKER_API_URL');
  }

  try {
    const response = await fetch(`${WORKER_API_URL}/api/releases/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(releaseData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update release');
    }

    // Clear cache after updating release
    clearCache();
    return data.release;
  } catch (error) {
    console.error('Error updating release:', error);
    throw new Error(`Failed to update release: ${error.message}`);
  }
};

// Delete release
export const deleteRelease = async (id) => {
  if (!WORKER_API_URL) {
    throw new Error('Worker API URL not configured. Please set REACT_APP_WORKER_API_URL');
  }

  try {
    const response = await fetch(`${WORKER_API_URL}/api/releases/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete release');
    }

    // Clear cache after deleting release
    clearCache();
    return true;
  } catch (error) {
    console.error('Error deleting release:', error);
    throw new Error(`Failed to delete release: ${error.message}`);
  }
};

// Search releases
export const searchReleases = async (query, limit = 50) => {
  if (!WORKER_API_URL) {
    throw new Error('Worker API URL not configured. Please set REACT_APP_WORKER_API_URL');
  }

  try {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    const response = await fetch(`${WORKER_API_URL}/api/releases/search?${params}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching releases:', error);
    throw new Error(`Failed to search releases: ${error.message}`);
  }
};

// Get statistics
export const getStats = async () => {
  if (!WORKER_API_URL) {
    throw new Error('Worker API URL not configured. Please set REACT_APP_WORKER_API_URL');
  }

  try {
    const response = await fetch(`${WORKER_API_URL}/api/stats`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw new Error(`Failed to fetch statistics: ${error.message}`);
  }
};

// Export releases
export const exportReleases = async () => {
  if (!WORKER_API_URL) {
    throw new Error('Worker API URL not configured. Please set REACT_APP_WORKER_API_URL');
  }

  try {
    const response = await fetch(`${WORKER_API_URL}/api/releases/export`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error exporting releases:', error);
    throw new Error(`Failed to export releases: ${error.message}`);
  }
};

// Get database schema info
export const getDatabaseInfo = async () => {
  if (!WORKER_API_URL) {
    throw new Error('Worker API URL not configured. Please set REACT_APP_WORKER_API_URL');
  }

  try {
    const response = await fetch(`${WORKER_API_URL}/api/schema`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching database info:', error);
    throw new Error(`Failed to fetch database info: ${error.message}`);
  }
};

// Check worker health
export const checkWorkerHealth = async () => {
  if (!WORKER_API_URL) {
    return false;
  }

  try {
    const response = await fetch(`${WORKER_API_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Worker health check failed:', error);
    return false;
  }
};

// Get worker status and configuration info
export const getWorkerInfo = () => {
  return {
    configured: !!WORKER_API_URL,
    url: WORKER_API_URL,
    mode: 'cloudflare-d1-database'
  };
};