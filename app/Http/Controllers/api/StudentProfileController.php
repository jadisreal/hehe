<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Exception;

class StudentProfileController extends Controller
{
    /**
     * Get student profile data
     */
    public function getProfile(Request $request)
    {
        try {
            // Debug logging
            \Log::info('=== Student Profile GET Request ===');
            \Log::info('Session ID: ' . session()->getId());
            \Log::info('Request headers: ' . json_encode($request->headers->all()));
            \Log::info('Auth check: ' . (Auth::check() ? 'true' : 'false'));
            
            $user = Auth::user();
            
            if (!$user) {
                \Log::warning('❌ User not authenticated in getProfile');
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            \Log::info('✅ User authenticated: ' . $user->name . ' (' . $user->email . ')');

            // Check if user is a student
            if (!$this->isStudentUser($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Only students can access this endpoint.'
                ], 403);
            }

            // Get student profile from student_profiles table
            $profile = DB::table('student_profiles')
                ->where('user_id', $user->id)
                ->first();

            return response()->json([
                'success' => true,
                'profile' => $profile
            ]);

        } catch (Exception $e) {
            \Log::error('Error fetching student profile: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile data'
            ], 500);
        }
    }

    /**
     * Save or update student profile data
     */
    public function saveProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Check if user is a student
            if (!$this->isStudentUser($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Only students can access this endpoint.'
                ], 403);
            }

            // Validate input data
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_initial' => 'nullable|string|max:1',
                'suffix' => 'nullable|string|max:10',
                'date_of_birth' => 'required|date|before:today',
                'nationality' => 'nullable|string|max:255',
                'civil_status' => 'nullable|string|in:Single,Married,Divorced,Widowed',
                'address' => 'nullable|string|max:1000',
                'guardian_name' => 'nullable|string|max:255',
                'guardian_contact' => 'required|string|max:255',
                'blood_type' => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'height' => 'nullable|string|max:10',
                'religion' => 'nullable|string|max:255',
                'eye_color' => 'nullable|string|in:Brown,Black,Blue,Green,Gray,Hazel',
                'chronic_conditions' => 'nullable|string|max:2000',
                'known_allergies' => 'nullable|string|max:2000',
                'disabilities' => 'nullable|string|max:2000',
                'immunization_history' => 'nullable|string|max:2000',
                'genetic_conditions' => 'nullable|string|max:2000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $profileData = $validator->validated();
            $profileData['user_id'] = $user->id;
            $profileData['updated_at'] = now();

            // Check if profile already exists
            $existingProfile = DB::table('student_profiles')
                ->where('user_id', $user->id)
                ->first();

            if ($existingProfile) {
                // Update existing profile
                DB::table('student_profiles')
                    ->where('user_id', $user->id)
                    ->update($profileData);
                
                \Log::info("Updated student profile for user ID: {$user->id}");
            } else {
                // Create new profile
                $profileData['created_at'] = now();
                DB::table('student_profiles')
                    ->insert($profileData);
                
                \Log::info("Created new student profile for user ID: {$user->id}");
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile saved successfully'
            ]);

        } catch (Exception $e) {
            \Log::error('Error saving student profile: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to save profile data'
            ], 500);
        }
    }

    /**
     * Check if the user is a student
     */
    private function isStudentUser($user): bool
    {
        if (!$user->role) {
            return false;
        }

        $roleName = is_string($user->role) ? $user->role : $user->role->name;
        return strtolower($roleName) === 'student';
    }
}