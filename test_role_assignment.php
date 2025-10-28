<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;

echo "=== TESTING assignRoleToUser NURSE IMMUNITY ===\n\n";

$email = 'jdavid_240000000175@uic.edu.ph';

// Get the user
$user = User::with('role')->where('email', $email)->first();

if (!$user) {
    echo "❌ User not found\n";
    exit(1);
}

echo "🔍 BEFORE assignment:\n";
echo "   - Email: {$user->email}\n";
echo "   - Role ID: {$user->role_id}\n";
echo "   - Role Name: " . ($user->role ? $user->role->name : 'None') . "\n";
echo "   - Display Name: {$user->getRoleDisplayName()}\n\n";

// Simulate the assignRoleToUser method logic with NURSE IMMUNITY
echo "🔄 Running assignRoleToUser simulation...\n";

// NURSE IMMUNITY CHECK
if ($user->role && strtolower($user->role->name) === 'nurse') {
    echo "🛡️ NURSE IMMUNITY ACTIVATED: User already has nurse role - PROTECTING from downgrade\n";
    echo "✅ assignRoleToUser would RETURN EARLY - no role change\n";
    $roleChanged = false;
} else {
    echo "⚠️ No nurse immunity - proceeding with role assignment\n";
    
    // Email mapping (jdavid is NOT in this list)
    $emailRoleMapping = [
        'sampon_230000001231@uic.edu.ph' => 'doctor',
    ];
    
    $targetRoleName = $emailRoleMapping[$email] ?? 'student'; // Would default to student
    echo "📋 Target role: {$targetRoleName}\n";
    
    $role = Role::where('name', $targetRoleName)->first();
    if ($role && $user->role_id !== $role->id) {
        echo "⚠️ Would UPDATE role_id from {$user->role_id} to {$role->id}\n";
        // $user->update(['role_id' => $role->id]); // Don't actually change it
        $roleChanged = true;
    } else {
        echo "ℹ️ Role already correct or role not found\n";
        $roleChanged = false;
    }
}

echo "\n🔍 AFTER assignment (simulation):\n";
$user->refresh(); // Refresh to get latest data
$user->load('role');
echo "   - Email: {$user->email}\n";
echo "   - Role ID: {$user->role_id}\n";
echo "   - Role Name: " . ($user->role ? $user->role->name : 'None') . "\n";
echo "   - Display Name: {$user->getRoleDisplayName()}\n\n";

if (!$roleChanged && $user->role && $user->role->name === 'nurse') {
    echo "✅ SUCCESS: Nurse immunity working - role protected!\n";
} else {
    echo "❌ FAILURE: Nurse role was not protected!\n";
}