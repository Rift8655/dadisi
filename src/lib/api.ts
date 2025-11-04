import { useAuth } from '@/store/auth';

const baseURL = process.env.BACKEND_PUBLIC_APP_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, ...requestOptions } = options;

  // Build URL with query parameters
  let url = `${baseURL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Set default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(requestOptions.headers as Record<string, string>),
  };

  // Add Authorization header if token exists
  try {
    // Get token from localStorage (sync access)
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authState = JSON.parse(authStorage);
        const token = authState.state?.token;
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }
    }
  } catch (e) {
    console.error('Failed to read auth token from storage:', e);
  }

  const response = await fetch(url, {
    ...requestOptions,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = 
      typeof data === 'object' && data?.message 
        ? data.message 
        : `HTTP ${response.status}: ${response.statusText}`;
    
    const error = new Error(errorMessage) as Error & { status?: number; data?: any };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
