<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Hardcoded email-to-role mappings
     */
    private function getEmailRoleMapping(): array
    {
        return [
            'sampon_230000001231@uic.edu.ph' => 'doctor',
            // Add more hardcoded emails here as needed
            // 'nurse@uic.edu.ph' => 'nurse',
        ];
    }

    public function authenticate(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            \Log::info('🚀 Real OAuth authentication started');
            
            // Try to get user details from the token first
            try {
                $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->input('token'));
                $email = $googleUser->getEmail();
                $name = $googleUser->getName();
                $googleId = $googleUser->getId();
                \Log::info('📧 Google user email: ' . $email);
            } catch (\Exception $tokenError) {
                \Log::warning('⚠️ Google token validation failed, trying userData fallback: ' . $tokenError->getMessage());
                
                // Fallback to userData if Google token fails
                $userData = $request->input('userData');
                if (!$userData || !isset($userData['email'])) {
                    \Log::error('❌ No valid email source available');
                    return response()->json(['status' => 'fail', 'message' => 'Authentication failed.'], 401);
                }
                
                $email = $userData['email'];
                $name = $userData['name'] ?? 'Unknown User';
                $googleId = null; // Will be updated later if token works
                \Log::info('📧 Using fallback email: ' . $email);
            }

            // Find an existing user by email first
            $user = User::where('email', $email)->first();
            
            if ($user) {
                \Log::info('👤 Found existing user: ' . $user->email . ' (ID: ' . $user->id . ')');
                // Update google_id if we have it and user doesn't
                if ($googleId && !$user->google_id) {
                    $user->update(['google_id' => $googleId]);
                    \Log::info('🔗 Updated google_id for existing user');
                }
            } else {
                \Log::info('➕ Creating new user for: ' . $email);
                // Create new user
                $user = User::create([
                    'google_id' => $googleId,
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make('password_from_google'),
                ]);
            }

            // Assign role based on email
            $this->assignRoleToUser($user, $googleUser->getEmail());

            // Refresh the user to get updated role relationship
            $user->refresh();
            $user->load('role');

            // Log the user in
            Auth::login($user);

            // Determine redirect URL based on role
            $redirectUrl = '/dashboard'; // Default for staff
            if ($user->getRoleDisplayName() === 'Student') {
                $redirectUrl = '/student/profile-dashboard';
            }

            return response()->json([
                'status' => 'success',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleDisplayName(),
                ],
                'redirectUrl' => $redirectUrl
            ]);

        } catch (\Exception $e) {
            // Handle exceptions (e.g., invalid token)
            \Log::error('Authentication failed: ' . $e->getMessage());
            return response()->json(['status' => 'fail', 'message' => 'Authentication failed.'], 401);
        }
    }

    /**
     * Handle Google OAuth callback (for web routes)
     */
    public function handleGoogleCallback()
    {
        // This method is called by web routes but we're using API-based auth
        // Redirect to login page
        return redirect('/');
    }

    /**
     * Assign role to user based on their email
     */
    private function assignRoleToUser(User $user, string $email): void
    {
        // NURSE IMMUNITY SYSTEM: Check if user already has nurse role - DO NOT DOWNGRADE
        if ($user->role && strtolower($user->role->name) === 'nurse') {
            \Log::info("🛡️ NURSE IMMUNITY: User {$email} already has nurse role - PROTECTING from downgrade");
            return; // Don't change nurse roles
        }
        
        $emailRoleMapping = $this->getEmailRoleMapping();
        
                // Get the target role name based on email
        $targetRoleName = $emailRoleMapping[$email] ?? 'student'; // Default to student
        
        \Log::info("Processing role assignment for email: {$email}, target role: {$targetRoleName}");
        
        // Find the role
        $role = Role::where('name', $targetRoleName)->first();
        
        if ($role) {
            \Log::info("Found role: {$role->name} with ID: {$role->id}");
            
            if ($user->role_id !== $role->id) {
                // Update user's role if it's different
                $user->update(['role_id' => $role->id]);
                \Log::info("Updated user {$email} role_id to: {$role->id}");
            } else {
                \Log::info("User {$email} already has correct role_id: {$role->id}");
            }
        } else {
            \Log::error("Role '{$targetRoleName}' not found in database");
        }
    }
}