<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SupabaseService;

class UserProfileController extends Controller
{
    protected SupabaseService $supabaseService;

    public function __construct(SupabaseService $supabaseService)
    {
        $this->supabaseService = $supabaseService;
    }

    /**
     * Get the authenticated user's profile data from Supabase
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            
            // Get or create user mapping to get Supabase UUID
            $supabaseUuid = $this->supabaseService->getOrCreateUserMapping(
                $user->id,
                $user->email,
                $user->name,
                $user->name
            );
            
            if (!$supabaseUuid) {
                return response()->json([
                    'message' => 'Unable to get user profile mapping'
                ], 500);
            }
            
            $response = $this->supabaseService->get("user_profiles", [
                'select' => 'id,username,display_name,total_points,current_level,places_discovered,places_visited,current_streak,longest_streak,created_at,updated_at',
                'id' => "eq.{$supabaseUuid}",
                'is_deleted' => 'eq.false'
            ]);

            if (empty($response)) {
                return response()->json([
                    'message' => 'Profile not found'
                ], 404);
            }

            return response()->json($response[0]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the authenticated user's profile
     */
    public function update(Request $request)
    {
        $request->validate([
            'username' => 'sometimes|string|max:50',
            'display_name' => 'sometimes|string|max:100',
        ]);

        try {
            $user = $request->user();
            
            // Get user mapping to get Supabase UUID
            $supabaseUuid = $this->supabaseService->getUserMappingByLaravelId($user->id);
            
            if (!$supabaseUuid) {
                return response()->json([
                    'message' => 'User profile mapping not found'
                ], 404);
            }
            
            $updateData = array_filter([
                'username' => $request->input('username'),
                'display_name' => $request->input('display_name'),
                'updated_at' => now()->toISOString(),
            ]);

            $response = $this->supabaseService->patch("user_profiles", $updateData, [
                'id' => "eq.{$supabaseUuid}"
            ]);

            return response()->json([
                'message' => 'Profile updated successfully',
                'data' => $response
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's achievements
     */
    public function achievements(Request $request)
    {
        try {
            $user = $request->user();
            
            $response = $this->supabaseService->get("user_achievements", [
                'select' => 'id,achievement_id,achieved_at,achievements(id,name,description,points,icon)',
                'user_id' => "eq.{$user->id}",
                'is_deleted' => 'eq.false'
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching achievements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's point transactions
     */
    public function points(Request $request)
    {
        try {
            $user = $request->user();
            
            $response = $this->supabaseService->get("point_transactions", [
                'select' => 'id,amount,transaction_type,description,created_at',
                'user_id' => "eq.{$user->id}",
                'is_deleted' => 'eq.false',
                'order' => 'created_at.desc',
                'limit' => '50'
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching point transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's daily streak information
     */
    public function streak(Request $request)
    {
        try {
            $user = $request->user();
            
            $response = $this->supabaseService->get("daily_streaks", [
                'select' => 'current_streak,longest_streak,last_activity_date',
                'user_id' => "eq.{$user->id}",
                'is_deleted' => 'eq.false'
            ]);

            if (empty($response)) {
                return response()->json([
                    'current_streak' => 0,
                    'longest_streak' => 0,
                    'last_activity_date' => null
                ]);
            }

            return response()->json($response[0]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching streak information',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}