<?php
// Simple script to debug consultation creation

use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/debug/consultation/{id}', function($id) {
    return [
        'requested_id' => $id,
        'parsed_id' => (int)$id,
        'exists' => \App\Models\Patient::where('id', $id)->exists()
    ];
});

// Test route to create a consultation with a specific patient ID
Route::post('/debug/create-consultation', function(Request $request) {
    $patientId = $request->input('patient_id');
    $date = $request->input('date', now()->toDateString());
    $notes = $request->input('notes', 'Debug consultation');
    $type = $request->input('type', 'walk-in');
    
    try {
        // Check if patient exists
        $patient = \App\Models\Patient::find($patientId);
        if (!$patient) {
            return response()->json([
                'success' => false,
                'error' => 'Patient not found',
                'patient_id' => $patientId
            ], 404);
        }
        
        // Create the consultation
        $consultation = Consultation::create([
            'patient_id' => $patientId,
            'date' => $date,
            'notes' => $notes,
            'type' => $type
        ]);
        
        return response()->json([
            'success' => true,
            'consultation' => $consultation,
            'patient' => $patient
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});