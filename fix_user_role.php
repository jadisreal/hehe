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

echo "=== FIXING USER ROLE ===\n";

// Find the nurse role
$nurseRole = $capsule->table('roles')->where('name', 'nurse')->first();

if (!$nurseRole) {
    echo "❌ Nurse role not found\n";
    exit(1);
}

echo "🔧 Updating user role to Nurse (ID: {$nurseRole->id})\n";

// Update the user's role using a direct update
$result = $capsule->table('users')
    ->where('email', $email)
    ->update([
        'role_id' => $nurseRole->id,
        'updated_at' => date('Y-m-d H:i:s')
    ]);

echo "📝 Update result: {$result} row(s) affected\n";

// Verify immediately
$user = $capsule->table('users')
    ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
    ->select('users.name', 'users.email', 'users.role_id', 'roles.name as role_name')
    ->where('users.email', $email)
    ->first();

echo "\n✅ VERIFICATION:\n";
echo "   User: {$user->name}\n";
echo "   Email: {$user->email}\n";
echo "   Role ID: {$user->role_id}\n";
echo "   Role Name: {$user->role_name}\n";

if ($user->role_name === 'nurse') {
    echo "\n🎉 SUCCESS: User is now correctly assigned as Nurse!\n";
} else {
    echo "\n❌ FAILED: User is still showing as {$user->role_name}\n";
}