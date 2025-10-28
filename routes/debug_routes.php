<?php
// debug_routes.php - Additional routes for debugging

use App\Models\Consultation;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route to test creating a consultation for an employee
Route::get('/debug/create-employee-consultation/{id}', function($id) {
    try {
        // Check if employee exists
        $employee = Patient::where('id', $id)
            ->where('patient_type', 'employee')
            ->first();
        
        if (!$employee) {
            return response()->json([
                'error' => 'Employee not found',
                'id' => $id
            ], 404);
        }
        
        // Create a test consultation
        $consultation = Consultation::create([
            'patient_id' => $employee->id,
            'date' => now()->toDateString(),
            'notes' => 'Debug consultation via test route',
            'type' => 'walk-in'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Test consultation created successfully',
            'employee' => $employee,
            'consultation' => $consultation
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Route to check existing consultations for a patient
Route::get('/debug/check-consultations/{id}', function($id) {
    try {
        $patient = Patient::find($id);
        
        if (!$patient) {
            return response()->json([
                'error' => 'Patient not found',
                'id' => $id
            ], 404);
        }
        
        $consultations = Consultation::where('patient_id', $id)->get();
        
        return response()->json([
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'type' => $patient->patient_type
            ],
            'consultation_count' => $consultations->count(),
            'consultations' => $consultations
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});