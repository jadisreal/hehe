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

echo "=== UPDATING STUDENT AND EMPLOYEE ROLES TO LEVEL 3 ===\n";

// Update Student role to level 3
$studentResult = $capsule->table('roles')
    ->where('name', 'student')
    ->update([
        'level' => 3,
        'description' => 'Student users with restricted access (level 3 restrictions)',
        'updated_at' => date('Y-m-d H:i:s')
    ]);

echo "📝 Student role update: {$studentResult} row(s) affected\n";

// Update Employee role to level 3
$employeeResult = $capsule->table('roles')
    ->where('name', 'employee')
    ->update([
        'level' => 3,
        'description' => 'Employee users with restricted access (level 3 restrictions)',
        'updated_at' => date('Y-m-d H:i:s')
    ]);

echo "📝 Employee role update: {$employeeResult} row(s) affected\n";

echo "\n=== VERIFICATION - ALL ROLES ===\n";
$roles = $capsule->table('roles')->orderBy('level', 'asc')->get();
foreach ($roles as $role) {
    echo "ID: {$role->id} | Name: {$role->name} | Level: {$role->level} | Description: {$role->description}\n";
}

echo "\n=== CURRENT USER DISTRIBUTION ===\n";
$users = $capsule->table('users')
    ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
    ->select('users.name', 'users.email', 'roles.name as role_name', 'roles.level as role_level')
    ->get();

foreach ($users as $user) {
    echo "User: {$user->name} | Email: {$user->email} | Role: " . ($user->role_name ?? 'No role') . " (Level: " . ($user->role_level ?? 'N/A') . ")\n";
}