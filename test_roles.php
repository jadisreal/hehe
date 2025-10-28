<?php

use App\Models\User;
use App\Models\Role;

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->boot();

echo "=== Testing Role System ===\n";

// Check all roles
echo "\nCurrent Roles:\n";
$roles = Role::all();
foreach ($roles as $role) {
    $userCount = User::where('role_id', $role->id)->count();
    echo "- {$role->name} (ID: {$role->id}, Level: {$role->level}) - {$userCount} users\n";
}

// Test user role assignment
echo "\nTesting Users:\n";
$users = User::with('role')->get();
foreach ($users as $user) {
    $roleName = $user->role ? $user->role->name : 'No role';
    $isNurse = $user->isNurse() ? 'Yes' : 'No';
    $isDoctor = $user->isDoctor() ? 'Yes' : 'No';
    echo "User: {$user->name}, Email: {$user->email}\n";
    echo "  Role: {$roleName}\n";
    echo "  Is Nurse: {$isNurse}\n";
    echo "  Is Doctor: {$isDoctor}\n\n";
}

echo "Role system test completed!\n";