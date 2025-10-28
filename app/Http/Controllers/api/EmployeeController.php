<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    /**
     * Get all employees
     */
    public function index(): JsonResponse
    {
        try {
            $employees = Patient::where('patient_type', 'employee')
                ->with([
                    'profile',
                    'employee',
                    'medicalHistories',
                    'consultations',
                    'remarks'
                ])
                ->get();
                
            return response()->json($employees);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get employee by ID
     */
    public function show($id): JsonResponse
    {
        try {
            // Log the employee ID being requested for debugging
            \Log::debug("EmployeeController: Fetching employee with ID: {$id}");
            
            // Use Eloquent to get all related data
            $employee = Patient::where('id', $id)
                ->where('patient_type', 'employee')
                ->with([
                    'profile',
                    'employee',
                    'medicalHistories',
                    'consultations', // This includes consultations
                    'remarks'
                ])
                ->first();
                
            if (!$employee) {
                \Log::warning("EmployeeController: Employee not found with ID: {$id}");
                return response()->json(['message' => 'Employee not found'], 404);
            }
            
            // Log consultation count for debugging
            $consultationCount = $employee->consultations->count();
            \Log::debug("EmployeeController: Found {$consultationCount} consultations for employee ID {$id}");
            
            return response()->json($employee);
        } catch (\Exception $e) {
            \Log::error("EmployeeController error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}