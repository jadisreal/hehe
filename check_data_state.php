<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Patient;
use App\Models\Student;
use App\Models\Employee;

echo "=== CURRENT DATABASE STATE ===\n\n";

echo "📊 COUNTS:\n";
echo "Patients: " . Patient::count() . "\n";
echo "Students: " . Student::count() . "\n";
echo "Employees: " . Employee::count() . "\n\n";

echo "📋 STUDENTS:\n";
$students = Student::with('patient')->get();
foreach ($students as $student) {
    $patient = $student->patient;
    echo "ID: {$student->id} | Patient: {$patient->name} | Course: {$student->course}\n";
}

echo "\n📋 EMPLOYEES:\n";
$employees = Employee::with('patient')->get();
foreach ($employees as $employee) {
    $patient = $employee->patient;
    echo "ID: {$employee->id} | Patient: {$patient->name} | Dept: {$employee->department} | Pos: {$employee->position}\n";
}

echo "\n📋 PATIENTS:\n";
$patients = Patient::all();
foreach ($patients as $patient) {
    echo "ID: {$patient->id} | Name: {$patient->name} | Type: {$patient->patient_type}\n";
}

// Check for duplicates
echo "\n🔍 CHECKING FOR DUPLICATES:\n";
$duplicateNames = Patient::select('name')
    ->groupBy('name')
    ->havingRaw('COUNT(*) > 1')
    ->get();

if ($duplicateNames->count() > 0) {
    echo "❌ Found duplicate patient names:\n";
    foreach ($duplicateNames as $dup) {
        echo "  - {$dup->name}\n";
    }
} else {
    echo "✅ No duplicate patient names found\n";
}