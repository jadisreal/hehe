<?php
$pdo = new PDO('sqlite:database/database.sqlite');

echo "=== CHECKING USER ROLES FOR NURSE ACCESS DEBUG ===\n";

// Check your specific nurse user
$user = $pdo->query("
    SELECT u.email, u.name, r.name as role_name, r.id as role_id 
    FROM users u 
    LEFT JOIN roles r ON u.role_id = r.id 
    WHERE u.email = 'jdavid_240000000175@uic.edu.ph'
")->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "Your nurse account:\n";
    echo "Email: {$user['email']}\n";
    echo "Name: {$user['name']}\n";
    echo "Role Name: '{$user['role_name']}'\n";
    echo "Role ID: {$user['role_id']}\n";
    echo "Role Name Length: " . strlen($user['role_name']) . "\n";
    echo "Role Name (with quotes): \"{$user['role_name']}\"\n";
} else {
    echo "❌ User not found!\n";
}

echo "\n=== ALL ROLES IN DATABASE ===\n";
$roles = $pdo->query('SELECT id, name FROM roles ORDER BY id');
while ($role = $roles->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$role['id']} | Name: '{$role['name']}' | Length: " . strlen($role['name']) . "\n";
}

echo "\n=== ALL NURSE ROLE USERS ===\n";
$nurses = $pdo->query("
    SELECT u.email, u.name, r.name as role_name 
    FROM users u 
    LEFT JOIN roles r ON u.role_id = r.id 
    WHERE r.name = 'nurse'
");
while ($nurse = $nurses->fetch(PDO::FETCH_ASSOC)) {
    echo "Email: {$nurse['email']} | Name: {$nurse['name']} | Role: '{$nurse['role_name']}'\n";
}