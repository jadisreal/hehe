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

echo "=== CURRENT ROLES ===\n";
$roles = $capsule->table('roles')->get();

foreach ($roles as $role) {
    echo "ID: {$role->id} | Name: {$role->name} | Level: {$role->level}\n";
}

echo "\n=== USERS WITH ROLES ===\n";
$users = $capsule->table('users')
    ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
    ->select('users.name', 'users.email', 'roles.name as role_name')
    ->get();

foreach ($users as $user) {
    echo "User: {$user->name} | Email: {$user->email} | Role: " . ($user->role_name ?? 'No role') . "\n";
}