<?php
// Simple diagnostic script to check consultations by patient type

$db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

// Get all patients grouped by type
echo "=== PATIENTS BY TYPE ===\n";
$patientsByType = $db->query('SELECT patient_type, COUNT(*) as count FROM patients GROUP BY patient_type');
while ($typeCount = $patientsByType->fetch(PDO::FETCH_ASSOC)) {
    echo "{$typeCount['patient_type']}: {$typeCount['count']}\n";
}

// Get all students
echo "\n=== STUDENTS ===\n";
$students = $db->query('
    SELECT p.id, p.name, COUNT(c.id) as consultation_count 
    FROM patients p 
    LEFT JOIN consultations c ON p.id = c.patient_id 
    WHERE p.patient_type = "student" 
    GROUP BY p.id 
    ORDER BY p.id
    LIMIT 10
');

while ($student = $students->fetch(PDO::FETCH_ASSOC)) {
    echo "Student ID: {$student['id']}, Name: {$student['name']}, Consultations: {$student['consultation_count']}\n";
}

// Get all employees
echo "\n=== EMPLOYEES ===\n";
$employees = $db->query('
    SELECT p.id, p.name, COUNT(c.id) as consultation_count 
    FROM patients p 
    LEFT JOIN consultations c ON p.id = c.patient_id 
    WHERE p.patient_type = "employee" 
    GROUP BY p.id 
    ORDER BY p.id
    LIMIT 10
');

while ($employee = $employees->fetch(PDO::FETCH_ASSOC)) {
    echo "Employee ID: {$employee['id']}, Name: {$employee['name']}, Consultations: {$employee['consultation_count']}\n";
}

// Check the last few consultations to see if they're being assigned to the right patients
echo "\n=== RECENT CONSULTATIONS ===\n";
$recentConsultations = $db->query('
    SELECT c.id, c.patient_id, c.date, c.type, p.name, p.patient_type
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    ORDER BY c.id DESC
    LIMIT 10
');

while ($consultation = $recentConsultations->fetch(PDO::FETCH_ASSOC)) {
    echo "Consultation ID: {$consultation['id']}, Patient ID: {$consultation['patient_id']}, " .
         "Patient Name: {$consultation['name']}, Type: {$consultation['patient_type']}, " .
         "Date: {$consultation['date']}, Consultation Type: {$consultation['type']}\n";
}