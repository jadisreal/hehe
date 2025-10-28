<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->boot();

use App\Models\Role;
use App\Models\User;

echo "=== CREATING NURSE ROLE ===" . PHP_EOL;

// Create the nurse role
$nurseRole = Role::create([
    'name' => 'nurse',
    'description' => 'Default nurse users with full access to all features',
    'level' => 1
]);

echo "Created nurse role with ID: {$nurseRole->id}" . PHP_EOL;

echo PHP_EOL . "=== UPDATING USERS WITHOUT ROLES ===" . PHP_EOL;

// Update users without roles to nurse
$usersUpdated = User::whereNull('role_id')->update(['role_id' => $nurseRole->id]);
echo "Updated {$usersUpdated} users to nurse role" . PHP_EOL;

echo PHP_EOL . "=== FINAL ROLES ===" . PHP_EOL;
$roles = Role::all();
foreach ($roles as $role) {
    echo "ID: {$role->id}, Name: {$role->name}, Level: {$role->level}" . PHP_EOL;
}

echo PHP_EOL . "=== FINAL USERS ===" . PHP_EOL;
$users = User::with('role')->get();
foreach ($users as $user) {
    $roleName = $user->role ? $user->role->name : 'no role';
    $roleId = $user->role_id ?? 'null';
    echo "Email: {$user->email} -> Role ID: {$roleId} ({$roleName})" . PHP_EOL;
}