<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Patient;
use App\Models\Student;
use App\Models\Employee;

echo "=== FINAL DATA VERIFICATION ===\n\n";

// Get counts
$totalPatients = Patient::count();
$totalStudents = Student::count();
$totalEmployees = Employee::count();

echo "📊 SUMMARY:\n";
echo "✅ Total Patients: {$totalPatients}\n";
echo "✅ Total Students: {$totalStudents}\n";
echo "✅ Total Employees: {$totalEmployees}\n\n";

// Check requirements
$studentRequirement = $totalStudents >= 15;
$employeeRequirement = $totalEmployees >= 15;

echo "🎯 REQUIREMENTS CHECK:\n";
echo ($studentRequirement ? "✅" : "❌") . " Students >= 15: {$totalStudents}\n";
echo ($employeeRequirement ? "✅" : "❌") . " Employees >= 15: {$totalEmployees}\n\n";

// Check data integrity
echo "🔍 DATA INTEGRITY:\n";

// Check for orphaned students
$orphanedStudents = Student::leftJoin('patients', 'students.patient_id', '=', 'patients.id')
    ->whereNull('patients.id')
    ->count();
echo ($orphanedStudents == 0 ? "✅" : "❌") . " No orphaned students: {$orphanedStudents}\n";

// Check for orphaned employees
$orphanedEmployees = Employee::leftJoin('patients', 'employees.patient_id', '=', 'patients.id')
    ->whereNull('patients.id')
    ->count();
echo ($orphanedEmployees == 0 ? "✅" : "❌") . " No orphaned employees: {$orphanedEmployees}\n";

// Check for students without patients
$studentsWithoutPatients = Student::whereNotIn('patient_id', function($query) {
    $query->select('id')->from('patients');
})->count();
echo ($studentsWithoutPatients == 0 ? "✅" : "❌") . " All students have patients: {$studentsWithoutPatients}\n";

// Check for employees without patients
$employeesWithoutPatients = Employee::whereNotIn('patient_id', function($query) {
    $query->select('id')->from('patients');
})->count();
echo ($employeesWithoutPatients == 0 ? "✅" : "❌") . " All employees have patients: {$employeesWithoutPatients}\n";

// Check for duplicate names
$duplicateNames = Patient::select('name')
    ->groupBy('name')
    ->havingRaw('COUNT(*) > 1')
    ->count();
echo ($duplicateNames == 0 ? "✅" : "❌") . " No duplicate names: {$duplicateNames}\n\n";

// Sample data display
echo "📋 SAMPLE DATA (First 5 of each):\n\n";

echo "Students:\n";
$sampleStudents = Student::with('patient')->take(5)->get();
foreach ($sampleStudents as $student) {
    echo "  - {$student->patient->name} | {$student->course} | Year {$student->year_level}\n";
}

echo "\nEmployees:\n";
$sampleEmployees = Employee::with('patient')->take(5)->get();
foreach ($sampleEmployees as $employee) {
    echo "  - {$employee->patient->name} | {$employee->department} | {$employee->position}\n";
}

echo "\n🎉 " . ($studentRequirement && $employeeRequirement ? "SUCCESS" : "INCOMPLETE") . ": Data population completed!\n";