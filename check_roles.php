<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->boot();

use App\Models\User;
use App\Models\Role;

echo "=== ROLES IN DATABASE ===" . PHP_EOL;
$roles = Role::all();
foreach ($roles as $role) {
    echo "ID: {$role->id}, Name: {$role->name}, Level: {$role->level}" . PHP_EOL;
}

echo PHP_EOL . "=== USERS WITH ROLES ===" . PHP_EOL;
$users = User::with('role')->get();
foreach ($users as $user) {
    $roleName = $user->role ? $user->role->name : 'no role';
    $roleId = $user->role_id ?? 'null';
    echo "Email: {$user->email} -> Role ID: {$roleId} ({$roleName})" . PHP_EOL;
}

echo PHP_EOL . "=== CHECKING SPECIFIC EMAIL ===" . PHP_EOL;
$targetUser = User::where('email', 'sampon_230000001231@uic.edu.ph')->with('role')->first();
if ($targetUser) {
    echo "Found user: {$targetUser->email}" . PHP_EOL;
    echo "Role ID: " . ($targetUser->role_id ?? 'null') . PHP_EOL;
    echo "Role Name: " . ($targetUser->role ? $targetUser->role->name : 'no role') . PHP_EOL;
    echo "User display role: " . $targetUser->getRoleDisplayName() . PHP_EOL;
} else {
    echo "User not found in database" . PHP_EOL;
}