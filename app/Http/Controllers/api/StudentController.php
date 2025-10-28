<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PatientProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class StudentController extends Controller
{
    /**
     * Get all students
     */
    public function index(): JsonResponse
    {
        try {
            $students = Patient::where('patient_type', 'student')
                ->with([
                    'profile',
                    'student',
                    'medicalHistories',
                    'consultations',
                    'remarks'
                ])
                ->get();
                
            return response()->json($students);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get student by ID
     */
    public function show($id): JsonResponse
    {
        try {
            // Use Eloquent to get all related data
            $student = Patient::where('id', $id)
                ->where('patient_type', 'student')
                ->with([
                    'profile',
                    'student',
                    'medicalHistories',
                    'consultations',
                    'remarks'
                ])
                ->first();
                
            if (!$student) {
                return response()->json(['message' => 'Student not found'], 404);
            }
            
            return response()->json($student);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update student's own profile
     */
    public function updateProfile(Request $request, $id): JsonResponse
    {
        try {
            // Validate the request
            $validatedData = $request->validate([
                'lastName' => 'required|string|max:255',
                'firstName' => 'required|string|max:255',
                'middleInitial' => 'nullable|string|max:2',
                'suffix' => 'nullable|string|max:10',
                'dateOfBirth' => 'required|date|before:today',
                'nationality' => 'required|string|max:100',
                'civilStatus' => 'required|in:Single,Married,Divorced,Widowed',
                'address' => 'nullable|string|max:500',
                'guardianName' => 'nullable|string|max:255',
                'guardianContact' => 'nullable|regex:/^09[0-9]{9}$/',
                'bloodType' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'height' => 'nullable|string|max:20',
                'religion' => 'nullable|string|max:100',
                'eyeColor' => 'nullable|string|max:50',
                'disabilities' => 'nullable|string|max:1000',
                'geneticConditions' => 'nullable|string|max:1000',
                'contact' => 'required|regex:/^09[0-9]{9}$/',
                'currentAddress' => 'nullable|string|max:500',
            ]);

            // Additional validation for minors
            $age = \Carbon\Carbon::parse($validatedData['dateOfBirth'])->age;
            if ($age < 18) {
                $request->validate([
                    'guardianName' => 'required|string|max:255',
                    'guardianContact' => 'required|regex:/^09[0-9]{9}$/',
                ]);
            }

            // Find the student
            $student = Patient::where('id', $id)
                ->where('patient_type', 'student')
                ->with(['profile', 'student'])
                ->first();

            if (!$student) {
                return response()->json(['message' => 'Student not found'], 404);
            }

            // Update basic patient info
            $student->update([
                'name' => $validatedData['firstName'] . ' ' . $validatedData['lastName'],
                'contact' => $validatedData['contact'],
                'address' => $validatedData['currentAddress'] ?? $validatedData['address'],
            ]);

            // Update or create patient profile
            $profileData = [
                'patient_id' => $student->id,
                'last_name' => $validatedData['lastName'],
                'first_name' => $validatedData['firstName'],
                'middle_initial' => $validatedData['middleInitial'],
                'suffix' => $validatedData['suffix'],
                'date_of_birth' => $validatedData['dateOfBirth'],
                'nationality' => $validatedData['nationality'],
                'civil_status' => $validatedData['civilStatus'],
                'address' => $validatedData['address'],
                'guardian_name' => $validatedData['guardianName'],
                'guardian_contact' => $validatedData['guardianContact'],
                'blood_type' => $validatedData['bloodType'],
                'height' => $validatedData['height'],
                'religion' => $validatedData['religion'],
                'eye_color' => $validatedData['eyeColor'],
                'disabilities' => $validatedData['disabilities'],
                'genetic_conditions' => $validatedData['geneticConditions'],
            ];

            if ($student->profile) {
                $student->profile->update($profileData);
            } else {
                \App\Models\PatientProfile::create($profileData);
            }

            // Return updated student data
            $updatedStudent = Patient::where('id', $id)
                ->with(['profile', 'student'])
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'student' => $updatedStudent
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current student's patient ID based on authenticated user
     */
    public function getPatientId(): JsonResponse
    {
        try {
            // This would need to be implemented based on your authentication system
            // For now, return a placeholder response
            
            // In a real implementation, you would:
            // 1. Get the authenticated user
            // 2. Match the user's email/ID to a student record
            // 3. Return the corresponding patient_id
            
            return response()->json([
                'success' => true,
                'patient_id' => null, // This should be dynamically determined
                'message' => 'Student patient ID lookup not yet implemented'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}