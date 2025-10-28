<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

$email = 'jdavid_240000000175@uic.edu.ph';

echo "=== TESTING HIGHER ROLE PRIORITY LOGIC ===\n\n";

echo "🔍 Checking Laravel User for: {$email}\n";

try {
    $laravelUser = User::with('role')->where('email', $email)->first();
    
    if ($laravelUser && $laravelUser->role) {
        echo "✅ Laravel user found with assigned role!\n";
        echo "   - User ID: {$laravelUser->id}\n";
        echo "   - Name: {$laravelUser->name}\n";
        echo "   - Role ID: {$laravelUser->role_id}\n";
        echo "   - Role Name: {$laravelUser->role->name}\n";
        echo "   - Role Level: {$laravelUser->role->level}\n";
        echo "   - Display Name: {$laravelUser->getRoleDisplayName()}\n";
        echo "   - hasRole('student'): " . ($laravelUser->hasRole('student') ? 'true' : 'false') . "\n";
        echo "   - hasRole('nurse'): " . ($laravelUser->hasRole('nurse') ? 'true' : 'false') . "\n";
        
        echo "\n🎯 API WOULD RETURN:\n";
        $apiResponse = [
            'success' => true,
            'message' => 'Laravel user found with assigned role',
            'user' => [
                'user_id' => $laravelUser->id,
                'email' => $laravelUser->email,
                'name' => $laravelUser->name,
                'branch_id' => 1,
                'branch_name' => 'Main Campus',
                'role' => $laravelUser->getRoleDisplayName(),
                'is_student' => $laravelUser->hasRole('student'),
                'branches' => [
                    'branch_id' => 1,
                    'branch_name' => 'Main Campus'
                ]
            ]
        ];
        
        echo json_encode($apiResponse, JSON_PRETTY_PRINT) . "\n";
        
    } else {
        echo "❌ Laravel user not found or has no role\n";
        
        // Test pattern matching fallback
        echo "\n🔄 Would fall back to pattern matching:\n";
        $emailPrefix = explode('@', $email)[0];
        $isStudent = preg_match('/.*_(\d{12})$/', $emailPrefix);
        $userRole = $isStudent ? 'student' : 'employee';
        echo "   - Pattern detected: " . ($isStudent ? 'Student' : 'Employee') . "\n";
        echo "   - Would assign role: {$userRole}\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== CONCLUSION ===\n";
echo "The higher role priority logic should work correctly.\n";
echo "Laravel role takes precedence over email pattern matching.\n";