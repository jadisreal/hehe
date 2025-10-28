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

$email = 'jdavid_240000000175@uic.edu.ph';

echo "=== UPDATING USER ROLE ===\n";

// Find the user
$user = $capsule->table('users')->where('email', $email)->first();

if (!$user) {
    echo "❌ User not found for email: {$email}\n";
    exit(1);
}

// Find the nurse role
$nurseRole = $capsule->table('roles')->where('name', 'nurse')->first();

if (!$nurseRole) {
    echo "❌ Nurse role not found\n";
    exit(1);
}

// Get current role name
$currentRole = $capsule->table('roles')->where('id', $user->role_id)->first();
$currentRoleName = $currentRole ? $currentRole->name : 'No role';

echo "👤 User: {$user->name}\n";
echo "📧 Email: {$email}\n";
echo "🔄 Current role: {$currentRoleName} (ID: {$user->role_id})\n";
echo "➡️  Changing to: nurse (ID: {$nurseRole->id})\n\n";

// Update the user's role
$capsule->table('users')
    ->where('email', $email)
    ->update(['role_id' => $nurseRole->id]);

echo "✅ Successfully updated {$user->name} to Nurse role!\n\n";

// Verify the change
echo "=== VERIFICATION ===\n";
$updatedUser = $capsule->table('users')
    ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
    ->select('users.name', 'users.email', 'roles.name as role_name')
    ->where('users.email', $email)
    ->first();

echo "User: {$updatedUser->name} | Email: {$updatedUser->email} | Role: {$updatedUser->role_name}\n";