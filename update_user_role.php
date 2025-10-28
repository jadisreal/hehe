<?php<?php<?php

require_once 'vendor/autoload.php';

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();require_once 'vendor/autoload.php';



$user = \App\Models\User::where('email', 'jdavid_240000000175@uic.edu.ph')->first();// Bootstrap the Laravel application



if ($user) {$app = require_once 'bootstrap/app.php';use Illuminate\Database\Capsule\Manager as Capsule;

    echo "Current role ID: " . $user->role_id . "\n";

    $user->role_id = 7;$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    $user->save();

    echo "User role updated to nurse (role_id = 7)\n";$capsule = new Capsule;

    

    $user->refresh();// Find and update the user

    $user->load('role');

    echo "New role: " . $user->role->name . " (Level: " . $user->role->level . ")\n";$user = \App\Models\User::where('email', 'jdavid_240000000175@uic.edu.ph')->first();$capsule->addConnection([

} else {

    echo "User not found\n";    'driver' => 'sqlite',

}
if ($user) {    'database' => 'database/database.sqlite',

    echo "Current role ID: " . $user->role_id . "\n";    'prefix' => '',

    ]);

    // Update to nurse role (ID 7)

    $user->role_id = 7;$capsule->setAsGlobal();

    $user->save();$capsule->bootEloquent();

    

    echo "User role updated to student (role_id will be set below)\n";$email = 'mlira_230000000567@uic.edu.ph';

    

    // Verify the updateecho "=== UPDATING USER ROLE ===\n";

    $user->refresh();

    $user->load('role');// Find the user

    echo "New role: " . $user->role->name . " (Level: " . $user->role->level . ")\n";$user = $capsule->table('users')->where('email', $email)->first();

} else {

    echo "User not found\n";if (!$user) {

}    echo "❌ User not found for email: {$email}\n";
    exit(1);
}

// Find the student role
$studentRole = $capsule->table('roles')->where('name', 'student')->first();

if (!$studentRole) {
    echo "❌ Student role not found\n";
    exit(1);
}

// Get current role name
$currentRole = $capsule->table('roles')->where('id', $user->role_id)->first();
$currentRoleName = $currentRole ? $currentRole->name : 'No role';

echo "👤 User: {$user->name}\n";
echo "📧 Email: {$email}\n";
echo "🔄 Current role: {$currentRoleName} (ID: {$user->role_id})\n";
echo "➡️  Changing to: student (ID: {$studentRole->id})\n\n";

// Update the user's role
$capsule->table('users')
    ->where('email', $email)
    ->update(['role_id' => $studentRole->id]);

echo "✅ Successfully updated {$user->name} to Student role!\n\n";

// Verify the change
echo "=== VERIFICATION ===\n";
$updatedUser = $capsule->table('users')
    ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
    ->select('users.name', 'users.email', 'roles.name as role_name')
    ->where('users.email', $email)
    ->first();

echo "User: {$updatedUser->name} | Email: {$updatedUser->email} | Role: {$updatedUser->role_name}\n";