<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class SupabaseService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected array $headers;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.supabase.url'), '/') . '/rest/v1/';
        $this->apiKey = config('services.supabase.service_role_key');
        
        $this->headers = [
            'apikey' => $this->apiKey,
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation'
        ];
    }

    /**
     * GET request to Supabase
     */
    public function get(string $table, array $params = []): array
    {
        try {
            $url = $this->baseUrl . $table;
            
            $response = Http::withHeaders($this->headers)
                ->get($url, $params);

            if (!$response->successful()) {
                Log::error('Supabase GET request failed', [
                    'url' => $url,
                    'params' => $params,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                throw new Exception('Supabase request failed: ' . $response->body());
            }

            return $response->json() ?? [];
        } catch (Exception $e) {
            Log::error('Supabase GET error', [
                'table' => $table,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * POST request to Supabase
     */
    public function post(string $table, array $data): array
    {
        try {
            $url = $this->baseUrl . $table;
            
            $response = Http::withHeaders($this->headers)
                ->post($url, $data);

            if (!$response->successful()) {
                Log::error('Supabase POST request failed', [
                    'url' => $url,
                    'data' => $data,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                throw new Exception('Supabase request failed: ' . $response->body());
            }

            return $response->json() ?? [];
        } catch (Exception $e) {
            Log::error('Supabase POST error', [
                'table' => $table,
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * PATCH request to Supabase
     */
    public function patch(string $table, array $data, array $filters = []): array
    {
        try {
            $url = $this->baseUrl . $table;
            
            $response = Http::withHeaders($this->headers)
                ->patch($url . '?' . http_build_query($filters), $data);

            if (!$response->successful()) {
                Log::error('Supabase PATCH request failed', [
                    'url' => $url,
                    'data' => $data,
                    'filters' => $filters,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                throw new Exception('Supabase request failed: ' . $response->body());
            }

            return $response->json() ?? [];
        } catch (Exception $e) {
            Log::error('Supabase PATCH error', [
                'table' => $table,
                'data' => $data,
                'filters' => $filters,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * DELETE request to Supabase (soft delete by setting is_deleted = true)
     */
    public function delete(string $table, array $filters): array
    {
        try {
            $url = $this->baseUrl . $table;
            
            // Use PATCH for soft delete
            $data = [
                'is_deleted' => true,
                'updated_at' => now()->toISOString()
            ];
            
            $response = Http::withHeaders($this->headers)
                ->patch($url . '?' . http_build_query($filters), $data);

            if (!$response->successful()) {
                Log::error('Supabase DELETE request failed', [
                    'url' => $url,
                    'filters' => $filters,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                throw new Exception('Supabase request failed: ' . $response->body());
            }

            return $response->json() ?? [];
        } catch (Exception $e) {
            Log::error('Supabase DELETE error', [
                'table' => $table,
                'filters' => $filters,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Call Supabase RPC function
     */
    public function rpc(string $functionName, array $params = []): mixed
    {
        try {
            $url = $this->baseUrl . 'rpc/' . $functionName;
            
            $response = Http::withHeaders($this->headers)
                ->post($url, $params);

            if (!$response->successful()) {
                Log::error('Supabase RPC request failed', [
                    'function' => $functionName,
                    'params' => $params,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                throw new Exception('Supabase RPC failed: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            Log::error('Supabase RPC error', [
                'function' => $functionName,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Check if a table exists and has data
     */
    public function tableExists(string $table): bool
    {
        try {
            $response = Http::withHeaders($this->headers)
                ->get($this->baseUrl . $table . '?limit=1');
            
            return $response->successful();
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get table schema information
     */
    public function getTableInfo(string $table): array
    {
        try {
            $response = Http::withHeaders($this->headers)
                ->get($this->baseUrl . $table . '?limit=0');
            
            if (!$response->successful()) {
                return [];
            }

            // Get columns from response headers
            $columns = $response->header('content-range') ? [] : [];
            
            return [
                'exists' => true,
                'columns' => $columns
            ];
        } catch (Exception $e) {
            return ['exists' => false];
        }
    }

    /**
     * Get user profile by email (legacy method)
     */
    public function getUserProfileByEmail(string $email): ?array
    {
        try {
            $response = $this->get('user_profiles', [
                'email' => "eq.{$email}",
                'limit' => 1
            ]);
            
            return !empty($response) ? $response[0] : null;
        } catch (Exception $e) {
            Log::error('Failed to get user profile by email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get or create user profile mapping for Laravel user
     */
    public function getOrCreateUserMapping(int $laravelUserId, string $email, string $username = null, string $displayName = null): ?string
    {
        try {
            $result = $this->rpc('get_or_create_user_mapping', [
                'p_laravel_user_id' => $laravelUserId,
                'p_laravel_email' => $email,
                'p_username' => $username,
                'p_display_name' => $displayName
            ]);
            
            Log::info('User mapping retrieved/created', [
                'laravel_user_id' => $laravelUserId,
                'email' => $email,
                'supabase_uuid' => $result
            ]);
            
            return $result;
        } catch (Exception $e) {
            Log::error('Failed to get or create user mapping', [
                'laravel_user_id' => $laravelUserId,
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get user mapping by Laravel user ID
     */
    public function getUserMappingByLaravelId(int $laravelUserId): ?string
    {
        try {
            $result = $this->rpc('get_user_mapping_by_laravel_id', [
                'p_laravel_user_id' => $laravelUserId
            ]);
            
            return $result;
        } catch (Exception $e) {
            Log::error('Failed to get user mapping by Laravel ID', [
                'laravel_user_id' => $laravelUserId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Create or update user profile
     */
    public function upsertUserProfile(array $profileData): ?array
    {
        try {
            return $this->post('user_profiles', $profileData);
        } catch (Exception $e) {
            Log::error('Failed to upsert user profile', [
                'profile_data' => $profileData,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}