<?php

namespace Database\Seeders;

use App\Models\Consultation;
use App\Models\Patient;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ConsultationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all student patients
        $students = Patient::where('patient_type', 'student')->get();
        
        if ($students->count() > 0) {
            foreach ($students as $student) {
                // Create a walk-in consultation
                Consultation::create([
                    'patient_id' => $student->id,
                    'date' => Carbon::now()->subDays(rand(1, 30)),
                    'notes' => 'Walk-in consultation for general checkup',
                    'type' => 'walk-in'
                ]);
                
                // Create a scheduled consultation
                Consultation::create([
                    'patient_id' => $student->id,
                    'date' => Carbon::now()->addDays(rand(1, 14)),
                    'notes' => 'Scheduled follow-up appointment',
                    'type' => 'scheduled',
                    'status' => 'confirmed',
                    'scheduled_at' => Carbon::now()->addDays(rand(1, 14)),
                    'reason' => 'Follow-up check'
                ]);
            }
        } else {
            $this->command->info('No student patients found. Please run the patient seeder first.');
        }
    }
}
