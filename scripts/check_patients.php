<?php
// Define the path to the Laravel app
$laravelPath = __DIR__ . '/../';

// Include the autoloader
require_once $laravelPath . 'vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once $laravelPath . 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Use the Eloquent model to query
use App\Models\Patient;
$patients = Patient::with(['profile', 'student', 'employee'])->get();

echo "Patients in database:\n";
foreach ($patients as $patient) {
    echo "ID: {$patient->id}, Name: {$patient->name}, Type: {$patient->patient_type}\n";
    
    if ($patient->student) {
        echo "  Student ID: {$patient->student->student_id}, Course: {$patient->student->course}\n";
    } else if ($patient->employee) {
        echo "  Employee ID: {$patient->employee->employee_id}, Department: {$patient->employee->department}\n";
    }
    
    echo "\n";
}