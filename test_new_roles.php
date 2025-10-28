<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'sqlite',
    'database' => 'database/database.sqlite',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Test the default role assignment logic
$emailRoleMapping = [
    'sampon_230000001231@uic.edu.ph' => 'doctor',
    // other mappings...
];

$testEmail = 'new_user@example.com';
$targetRoleName = $emailRoleMapping[$testEmail] ?? 'student'; // Default to student

echo "=== ROLE ASSIGNMENT TEST ===\n";
echo "Test Email: {$testEmail}\n";
echo "Would be assigned role: {$targetRoleName}\n\n";

echo "=== ROLE PERMISSIONS TEST ===\n";
$roles = $capsule->table('roles')->get();

foreach ($roles as $role) {
    echo "Role: {$role->name} (Level {$role->level})\n";
    
    // Simulate the role permission checks
    $canAccessInventory = in_array($role->name, ['nurse', 'student', 'employee']);
    $canAccessReports = in_array($role->name, ['nurse', 'student', 'employee']);
    
    echo "  - Can access inventory: " . ($canAccessInventory ? 'YES' : 'NO') . "\n";
    echo "  - Can access reports: " . ($canAccessReports ? 'YES' : 'NO') . "\n";
    echo "\n";
}