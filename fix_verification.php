<?php
// fix_verification.php - A final check to ensure our fix is working

// Step 1: Show recent consultations for students and employees
$db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

echo "=== STEP 1: RECENT CONSULTATIONS BY PATIENT TYPE ===\n";
$sql = "
    SELECT p.id, p.name, p.patient_type, 
           COUNT(c.id) as consultation_count, 
           MAX(c.created_at) as latest_consultation
    FROM patients p
    LEFT JOIN consultations c ON p.id = c.patient_id
    GROUP BY p.id, p.name, p.patient_type
    ORDER BY latest_consultation DESC
    LIMIT 10
";

$results = $db->query($sql);
while ($row = $results->fetch(PDO::FETCH_ASSOC)) {
    echo "Patient ID: {$row['id']}, Name: {$row['name']}, Type: {$row['patient_type']}, " .
         "Consultations: {$row['consultation_count']}, Latest: {$row['latest_consultation']}\n";
}

// Step 2: Verify URL extraction logic in the components
echo "\n=== STEP 2: VERIFYING URL EXTRACTION LOGIC ===\n";
echo "Example URL: /consultation/employee/4/walk-in\n";

$testPath = "/consultation/employee/4/walk-in";
$pathParts = explode('/', $testPath);
echo "Path parts: " . implode(", ", $pathParts) . "\n";
echo "Path type (student/employee): " . $pathParts[2] . "\n";
echo "Patient ID from URL: " . $pathParts[3] . "\n";

// Step 3: Check if employee consultations are working properly
echo "\n=== STEP 3: CHECKING EMPLOYEE CONSULTATION ASSIGNMENT ===\n";
$sql = "
    SELECT c.id, c.patient_id, p.name, p.patient_type, c.type, c.created_at
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    WHERE p.patient_type = 'employee'
    ORDER BY c.created_at DESC
    LIMIT 5
";

$results = $db->query($sql);
while ($row = $results->fetch(PDO::FETCH_ASSOC)) {
    echo "Consultation ID: {$row['id']}, Patient ID: {$row['patient_id']}, " .
         "Name: {$row['name']}, Type: {$row['type']}, Created: {$row['created_at']}\n";
}