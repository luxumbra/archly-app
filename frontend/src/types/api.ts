import { AxiosResponse } from 'axios';

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API endpoint types
export interface ApiEndpoints {
  auth: {
    login: '/login';
    register: '/register';
    logout: '/logout';
    user: '/user';
    forgotPassword: '/forgot-password';
    resetPassword: '/reset-password';
    emailVerification: '/email/verification-notification';
    csrf: '/sanctum/csrf-cookie';
  };
  places: {
    search: '/places/search';
    details: '/places/details';
    autocomplete: '/places/autocomplete';
    nearby: '/places/nearby';
  };
  cache: {
    clear: '/redis-cache/clear';
  };
}

// Request configuration
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Response wrapper types
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export type ApiResult<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Axios response helpers
export type TypedAxiosResponse<T> = AxiosResponse<T>;

// Query parameters
export interface PlacesSearchParams {
  query: string;
  fields?: string;
  location?: string;
  radius?: number;
  nextPageToken?: string;
}

export interface PlaceDetailsParams {
  place_id: string;
  fields?: string;
  noCache?: boolean;
}