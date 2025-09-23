// API Configuration for local and production environments
export const getApiBaseUrl = (): string => {
  // Get API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Throw error if no API URL is configured
  if (!apiUrl) {
    throw new Error(
      'VITE_API_BASE_URL environment variable is not configured. ' +
      'Please set this variable in your .env file or deployment environment.'
    );
  }
  
  // Ensure the URL has proper protocol
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    return `https://${apiUrl}`;
  }
  
  return apiUrl;
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
