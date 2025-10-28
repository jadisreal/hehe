<?php
// Simple PDO script to set mlira's role to 'student' in the SQLite DB
$dbPath = __DIR__ . '/../database/database.sqlite';
if (!file_exists($dbPath)) {
    echo "Database file not found at: {$dbPath}\n";
    exit(1);
}
try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Find student role id
    $stmt = $pdo->prepare("SELECT id FROM roles WHERE name = :name LIMIT 1");
    $stmt->execute([':name' => 'student']);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$student) {
        echo "Student role not found in roles table.\n";
        exit(1);
    }
    $studentId = $student['id'];

    $email = 'mlira_230000000567@uic.edu.ph';

    // Show current value
    $stmt = $pdo->prepare("SELECT id, name, email, role_id FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        echo "User with email {$email} not found.\n";
        exit(1);
    }
    echo "Before: id={$user['id']} name={$user['name']} email={$user['email']} role_id={$user['role_id']}\n";

    // Update
    $update = $pdo->prepare("UPDATE users SET role_id = :role_id WHERE email = :email");
    $update->execute([':role_id' => $studentId, ':email' => $email]);

    // Verify
    $stmt = $pdo->prepare("SELECT u.id, u.name, u.email, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $updated = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "After: id={$updated['id']} name={$updated['name']} email={$updated['email']} role={$updated['role_name']}\n";
    echo "✅ Role updated to 'student'.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
