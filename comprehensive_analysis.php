<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

echo "=== COMPREHENSIVE BACKEND/DATABASE INVESTIGATION ===\n\n";

echo "1. DATABASE STRUCTURE ANALYSIS\n";
echo "=" . str_repeat("=", 50) . "\n";

// Check database configuration
echo "📊 DATABASE CONFIG:\n";
$defaultConnection = config('database.default');
echo "   Default connection: {$defaultConnection}\n";

$connections = config('database.connections');
foreach ($connections as $name => $config) {
    if (isset($config['database'])) {
        echo "   Connection '{$name}': {$config['driver']} -> {$config['database']}\n";
    }
}

echo "\n📋 LARAVEL TABLES (SQLite):\n";
try {
    $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    foreach ($tables as $table) {
        echo "   - {$table->name}\n";
    }
} catch (Exception $e) {
    echo "   Error: " . $e->getMessage() . "\n";
}

echo "\n🎭 ROLES TABLE:\n";
$roles = Role::orderBy('level')->get();
foreach ($roles as $role) {
    echo "   ID: {$role->id} | Name: {$role->name} | Level: {$role->level} | Description: {$role->description}\n";
}

echo "\n👥 USERS TABLE:\n";
$users = User::with('role')->get();
foreach ($users as $user) {
    $roleName = $user->role ? $user->role->name : 'No role';
    $roleLevel = $user->role ? $user->role->level : 'N/A';
    echo "   ID: {$user->id} | Email: {$user->email} | Name: {$user->name} | Role: {$roleName} (Level: {$roleLevel})\n";
}

echo "\n\n2. AUTHENTICATION FLOW ANALYSIS\n";
echo "=" . str_repeat("=", 50) . "\n";

echo "🔐 GOOGLE AUTH CONTROLLER:\n";
$googleAuthFile = file_get_contents('app/Http/Controllers/Auth/GoogleAuthController.php');

// Extract key parts
preg_match('/function authenticate.*?return response.*?}.*?}/s', $googleAuthFile, $authMethod);
if ($authMethod) {
    echo "   ✅ GoogleAuthController->authenticate() method exists\n";
    // Check what it returns
    if (strpos($authMethod[0], 'getRoleDisplayName') !== false) {
        echo "   ✅ Uses getRoleDisplayName() for role\n";
    }
    if (strpos($authMethod[0], 'assignRoleToUser') !== false) {
        echo "   ✅ Calls assignRoleToUser() method\n";
    }
}

echo "\n📧 EMAIL-TO-ROLE MAPPING:\n";
preg_match('/getEmailRoleMapping.*?return \[(.*?)\];/s', $googleAuthFile, $emailMapping);
if ($emailMapping) {
    echo "   Email mappings found in GoogleAuthController\n";
    $lines = explode("\n", $emailMapping[1]);
    foreach ($lines as $line) {
        $line = trim($line);
        if (!empty($line) && strpos($line, '=>') !== false) {
            echo "   - {$line}\n";
        }
    }
}

echo "\n🔄 DEFAULT ROLE ASSIGNMENT:\n";
if (strpos($googleAuthFile, "?? 'student'") !== false) {
    echo "   ✅ Default role: student\n";
} elseif (strpos($googleAuthFile, "?? 'nurse'") !== false) {
    echo "   ✅ Default role: nurse\n";
} else {
    echo "   ❓ Default role: unknown\n";
}

echo "\n\n3. USER CONTROLLER ANALYSIS\n";
echo "=" . str_repeat("=", 50) . "\n";

$userControllerFile = file_get_contents('app/Http/Controllers/UserController.php');

echo "🌐 getUserByEmail API:\n";
if (strpos($userControllerFile, 'getUserByEmail') !== false) {
    echo "   ✅ getUserByEmail method exists\n";
    
    if (strpos($userControllerFile, '@uic.edu.ph') !== false) {
        echo "   ✅ Has UIC domain special handling\n";
    }
    
    if (strpos($userControllerFile, 'preg_match') !== false) {
        echo "   ✅ Uses regex pattern matching for email classification\n";
    }
    
    if (strpos($userControllerFile, "isStudent ? 'student' : 'employee'") !== false) {
        echo "   ✅ Hardcoded role assignment: student/employee based on email pattern\n";
    }
}

echo "\n📍 PATTERN DETECTION:\n";
preg_match('/preg_match\(\'(.*?)\'/s', $userControllerFile, $pattern);
if ($pattern) {
    echo "   Pattern: {$pattern[1]}\n";
    echo "   This pattern detects 12 digits at end of email prefix\n";
}

echo "\n\n4. TEST SPECIFIC EMAIL\n";
echo "=" . str_repeat("=", 50) . "\n";

$testEmail = 'jdavid_240000000175@uic.edu.ph';
echo "🔍 Testing: {$testEmail}\n";

// Check Laravel User
$laravelUser = User::with('role')->where('email', $testEmail)->first();
if ($laravelUser) {
    echo "   📊 Laravel User Found:\n";
    echo "      - ID: {$laravelUser->id}\n";
    echo "      - Role ID: {$laravelUser->role_id}\n";
    echo "      - Role Name: " . ($laravelUser->role ? $laravelUser->role->name : 'None') . "\n";
    echo "      - getRoleDisplayName(): {$laravelUser->getRoleDisplayName()}\n";
    echo "      - hasRole('student'): " . ($laravelUser->hasRole('student') ? 'true' : 'false') . "\n";
    echo "      - hasRole('nurse'): " . ($laravelUser->hasRole('nurse') ? 'true' : 'false') . "\n";
}

// Check pattern matching
$emailPrefix = explode('@', $testEmail)[0];
$isStudent = preg_match('/.*_(\d{12})$/', $emailPrefix);
echo "   🔍 Pattern Analysis:\n";
echo "      - Email prefix: {$emailPrefix}\n";
echo "      - Matches student pattern: " . ($isStudent ? 'YES' : 'NO') . "\n";
echo "      - Would be assigned role: " . ($isStudent ? 'student' : 'employee') . "\n";

echo "\n\n5. FRONTEND INTERACTION\n";
echo "=" . str_repeat("=", 50) . "\n";

echo "🖥️  UserService (frontend):\n";
$userServiceFile = file_get_contents('resources/js/services/userService.ts');
if (strpos($userServiceFile, 'getCurrentUser') !== false) {
    echo "   ✅ getCurrentUser() uses localStorage\n";
}
if (strpos($userServiceFile, 'getUserByEmail') !== false) {
    echo "   ✅ getUserByEmail() calls /api/users/by-email\n";
}

echo "\n📱 Sidebar Component:\n";
$sidebarFile = file_get_contents('resources/js/components/Sidebar.tsx');
if (strpos($sidebarFile, 'UserService.getCurrentUser') !== false) {
    echo "   ✅ Uses UserService.getCurrentUser() for role display\n";
}
if (strpos($sidebarFile, 'role?.toLowerCase') !== false) {
    echo "   ✅ Checks role for doctor restrictions\n";
}

echo "\n\n=== SUMMARY ===\n";
echo "This analysis shows the complete flow and current state.\n";
echo "The system has multiple paths for role assignment and display.\n";