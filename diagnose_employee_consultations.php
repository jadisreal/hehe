<?php
// diagnose_consultations_simplified.php

$db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

echo "=== CHECKING IF EMPLOYEE CONSULTATIONS ARE BEING CREATED ===\n";

// Get consultations for employees only
$query = "
    SELECT c.id, c.patient_id, p.name, p.patient_type, c.date, c.type, c.created_at
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    WHERE p.patient_type = 'employee'
    ORDER BY c.id DESC
    LIMIT 5
";

$consultations = $db->query($query);
$employeeConsultations = [];

while ($consultation = $consultations->fetch(PDO::FETCH_ASSOC)) {
    $employeeConsultations[] = $consultation;
    echo "ID: {$consultation['id']}, Patient ID: {$consultation['patient_id']}, " .
         "Name: {$consultation['name']}, Date: {$consultation['date']}, Type: {$consultation['type']}\n";
}

if (empty($employeeConsultations)) {
    echo "No employee consultations found!\n";
}