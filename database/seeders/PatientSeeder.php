<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\PatientProfile;
use App\Models\Student;
use App\Models\Employee;
use App\Models\MedicalHistory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data to prevent duplicates
        $this->command->info('Clearing existing patient data...');
        MedicalHistory::truncate();
        Student::truncate();
        Employee::truncate();
        PatientProfile::truncate();
        Patient::truncate();

        $this->command->info('Creating 15+ students and 15+ employees...');

        // Create 15 student patients with diverse data
        $studentPatients = [
            ['name' => 'Juan Carlos Dela Cruz', 'age' => 20, 'gender' => 'Male', 'address' => 'Fr Selga, Davao City', 'contact' => '09123456789', 'course' => 'BSIT'],
            ['name' => 'Maria Santos Rodriguez', 'age' => 19, 'gender' => 'Female', 'address' => 'Toril, Davao City', 'contact' => '09987654321', 'course' => 'BSN'],
            ['name' => 'Sofia Isabel Garcia', 'age' => 21, 'gender' => 'Female', 'address' => 'Talomo, Davao City', 'contact' => '09234567890', 'course' => 'BS Psychology'],
            ['name' => 'Patricia Mae Fernandez', 'age' => 20, 'gender' => 'Female', 'address' => 'Catalunan Pequeño, Davao City', 'contact' => '09156789234', 'course' => 'BSN'],
            ['name' => 'Miguel Antonio Reyes', 'age' => 22, 'gender' => 'Male', 'address' => 'Ecoland, Davao City', 'contact' => '09345678901', 'course' => 'BSIT'],
            ['name' => 'Rafael Martin Cruz', 'age' => 21, 'gender' => 'Male', 'address' => 'Buhangin, Davao City', 'contact' => '09456789012', 'course' => 'BS Architecture'],
            ['name' => 'Isabella Marie Tan', 'age' => 19, 'gender' => 'Female', 'address' => 'Lanang, Davao City', 'contact' => '09567890123', 'course' => 'BS Accountancy'],
            ['name' => 'Gabriel Luis Mendoza', 'age' => 20, 'gender' => 'Male', 'address' => 'Ma-a, Davao City', 'contact' => '09678901234', 'course' => 'BS Civil Engineering'],
            ['name' => 'Andrea Nicole Villanueva', 'age' => 21, 'gender' => 'Female', 'address' => 'Tibungco, Davao City', 'contact' => '09789012345', 'course' => 'BS Biology'],
            ['name' => 'Christian David Lopez', 'age' => 22, 'gender' => 'Male', 'address' => 'Matina, Davao City', 'contact' => '09890123456', 'course' => 'BS Mechanical Engineering'],
            ['name' => 'Samantha Rose Morales', 'age' => 19, 'gender' => 'Female', 'address' => 'Agdao, Davao City', 'contact' => '09901234567', 'course' => 'BS Chemistry'],
            ['name' => 'Joshua Miguel Torres', 'age' => 20, 'gender' => 'Male', 'address' => 'Panacan, Davao City', 'contact' => '09012345678', 'course' => 'BS Physics'],
            ['name' => 'Angelica Faith Ramos', 'age' => 21, 'gender' => 'Female', 'address' => 'Calinan, Davao City', 'contact' => '09123450789', 'course' => 'BS Mathematics'],
            ['name' => 'Marco Alessandro Bautista', 'age' => 22, 'gender' => 'Male', 'address' => 'Tugbok, Davao City', 'contact' => '09234561890', 'course' => 'BS Electrical Engineering'],
            ['name' => 'Kimberly Joy Pascual', 'age' => 19, 'gender' => 'Female', 'address' => 'Bunawan, Davao City', 'contact' => '09345672901', 'course' => 'BS Business Administration'],
            ['name' => 'Emmanuel John Rivera', 'age' => 20, 'gender' => 'Male', 'address' => 'Baguio District, Davao City', 'contact' => '09456783012', 'course' => 'BS Computer Science'],
            ['name' => 'Catherine Mae Dela Rosa', 'age' => 21, 'gender' => 'Female', 'address' => 'Sasa, Davao City', 'contact' => '09567894123', 'course' => 'BS Education'],
            ['name' => 'Alexander James Santos', 'age' => 22, 'gender' => 'Male', 'address' => 'Waan, Davao City', 'contact' => '09678905234', 'course' => 'BS Industrial Engineering'],
        ];

        foreach ($studentPatients as $index => $patientData) {
            $patient = Patient::create([
                'name' => $patientData['name'],
                'age' => $patientData['age'],
                'gender' => $patientData['gender'],
                'address' => $patientData['address'],
                'contact' => $patientData['contact'],
                'patient_type' => 'student',
            ]);

            PatientProfile::create([
                'patient_id' => $patient->id,
                'last_name' => explode(' ', $patient->name)[2] ?? explode(' ', $patient->name)[1] ?? 'LastName',
                'first_name' => explode(' ', $patient->name)[0],
                'middle_initial' => substr(explode(' ', $patient->name)[1] ?? 'M', 0, 1),
                'date_of_birth' => Carbon::now()->subYears($patient->age)->format('Y-m-d'),
                'nationality' => 'Filipino',
                'civil_status' => 'Single',
                'address' => $patient->address,
                'guardian_name' => 'Parent/Guardian Name ' . ($index + 1),
                'guardian_contact' => '09' . rand(100000000, 999999999),
                'emergency_contact' => '09' . rand(100000000, 999999999),
                'blood_type' => ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][rand(0, 7)],
                'height' => rand(150, 180),
                'weight' => rand(45, 75),
                'religion' => ['Catholic', 'Christian', 'Protestant', 'Islam', 'Buddhism'][rand(0, 4)],
                'eye_color' => ['Brown', 'Black', 'Hazel'][rand(0, 2)],
            ]);

            Student::create([
                'patient_id' => $patient->id,
                'student_id' => '2025' . str_pad($index + 1, 8, '0', STR_PAD_LEFT),
                'course' => $patientData['course'],
                'year_level' => (string)rand(1, 4),
                'section' => ['A', 'B', 'C', 'D'][rand(0, 3)],
            ]);

            MedicalHistory::create([
                'patient_id' => $patient->id,
                'condition' => ['Regular check-up', 'Minor injury', 'Headache consultation', 'Allergy assessment'][rand(0, 3)],
                'diagnosed' => Carbon::now()->subDays(rand(1, 90))->format('Y-m-d'),
            ]);
        }

        // Create 15 employee patients with diverse data
        $employeePatients = [
            ['name' => 'Dr. Maria Christina Lim', 'age' => 42, 'gender' => 'Female', 'address' => 'Damosa, Davao City', 'contact' => '09678912345', 'department' => 'Medical Department', 'position' => 'School Physician'],
            ['name' => 'Benjamin David Santos', 'age' => 35, 'gender' => 'Male', 'address' => 'Ma-a, Davao City', 'contact' => '09789123456', 'department' => 'Information Technology', 'position' => 'IT Manager'],
            ['name' => 'Ana Reyes Gonzales', 'age' => 38, 'gender' => 'Female', 'address' => 'Matina, Davao City', 'contact' => '09890234567', 'department' => 'Administration', 'position' => 'HR Manager'],
            ['name' => 'Ricardo Manuel Torres', 'age' => 48, 'gender' => 'Male', 'address' => 'Cabantian, Davao City', 'contact' => '09912345678', 'department' => 'Facilities Management', 'position' => 'Facilities Director'],
            ['name' => 'Carmen Rosa Villanueva', 'age' => 44, 'gender' => 'Female', 'address' => 'Buhangin, Davao City', 'contact' => '09123456780', 'department' => 'Academic Affairs', 'position' => 'Registrar'],
            ['name' => 'Roberto Carlos Mendoza', 'age' => 52, 'gender' => 'Male', 'address' => 'Talomo, Davao City', 'contact' => '09234567891', 'department' => 'Finance', 'position' => 'Finance Director'],
            ['name' => 'Elena Isabel Rodriguez', 'age' => 39, 'gender' => 'Female', 'address' => 'Toril, Davao City', 'contact' => '09345678902', 'department' => 'Library Services', 'position' => 'Head Librarian'],
            ['name' => 'Francisco Miguel Dela Cruz', 'age' => 41, 'gender' => 'Male', 'address' => 'Panacan, Davao City', 'contact' => '09456789013', 'department' => 'Security', 'position' => 'Security Supervisor'],
            ['name' => 'Josephine Marie Fernandez', 'age' => 36, 'gender' => 'Female', 'address' => 'Agdao, Davao City', 'contact' => '09567890124', 'department' => 'Student Affairs', 'position' => 'Student Affairs Officer'],
            ['name' => 'Manuel Antonio Garcia', 'age' => 45, 'gender' => 'Male', 'address' => 'Calinan, Davao City', 'contact' => '09678901235', 'department' => 'Engineering', 'position' => 'Chief Engineer'],
            ['name' => 'Rosario Luna Martinez', 'age' => 37, 'gender' => 'Female', 'address' => 'Tugbok, Davao City', 'contact' => '09789012346', 'department' => 'Nursing Department', 'position' => 'Nursing Coordinator'],
            ['name' => 'Alberto Jose Ramos', 'age' => 50, 'gender' => 'Male', 'address' => 'Baguio District, Davao City', 'contact' => '09890123457', 'department' => 'Maintenance', 'position' => 'Maintenance Supervisor'],
            ['name' => 'Victoria Grace Morales', 'age' => 33, 'gender' => 'Female', 'address' => 'Sasa, Davao City', 'contact' => '09901234568', 'department' => 'Communications', 'position' => 'Communications Officer'],
            ['name' => 'Teodoro Luis Bautista', 'age' => 47, 'gender' => 'Male', 'address' => 'Bunawan, Davao City', 'contact' => '09012345679', 'department' => 'Research', 'position' => 'Research Director'],
            ['name' => 'Esperanza Faith Lopez', 'age' => 40, 'gender' => 'Female', 'address' => 'Waan, Davao City', 'contact' => '09123456790', 'department' => 'Quality Assurance', 'position' => 'QA Manager'],
            ['name' => 'Leonardo Paul Rivera', 'age' => 43, 'gender' => 'Male', 'address' => 'Mintal, Davao City', 'contact' => '09234567801', 'department' => 'Transportation', 'position' => 'Transport Manager'],
            ['name' => 'Milagros Joy Pascual', 'age' => 34, 'gender' => 'Female', 'address' => 'Lasang, Davao City', 'contact' => '09345678912', 'department' => 'Admissions', 'position' => 'Admissions Officer'],
        ];

        foreach ($employeePatients as $index => $patientData) {
            $patient = Patient::create([
                'name' => $patientData['name'],
                'age' => $patientData['age'],
                'gender' => $patientData['gender'],
                'address' => $patientData['address'],
                'contact' => $patientData['contact'],
                'patient_type' => 'employee',
            ]);

            PatientProfile::create([
                'patient_id' => $patient->id,
                'last_name' => explode(' ', $patient->name)[2] ?? explode(' ', $patient->name)[1] ?? 'LastName',
                'first_name' => explode(' ', $patient->name)[0],
                'middle_initial' => substr(explode(' ', $patient->name)[1] ?? 'M', 0, 1),
                'date_of_birth' => Carbon::now()->subYears($patient->age)->format('Y-m-d'),
                'nationality' => 'Filipino',
                'civil_status' => ['Single', 'Married', 'Divorced', 'Widowed'][rand(0, 3)],
                'address' => $patient->address,
                'guardian_name' => null, // Adults don't need guardians
                'guardian_contact' => null,
                'emergency_contact' => '09' . rand(100000000, 999999999),
                'blood_type' => ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][rand(0, 7)],
                'height' => rand(150, 190),
                'weight' => rand(50, 95),
                'religion' => ['Catholic', 'Christian', 'Protestant', 'Islam', 'Buddhism'][rand(0, 4)],
                'eye_color' => ['Brown', 'Black', 'Hazel', 'Blue'][rand(0, 3)],
            ]);

            Employee::create([
                'patient_id' => $patient->id,
                'employee_id' => 'EMP-' . date('Y') . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'department' => $patientData['department'],
                'position' => $patientData['position'],
                'hire_date' => Carbon::now()->subYears(rand(1, 15)),
            ]);

            MedicalHistory::create([
                'patient_id' => $patient->id,
                'condition' => ['Annual physical exam', 'Health screening', 'Work-related consultation', 'Routine checkup'][rand(0, 3)],
                'diagnosed' => Carbon::now()->subDays(rand(1, 180))->format('Y-m-d'),
            ]);
        }

        $this->command->info('Successfully created:');
        $this->command->info('- ' . count($studentPatients) . ' student patients');
        $this->command->info('- ' . count($employeePatients) . ' employee patients');
        $this->command->info('- Total: ' . (count($studentPatients) + count($employeePatients)) . ' patients');
    }
}
