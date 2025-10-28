<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;

// Simulate OAuth authentication flow
$email = 'jdavid_240000000175@uic.edu.ph';

echo "=== TESTING NURSE IMMUNITY IN OAUTH FLOW ===\n\n";

// 1. Get the user (as OAuth would do)
$user = User::with('role')->where('email', $email)->first();

if (!$user) {
    echo "❌ User not found\n";
    exit(1);
}

echo "📧 Testing user: {$user->email}\n";
echo "👤 Current name: {$user->name}\n";
echo "🎭 Current role ID: {$user->role_id}\n";
echo "🎭 Current role name: " . ($user->role ? $user->role->name : 'None') . "\n\n";

// 2. Simulate the role assignment logic from GoogleAuthController
echo "🔄 Simulating assignRoleToUser() logic...\n";

// Check nurse immunity
if ($user->role && strtolower($user->role->name) === 'nurse') {
    echo "🛡️ NURSE IMMUNITY ACTIVATED: User already has nurse role - PROTECTING from downgrade\n";
    echo "✅ Role assignment SKIPPED - nurse immunity active\n";
} else {
    echo "⚠️ No nurse immunity - would proceed with role assignment\n";
    
    // Simulate normal role assignment
    $emailRoleMapping = [
        'sampon_230000001231@uic.edu.ph' => 'doctor',
        // jdavid is NOT in this mapping
    ];
    
    $targetRoleName = $emailRoleMapping[$email] ?? 'student';
    echo "📋 Target role from mapping: {$targetRoleName}\n";
    
    $role = Role::where('name', $targetRoleName)->first();
    if ($role) {
        echo "⚠️ Would update role_id to: {$role->id} ({$role->name})\n";
    }
}

echo "\n=== FINAL VERIFICATION ===\n";
$user->refresh();
$user->load('role');
echo "Final role: " . ($user->role ? $user->role->name : 'None') . "\n";
echo "Display name: {$user->getRoleDisplayName()}\n";