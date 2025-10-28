<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

$email = 'jdavid_240000000175@uic.edu.ph';

echo "=== DEBUGGING API ISSUE ===\n";

try {
    echo "1. Checking Laravel User model...\n";
    $laravelUser = User::with('role')->where('email', $email)->first();
    
    if ($laravelUser) {
        echo "   ✅ Found Laravel user:\n";
        echo "   - ID: {$laravelUser->id}\n";
        echo "   - Name: {$laravelUser->name}\n";
        echo "   - Email: {$laravelUser->email}\n";
        echo "   - Role ID: {$laravelUser->role_id}\n";
        echo "   - Role Name: " . ($laravelUser->role ? $laravelUser->role->name : 'No role') . "\n";
        echo "   - Display Name: {$laravelUser->getRoleDisplayName()}\n";
        
        // Test hasRole method
        echo "   - hasRole('student'): " . ($laravelUser->hasRole('student') ? 'true' : 'false') . "\n";
        echo "   - hasRole('nurse'): " . ($laravelUser->hasRole('nurse') ? 'true' : 'false') . "\n";
    } else {
        echo "   ❌ Laravel user not found\n";
    }
    
    echo "\n2. Checking MSSQL users table...\n";
    try {
        $mssqlUser = DB::table('users')->where('email', $email)->first();
        if ($mssqlUser) {
            echo "   ✅ Found MSSQL user: {$mssqlUser->email}\n";
        } else {
            echo "   ❌ MSSQL user not found\n";
        }
    } catch (Exception $e) {
        echo "   ❌ MSSQL error: " . $e->getMessage() . "\n";
    }
    
    echo "\n3. Testing branches table...\n";
    try {
        $branch = DB::table('branches')->where('branch_id', 1)->first();
        if ($branch) {
            echo "   ✅ Default branch: {$branch->branch_name}\n";
        } else {
            echo "   ❌ Default branch not found\n";
        }
    } catch (Exception $e) {
        echo "   ❌ Branches error: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}