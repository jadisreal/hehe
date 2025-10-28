<?php
// Simple script to check consultation data in the database

$db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

// Get all patients
echo "=== PATIENTS ===\n";
$patients = $db->query('SELECT id, name, patient_type FROM patients ORDER BY id LIMIT 10');
while ($patient = $patients->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$patient['id']}, Name: {$patient['name']}, Type: {$patient['patient_type']}\n";
}

// Get all consultations
echo "\n=== CONSULTATIONS ===\n";
$consultations = $db->query('SELECT id, patient_id, date, type FROM consultations ORDER BY id');
while ($consultation = $consultations->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$consultation['id']}, Patient ID: {$consultation['patient_id']}, Date: {$consultation['date']}, Type: {$consultation['type']}\n";
}

// Check if there's a pattern of all consultations going to one patient
echo "\n=== CONSULTATION COUNTS BY PATIENT ===\n";
$counts = $db->query('SELECT patient_id, COUNT(*) as count FROM consultations GROUP BY patient_id ORDER BY count DESC');
while ($count = $counts->fetch(PDO::FETCH_ASSOC)) {
    echo "Patient ID: {$count['patient_id']}, Consultation Count: {$count['count']}\n";
}