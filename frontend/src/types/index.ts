// Base geographic types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface DisplayName {
  text: string;
  languageCode: string;
}

// Google Places API types
export interface Place {
  id: string;
  formattedAddress: string;
  location: Location;
  displayName: DisplayName;
  rating?: number;
  primaryType?: string;
}

// Site detail specific types
export interface PlaceData {
  displayName: DisplayName;
  primaryType: string;
  formattedAddress: string;
  rating?: number;
}

export interface ParsedAiData {
  geoLocation?: Location;
  ordnanceSurveyGridReference?: string;
  historicalSignificance?: string;
  phasesOfConstruction?: Array<{
    phase: string;
    yearRange: string;
    description: string;
  }>;
  culturalContext?: string;
  research?: Array<{
    title: string;
    summary: string;
    url: string;
  }>;
  visitorInformation?: Record<string, unknown>;
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
}

export interface SiteDetailPlace {
  placesData: PlaceData;
  aiData?: string;
  parsedAiData: ParsedAiData;
}

export interface PlacesSearchResponse {
  places: Place[];
  nextPageToken?: string;
  error?: string;
}

export interface PlacesApiError {
  error: string;
  message?: string;
}

// User authentication types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

// Authentication form types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Form validation types
export interface ValidationErrors {
  [key: string]: string[];
}

// Component prop types
export interface MapMarkerProps {
  location: Location;
  title: string;
  id: string;
}

export interface SiteDetailMapProps {
  location?: Location;
  title?: string;
  id?: string;
}

export interface MapViewProps {
  initialQuery?: string;
  initialLocation?: Location;
}

// Navigation types
export interface RouteParams {
  slug?: string;
  token?: string;
  id?: string;
}

// Hook types
export interface UseAuthOptions {
  middleware?: 'auth' | 'guest';
  redirectIfAuthenticated?: string;
}

export interface AuthHookReturn {
  user: User | undefined;
  register: (credentials: RegisterCredentials & { setErrors: (errors: ValidationErrors) => void }) => Promise<void>;
  login: (credentials: LoginCredentials & { setErrors: (errors: ValidationErrors) => void; setStatus: (status: string | null) => void }) => Promise<void>;
  forgotPassword: (data: ForgotPasswordForm & { setErrors: (errors: ValidationErrors) => void; setStatus: (status: string | null) => void }) => Promise<void>;
  resetPassword: (data: ResetPasswordForm & { setErrors: (errors: ValidationErrors) => void; setStatus: (status: string | null) => void }) => Promise<void>;
  resendEmailVerification: (data: { setStatus: (status: string) => void }) => void;
  logout: () => Promise<void>;
}

// Utility types
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type EventHandler<T = HTMLElement> = React.EventHandler<React.SyntheticEvent<T>>;
export type FormEvent = React.FormEvent<HTMLFormElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type ClickEvent = React.MouseEvent<HTMLButtonElement>;