// API Configuration for local and production environments
export const getApiBaseUrl = (): string => {
  // Get API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Fallback URLs for development
  if (!apiUrl) {
    console.warn('⚠️ VITE_API_BASE_URL not set, using fallback URL');
    // Try Railway URL first, then localhost
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
    // Fallback to Railway URL
    const fallbackUrl = 'https://web-production-df81.up.railway.app';
    console.log('🔄 Using fallback API URL:', fallbackUrl);
    return fallbackUrl;
  }
})();

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
