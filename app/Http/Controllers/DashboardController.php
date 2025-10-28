<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;

class DashboardController extends Controller
{
    /**
     * Get pending appointments (consultations with refer_to_doctor = true)
     */
    public function getPendingAppointments(): JsonResponse
    {
        try {
            // Get all consultations that were referred to doctor
            $allReferredConsultations = Consultation::with(['patient', 'patient.profile'])
                ->where('refer_to_doctor', true)
                ->orderBy('created_at', 'desc')
                ->get();
                
            // Separate pending (in-progress) and completed consultations
            $pendingConsultations = $allReferredConsultations->where('status', 'in-progress');
            $completedConsultations = $allReferredConsultations->where('status', 'completed');
            
            // Map function to format consultation data
            $mapConsultation = function ($consultation) {
                // Get the most recent remark for this patient on the same date
                $remark = \App\Models\Remark::where('patient_id', $consultation->patient_id)
                    ->where('date', $consultation->date)
                    ->latest()
                    ->first();
                
                return [
                    'id' => $consultation->id,
                    'patient' => $consultation->patient->name,
                    'patient_id' => $consultation->patient->id,
                    'patient_type' => $consultation->patient->patient_type,
                    'type' => $consultation->type === 'walk-in' ? 'Walk-in Consultation' : 'Scheduled Consultation',
                    'date' => $consultation->date,
                    'time' => $consultation->created_at->format('H:i A'),
                    'notes' => $consultation->notes, // Full patient complaints
                    'status' => $consultation->status ?? 'Pending Doctor Review',
                    // Medical details from consultation table
                    'blood_pressure' => $consultation->blood_pressure,
                    'pulse' => $consultation->pulse,
                    'temperature' => $consultation->temperature,
                    'weight' => $consultation->weight ?? ($consultation->patient->profile->weight ?? null),
                    'last_menstrual_period' => $consultation->last_menstrual_period,
                    'gender' => $consultation->patient->gender,
                    'remarks' => $remark ? $remark->note : null, // Nurse's remarks
                    'doctor_notes' => $consultation->doctor_notes
                ];
            };
            
            // Format both sets of data
            $pendingAppointments = $pendingConsultations->map($mapConsultation)->values();
            $completedAppointments = $completedConsultations->map($mapConsultation)->values();
            
            return response()->json([
                'pending' => $pendingAppointments,
                'completed' => $completedAppointments
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function getStats(): JsonResponse
    {
        try {
            $today = Carbon::today();
            
            // Total patients count
            $totalPatients = Patient::count();
            
            // Today's consultations (completed today) - handle different date formats
            $todaysConsultations = Consultation::where(function($query) use ($today) {
                $query->whereDate('date', $today)
                      ->orWhere('date', $today->format('m/d/Y'))
                      ->orWhere('date', $today->format('n/j/Y'));
            })->count();
            
            // Pending appointments (consultations with refer_to_doctor = true and status = in-progress)
            $pendingAppointments = Consultation::where('refer_to_doctor', true)
                ->where('status', 'in-progress')
                ->count();
            
            // Completed consultations (consultations with refer_to_doctor = true and status = completed)
            $completedConsultations = Consultation::where('refer_to_doctor', true)
                ->where('status', 'completed')
                ->count();
            
            // Current consultations (ALL completed consultations - both nurse completed and doctor completed)
            $currentConsultations = Consultation::where('status', 'completed')->count();
                
            return response()->json([
                'totalPatients' => $totalPatients,
                'todaysConsultations' => $todaysConsultations,
                'pendingAppointments' => $pendingAppointments,
                'completedConsultations' => $completedConsultations,
                'currentConsultations' => $currentConsultations
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get recent activity (latest consultations)
     */
    public function getRecentActivity(): JsonResponse
    {
        try {
            $recentConsultations = Consultation::with('patient')
                ->orderBy('created_at', 'desc')
                ->take(20)
                ->get();
                
            $recentActivity = $recentConsultations->map(function ($consultation) {
                return [
                    'id' => $consultation->id,
                    'patient' => $consultation->patient->name,
                    'patient_id' => $consultation->patient->id,
                    'patient_type' => $consultation->patient->patient_type,
                    'type' => $consultation->type === 'walk-in' ? 'Walk-in Consultation' : 'Scheduled Consultation',
                    'date' => $consultation->date,
                    'time' => $consultation->created_at->format('H:i A'),
                    'notes' => $consultation->notes ? substr($consultation->notes, 0, 100) . '...' : '',
                    'status' => $consultation->status ?? 'Completed'
                ];
            });
            
            return response()->json($recentActivity);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get comprehensive dashboard data
     */
    public function getDashboardData(): JsonResponse
    {
        try {
            $statsResponse = $this->getStats();
            $activityResponse = $this->getRecentActivity();
            
            if ($statsResponse->status() !== 200 || $activityResponse->status() !== 200) {
                return response()->json(['error' => 'Failed to fetch dashboard data'], 500);
            }
            
            return response()->json([
                'stats' => $statsResponse->getData(),
                'recentActivity' => $activityResponse->getData()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get today's consultations
     */
    public function getTodaysConsultations(): JsonResponse
    {
        try {
            $today = Carbon::today();
            
            $todaysConsultations = Consultation::with('patient')
                ->where(function($query) use ($today) {
                    $query->whereDate('date', $today)
                          ->orWhere('date', $today->format('m/d/Y'))
                          ->orWhere('date', $today->format('n/j/Y'));
                })
                ->orderBy('created_at', 'desc')
                ->get();
                
            $consultations = $todaysConsultations->map(function ($consultation) {
                return [
                    'id' => $consultation->id,
                    'patient' => $consultation->patient->name,
                    'patient_id' => $consultation->patient->id,
                    'patient_type' => $consultation->patient->patient_type,
                    'type' => $consultation->type === 'walk-in' ? 'Walk-in Consultation' : 'Scheduled Consultation',
                    'date' => $consultation->date,
                    'time' => $consultation->created_at->format('H:i A'),
                    'notes' => $consultation->notes ? substr($consultation->notes, 0, 100) . '...' : '',
                    'status' => $consultation->status ?? 'Completed',
                    'refer_to_doctor' => $consultation->refer_to_doctor ? 'Yes' : 'No'
                ];
            });
            
            return response()->json($consultations);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Parse vital signs from remark note
     * Expected format: "BP: 120/80, Pulse: 72, Temp: 36.5°C, Weight: 65kg"
     */
    private function parseVitalSigns(string $note): array
    {
        $vitalSigns = [];
        
        // Parse Blood Pressure
        if (preg_match('/BP:\s*([0-9\/]+)/i', $note, $matches)) {
            $vitalSigns['blood_pressure'] = $matches[1];
        }
        
        // Parse Pulse
        if (preg_match('/Pulse:\s*([0-9]+)/i', $note, $matches)) {
            $vitalSigns['pulse'] = $matches[1];
        }
        
        // Parse Temperature
        if (preg_match('/Temp:\s*([0-9.]+)°?C?/i', $note, $matches)) {
            $vitalSigns['temperature'] = $matches[1];
        }
        
        // Parse Weight
        if (preg_match('/Weight:\s*([0-9.]+)kg/i', $note, $matches)) {
            $vitalSigns['weight'] = $matches[1];
        }
        
        return $vitalSigns;
    }
}