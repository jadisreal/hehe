<?php
// examine_component_diff.php
// This script analyzes our fix to see if there are any differences between
// how student consultations and employee consultations are handled

echo "=== ANALYZING CONSULTATION CREATION LOGIC ===\n\n";

// Manually extract code fragments for comparison
$walkInCode = file_get_contents(__DIR__ . '/resources/js/pages/Consultation/WalkIn.tsx');
$scheduledCode = file_get_contents(__DIR__ . '/resources/js/pages/Consultation/Scheduled.tsx');

// Check for potential pattern differences
echo "Checking URL path parsing in both components:\n";
preg_match('/window\.location\.pathname\.split\(\'\\/\'\)/', $walkInCode, $walkInPathSplit);
preg_match('/window\.location\.pathname\.split\(\'\\/\'\)/', $scheduledCode, $scheduledPathSplit);
echo "- WalkIn uses path splitting: " . (!empty($walkInPathSplit) ? "YES" : "NO") . "\n";
echo "- Scheduled uses path splitting: " . (!empty($scheduledPathSplit) ? "YES" : "NO") . "\n\n";

// Check if student-specific code exists
echo "Checking for student-specific code:\n";
preg_match('/student(?!Profile|Service|\.fixed|\.ts)/', $walkInCode, $walkInStudentOnly);
preg_match('/student(?!Profile|Service|\.fixed|\.ts)/', $scheduledCode, $scheduledStudentOnly);
echo "- WalkIn has student-specific logic: " . (!empty($walkInStudentOnly) ? "YES" : "NO") . "\n";
echo "- Scheduled has student-specific logic: " . (!empty($scheduledStudentOnly) ? "YES" : "NO") . "\n\n";

// Check if employee-specific code exists
echo "Checking for employee-specific code:\n";
preg_match('/employee(?!Profile|Service|\.fixed|\.ts)/', $walkInCode, $walkInEmployeeOnly);
preg_match('/employee(?!Profile|Service|\.fixed|\.ts)/', $scheduledCode, $scheduledEmployeeOnly);
echo "- WalkIn has employee-specific logic: " . (!empty($walkInEmployeeOnly) ? "YES" : "NO") . "\n";
echo "- Scheduled has employee-specific logic: " . (!empty($scheduledEmployeeOnly) ? "YES" : "NO") . "\n\n";

// Check API endpoints used
echo "Checking API endpoints used:\n";
preg_match_all('/axios\.(?:post|get|put|delete)\([\'"]\/api\/([^\'"]+)[\'"]/', $walkInCode, $walkInEndpoints);
preg_match_all('/axios\.(?:post|get|put|delete)\([\'"]\/api\/([^\'"]+)[\'"]/', $scheduledCode, $scheduledEndpoints);
echo "- WalkIn API endpoints: " . implode(", ", $walkInEndpoints[1]) . "\n";
echo "- Scheduled API endpoints: " . implode(", ", $scheduledEndpoints[1]) . "\n\n";

// Check if the component handles patient ID correctly
echo "Checking patient ID handling:\n";
preg_match('/patient_id\s*:\s*parseInt\(([^)]+)\)/', $walkInCode, $walkInPatientId);
preg_match('/patient_id\s*:\s*parseInt\(([^)]+)\)/', $scheduledCode, $scheduledPatientId);
echo "- WalkIn patient_id value: " . ($walkInPatientId[1] ?? "Not found") . "\n";
echo "- Scheduled patient_id value: " . ($scheduledPatientId[1] ?? "Not found") . "\n\n";

// Check database for employee consultations created recently
echo "Checking database for recent employee consultations:\n";
try {
    $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    $query = "
        SELECT c.id, c.patient_id, p.name, p.patient_type, c.date, c.type, c.created_at
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        WHERE p.patient_type = 'employee' 
        AND c.created_at >= date('now', '-1 day')
        ORDER BY c.id DESC
        LIMIT 5
    ";
    $result = $db->query($query);
    $count = 0;
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "  ID: {$row['id']}, Patient: {$row['name']} (ID: {$row['patient_id']}), Type: {$row['type']}, Created: {$row['created_at']}\n";
        $count++;
    }
    
    if ($count === 0) {
        echo "  No recent employee consultations found\n";
    }
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}