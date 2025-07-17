// Yore Database TypeScript Types
// Generated types for frontend integration with Supabase

// Database Enums
export type PointActionType = 
  | 'discover_place'
  | 'visit_place'
  | 'favorite_place'
  | 'upload_photo'
  | 'write_review'
  | 'daily_login'
  | 'weekly_streak'
  | 'monthly_streak'
  | 'achievement_unlock'
  | 'ai_chat';

export type AchievementType = 
  | 'discovery'
  | 'visitation'
  | 'social'
  | 'streak'
  | 'exploration'
  | 'knowledge';

export type PlaceSiteType = 
  | 'stone_circle'
  | 'roman_villa'
  | 'medieval_castle'
  | 'neolithic_monument'
  | 'bronze_age_site'
  | 'iron_age_fort'
  | 'anglo_saxon_site'
  | 'prehistoric_site'
  | 'historic_building'
  | 'archaeological_site'
  | 'other';

export type HistoricalPeriod = 
  | 'prehistoric'
  | 'neolithic'
  | 'bronze_age'
  | 'iron_age'
  | 'roman'
  | 'anglo_saxon'
  | 'medieval'
  | 'post_medieval'
  | 'modern'
  | 'unknown';

export type PhotoStatus = 
  | 'pending'
  | 'approved'
  | 'rejected';

// Database Tables
export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  total_points: number;
  current_level: number;
  places_discovered: number;
  places_visited: number;
  current_streak: number;
  longest_streak: number;
  last_login_date?: string;
  preferences: Record<string, any>;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: string;
  google_place_id?: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  place_type?: string;
  site_type?: PlaceSiteType;
  historical_period?: HistoricalPeriod;
  description?: string;
  ai_description?: string;
  wikipedia_url?: string;
  wikipedia_summary?: string;
  google_rating?: number;
  google_user_ratings_total: number;
  avg_rating: number;
  total_visits: number;
  total_reviews: number;
  first_discovered_by?: string;
  google_data: Record<string, any>;
  metadata: Record<string, any>;
  is_verified: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PlaceWithUserData extends Place {
  user_data: {
    has_visited: boolean;
    is_favorited: boolean;
    user_rating?: number;
    visit_count: number;
  };
  first_discoverer?: {
    id: string;
    username: string;
    display_name?: string;
  };
}

export interface PointTransaction {
  id: string;
  user_id: string;
  action_type: PointActionType;
  base_points: number;
  bonus_points: number;
  total_points: number;
  multiplier: number;
  place_id?: string;
  reference_id?: string;
  metadata: Record<string, any>;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
}

export interface PlaceVisit {
  id: string;
  user_id: string;
  place_id: string;
  location_verified: boolean;
  gps_accuracy?: number;
  visit_duration?: number;
  notes?: string;
  photos?: string[];
  metadata: Record<string, any>;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  visit_date: string; // Auto-populated via trigger: DATE(created_at)
}

export interface PlaceFavorite {
  id: string;
  user_id: string;
  place_id: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
}

export interface PlacePhoto {
  id: string;
  user_id: string;
  place_id: string;
  photo_url: string;
  caption?: string;
  status: PhotoStatus;
  moderation_notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlaceReview {
  id: string;
  user_id: string;
  place_id: string;
  rating: number;
  review?: string;
  helpful_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  icon_url?: string;
  points_reward: number;
  requirements: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: Record<string, any>;
  completed_at?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  achievement?: Achievement;
}

export interface DailyStreak {
  id: string;
  user_id: string;
  login_date: string;
  streak_count: number;
  is_weekly_bonus: boolean;
  is_monthly_bonus: boolean;
  created_at: string;
}

export interface PlaceDiscovery {
  id: string;
  place_id: string;
  discovered_by: string;
  discovery_method?: string;
  points_awarded: number;
  created_at: string;
}

export interface AiChatSession {
  id: string;
  user_id: string;
  place_id?: string;
  session_data: Record<string, any>;
  message_count: number;
  total_tokens: number;
  created_at: string;
  updated_at: string;
}

// Function Response Types
export interface NearbyPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  site_type?: PlaceSiteType;
  historical_period?: HistoricalPeriod;
  avg_rating: number;
  total_visits: number;
}

export interface DailyLoginResult {
  already_logged_in: boolean;
  current_streak: number;
  points_awarded: number;
  is_weekly_bonus?: boolean;
  is_monthly_bonus?: boolean;
}

export interface AchievementCheckResult {
  unlocked_achievements: Array<{
    id: string;
    name: string;
    description: string;
    points_reward: number;
  }>;
}

export interface DatabaseStats {
  table_name: string;
  record_count: number;
}

// API Function Parameters
export interface AwardPointsParams {
  user_id: string;
  action_type: PointActionType;
  base_points: number;
  place_id?: string;
  metadata?: Record<string, any>;
}

export interface UpsertPlaceParams {
  google_place_id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  place_type?: string;
  google_data?: Record<string, any>;
  discovered_by?: string;
}

export interface RecordVisitParams {
  user_id: string;
  place_id: string;
  location_verified?: boolean;
  gps_accuracy?: number;
  notes?: string;
}

export interface EnhancePlaceParams {
  place_id: string;
  ai_description?: string;
  wikipedia_url?: string;
  wikipedia_summary?: string;
  site_type?: PlaceSiteType;
  historical_period?: HistoricalPeriod;
}

export interface GetNearbyPlacesParams {
  lat: number;
  lng: number;
  radius_meters?: number;
  limit?: number;
}

// Supabase Database Type (for use with Supabase client)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> & {
          id: string;
        };
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      places: {
        Row: Place;
        Insert: Omit<Place, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Omit<Place, 'id' | 'created_at' | 'updated_at'>>;
      };
      point_transactions: {
        Row: PointTransaction;
        Insert: Omit<PointTransaction, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<PointTransaction, 'id' | 'created_at'>>;
      };
      place_visits: {
        Row: PlaceVisit;
        Insert: Omit<PlaceVisit, 'id' | 'created_at' | 'visit_date'> & {
          id?: string;
          visit_date?: string; // Optional, populated by trigger
        };
        Update: Partial<Omit<PlaceVisit, 'id' | 'created_at'>>;
      };
      place_favorites: {
        Row: PlaceFavorite;
        Insert: Omit<PlaceFavorite, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<PlaceFavorite, 'id' | 'created_at'>>;
      };
      place_photos: {
        Row: PlacePhoto;
        Insert: Omit<PlacePhoto, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Omit<PlacePhoto, 'id' | 'created_at' | 'updated_at'>>;
      };
      place_reviews: {
        Row: PlaceReview;
        Insert: Omit<PlaceReview, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Omit<PlaceReview, 'id' | 'created_at' | 'updated_at'>>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<Achievement, 'id' | 'created_at'>>;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: Omit<UserAchievement, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Omit<UserAchievement, 'id' | 'created_at' | 'updated_at'>>;
      };
      daily_streaks: {
        Row: DailyStreak;
        Insert: Omit<DailyStreak, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<DailyStreak, 'id' | 'created_at'>>;
      };
      place_discoveries: {
        Row: PlaceDiscovery;
        Insert: Omit<PlaceDiscovery, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<PlaceDiscovery, 'id' | 'created_at'>>;
      };
      ai_chat_sessions: {
        Row: AiChatSession;
        Insert: Omit<AiChatSession, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Omit<AiChatSession, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      award_points: {
        Args: AwardPointsParams;
        Returns: number;
      };
      handle_daily_login: {
        Args: { user_id: string };
        Returns: DailyLoginResult;
      };
      upsert_place_from_api: {
        Args: UpsertPlaceParams;
        Returns: string;
      };
      record_place_visit: {
        Args: RecordVisitParams;
        Returns: string;
      };
      add_place_favorite: {
        Args: { user_id: string; place_id: string };
        Returns: string;
      };
      get_place_with_user_data: {
        Args: { place_id: string; user_id?: string };
        Returns: { place_data: Record<string, any>; user_data: Record<string, any> };
      };
      check_achievements: {
        Args: { user_id: string; action_type: string };
        Returns: AchievementCheckResult;
      };
      enhance_place_with_ai: {
        Args: EnhancePlaceParams;
        Returns: boolean;
      };
      get_nearby_places: {
        Args: GetNearbyPlacesParams;
        Returns: NearbyPlace[];
      };
      get_database_stats: {
        Args: Record<string, never>;
        Returns: DatabaseStats[];
      };
      soft_delete_user_profile: {
        Args: { profile_id: string };
        Returns: boolean;
      };
      soft_delete_place: {
        Args: { place_id: string };
        Returns: boolean;
      };
      soft_delete_place_visit: {
        Args: { visit_id: string };
        Returns: boolean;
      };
      soft_delete_place_favorite: {
        Args: { favorite_id: string };
        Returns: boolean;
      };
      restore_soft_deleted_record: {
        Args: { table_name: string; record_id: string };
        Returns: boolean;
      };
    };
  };
}

// Utility Types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

// Frontend-specific types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface SearchFilters {
  site_types?: PlaceSiteType[];
  historical_periods?: HistoricalPeriod[];
  min_rating?: number;
  radius_meters?: number;
  only_unvisited?: boolean;
  only_favorites?: boolean;
}

export interface PlaceSearchResult extends NearbyPlace {
  snippet?: string;
  matched_fields?: string[];
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  total_points: number;
  current_level: number;
  places_discovered: number;
  places_visited: number;
  rank: number;
}

export interface UserStats {
  total_points: number;
  current_level: number;
  next_level_points: number;
  places_discovered: number;
  places_visited: number;
  current_streak: number;
  longest_streak: number;
  achievements_unlocked: number;
  favorite_places: number;
  reviews_written: number;
  photos_uploaded: number;
}