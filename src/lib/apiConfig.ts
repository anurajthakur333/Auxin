// API Configuration for local and production environments
export const getApiBaseUrl = (): string => {
  // Check if we're in development (localhost or local dev server)
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.port === '5173' ||
                       process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, use relative URLs (handled by Vite proxy)
    return '';
  } else {
    // In production, use your Railway backend URL
    // This should be set in your environment variables
    return import.meta.env.VITE_API_BASE_URL || 'https://your-railway-backend.railway.app';
  }
};

export const API_BASE_URL = getApiBaseUrl();

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
