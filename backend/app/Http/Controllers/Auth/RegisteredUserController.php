<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SupabaseService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    protected SupabaseService $supabaseService;

    public function __construct(SupabaseService $supabaseService)
    {
        $this->supabaseService = $supabaseService;
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->string('password')),
        ]);

        event(new Registered($user));

        // Auto-login the user after registration
        Auth::login($user);

        // Create corresponding Supabase user profile
        $this->createSupabaseUserProfile($user);

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user
        ], 201);
    }

    /**
     * Create a corresponding user profile in Supabase
     */
    private function createSupabaseUserProfile(User $user): void
    {
        try {
            // Create user mapping and profile in Supabase
            $supabaseUuid = $this->supabaseService->getOrCreateUserMapping(
                $user->id,
                $user->email,
                $user->name,
                $user->name
            );
            
            if ($supabaseUuid) {
                \Log::info('Supabase user profile mapping created on registration', [
                    'laravel_user_id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'supabase_uuid' => $supabaseUuid
                ]);
            } else {
                \Log::warning('Failed to create Supabase user profile mapping', [
                    'laravel_user_id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name
                ]);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to create Supabase user profile', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage()
            ]);
        }
    }
}
