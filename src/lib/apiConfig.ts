// API Configuration for local and production environments
export const getApiBaseUrl = (): string => {
  // Get API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Fallback URLs for development
  if (!apiUrl) {
    console.warn('⚠️ VITE_API_BASE_URL not set, using fallback URL');
    // Use localhost for development, Railway for production
    if (import.meta.env.DEV) {
      return 'http://localhost:3001';
    }
    return 'https://web-production-df81.up.railway.app';
  }
  
  // Ensure the URL has proper protocol
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    return `https://${apiUrl}`;
  }
  
  return apiUrl;
};

export const API_BASE_URL = (() => {
  try {
    const url = getApiBaseUrl();
    console.log('🌐 API Base URL configured:', url);
    return url;
  } catch (error) {
    console.error('Failed to get API base URL:', error);
    // Fallback based on environment
    const fallbackUrl = import.meta.env.DEV 
      ? 'http://localhost:3001' 
      : 'https://web-production-df81.up.railway.app';
    console.log('🔄 Using fallback API URL:', fallbackUrl);
    return fallbackUrl;
  }
})();

// Helper function to get authentication token from storage
// Checks both localStorage and sessionStorage (same as AuthContext does)
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to make API calls with proper error handling
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const text = await response.text();

    // Try to parse JSON body (whether success or error)
    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (_e) {
      // Non-JSON response
    }

    if (!response.ok) {
      // Prefer backend-provided error message if available
      const backendError = parsed?.error || parsed?.message || text || `HTTP error! status: ${response.status}`;
      const error = new Error(backendError) as Error & { status?: number; details?: unknown };
      (error as any).status = response.status;
      (error as any).details = parsed;
      throw error;
    }

    return parsed ?? text;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
