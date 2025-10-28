<?php

require_once __DIR__ . '/vendor/aut    echo "4. Login with jdavid_240000000175@uic.edu.ph\n";load.php';

use App\Models\User;
use App\Models\Role;

// Initialize Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Student OAuth Redirect ===\n";

try {
    // Find Jad David's user
    $user = User::where('email', 'jdavid_240000000175@uic.edu.ph')->first();
    
    if (!$user) {
        echo "❌ User 'jdavid_240000000175@uic.edu.ph' not found!\n";
        exit(1);
    }
    
    echo "✅ Found user: {$user->name} (ID: {$user->id})\n";
    echo "Current role: " . $user->getRoleDisplayName() . "\n";
    
    // Find Student role
    $studentRole = Role::where('name', 'Student')->first();
    
    if (!$studentRole) {
        echo "❌ Student role not found!\n";
        exit(1);
    }
    
    // Update user to Student role
    $user->update(['role_id' => $studentRole->id]);
    
    // Refresh to verify
    $user->refresh();
    $user->load('role');
    
    echo "✅ Updated user role to: " . $user->getRoleDisplayName() . "\n";
    echo "\n=== Test Instructions ===\n";
    echo "1. Go to http://localhost:8000\n";
    echo "2. Click 'Sign in with Google'\n";
    echo "3. Login with jad.david@uic.edu.ph\n";
    echo "4. Should redirect to: /student/profile-dashboard\n";
    echo "5. NOT to the regular dashboard\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n=== Test Ready ===\n";