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

echo "=== DETAILED USER INVESTIGATION ===\n";

// Get complete user info with role
$user = $capsule->table('users')
    ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
    ->select('users.*', 'roles.name as role_name', 'roles.level as role_level', 'roles.description as role_description')
    ->where('users.email', $email)
    ->first();

if (!$user) {
    echo "❌ User not found for email: {$email}\n";
    exit(1);
}

echo "👤 USER DETAILS:\n";
echo "   ID: {$user->id}\n";
echo "   Name: {$user->name}\n";
echo "   Email: {$user->email}\n";
echo "   Role ID: {$user->role_id}\n";
echo "   Created: {$user->created_at}\n";
echo "   Updated: {$user->updated_at}\n";

echo "\n🎭 ROLE DETAILS:\n";
echo "   Role Name: {$user->role_name}\n";
echo "   Role Level: {$user->role_level}\n";
echo "   Role Description: {$user->role_description}\n";

echo "\n📊 ALL ROLES IN SYSTEM:\n";
$roles = $capsule->table('roles')->orderBy('id')->get();
foreach ($roles as $role) {
    echo "   ID: {$role->id} | Name: {$role->name} | Level: {$role->level}\n";
}

echo "\n🔍 CHECKING FOR DUPLICATES OR ISSUES:\n";
$userCount = $capsule->table('users')->where('email', $email)->count();
echo "   Users with this email: {$userCount}\n";

$roleExists = $capsule->table('roles')->where('id', $user->role_id)->first();
if ($roleExists) {
    echo "   ✅ Role ID {$user->role_id} exists and is valid\n";
} else {
    echo "   ❌ Role ID {$user->role_id} does NOT exist!\n";
}

echo "\n💾 CHECKING SESSION/CACHE:\n";
echo "   (This would require checking the actual login process)\n";
echo "   Database shows: {$user->role_name}\n";
echo "   If UI shows different, it's likely a caching or frontend issue\n";