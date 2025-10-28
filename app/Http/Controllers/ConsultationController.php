<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Remark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class ConsultationController extends Controller
{
    /**
     * Display a listing of consultations for a specific patient.
     *
     * @param  int  $patientId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($patientId)
    {
        $consultations = Consultation::where('patient_id', $patientId)
            ->orderBy('date', 'desc')
            ->get();
            
        return response()->json($consultations);
    }

    /**
     * Store a newly created consultation in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'type' => 'required|string|in:walk-in,scheduled',
            'refer_to_doctor' => 'sometimes|boolean',
            'status' => 'sometimes|string|in:completed,in-progress',
            // Vital signs validation
            'blood_pressure' => 'nullable|string',
            'pulse' => 'nullable|string',
            'temperature' => 'nullable|string',
            'weight' => 'nullable|string',
            'last_menstrual_period' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $referToDoctor = $request->refer_to_doctor ?? false;
        $status = $request->status ?? ($referToDoctor ? 'in-progress' : 'completed');

        $consultation = Consultation::create([
            'patient_id' => $request->patient_id,
            'date' => $request->date,
            'notes' => $request->notes ?? '',
            'type' => $request->type,
            'refer_to_doctor' => $referToDoctor,
            'status' => $status,
            // Include vital signs
            'blood_pressure' => $request->blood_pressure,
            'pulse' => $request->pulse,
            'temperature' => $request->temperature,
            'weight' => $request->weight,
            'last_menstrual_period' => $request->last_menstrual_period
        ]);

        // Optionally create a remark if provided
        if ($request->has('remark')) {
            Remark::create([
                'patient_id' => $request->patient_id,
                'date' => $request->date,
                'note' => $request->remark
            ]);
        }

        return response()->json($consultation, 201);
    }

    /**
     * Display the specified consultation.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $consultation = Consultation::findOrFail($id);
        return response()->json($consultation);
    }

    /**
     * Update the specified consultation in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'notes' => 'sometimes|nullable|string',
            'type' => 'sometimes|string|in:walk-in,scheduled',
            'status' => 'sometimes|nullable|string',
            'refer_to_doctor' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $consultation = Consultation::findOrFail($id);
        
        // Handle status logic when refer_to_doctor is being updated
        $updateData = $request->only(['date', 'notes', 'type', 'status', 'refer_to_doctor']);
        
        if ($request->has('refer_to_doctor')) {
            $referToDoctor = $request->refer_to_doctor;
            // Only auto-set status if it's not explicitly provided
            if (!$request->has('status')) {
                $updateData['status'] = $referToDoctor ? 'in-progress' : 'completed';
            }
        }
        
        $consultation->update($updateData);

        return response()->json($consultation);
    }

    /**
     * Add doctor notes and complete consultation (for doctors only)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addDoctorNotes(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'doctor_notes' => 'required|string|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $consultation = Consultation::findOrFail($id);
        
        // Only allow updating consultations that are in-progress
        if ($consultation->status !== 'in-progress') {
            return response()->json(['error' => 'This consultation is not pending doctor review'], 400);
        }

        $consultation->update([
            'doctor_notes' => $request->doctor_notes,
            'status' => 'completed'
        ]);

        return response()->json($consultation);
    }

    /**
     * Remove the specified consultation from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $consultation = Consultation::findOrFail($id);
        $consultation->delete();

        return response()->json(null, 204);
    }
}
