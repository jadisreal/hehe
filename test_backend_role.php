<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

$email = 'jdavid_240000000175@uic.edu.ph';

echo "=== TESTING BACKEND API RESPONSE ===\n";

$user = User::with('role')->where('email', $email)->first();

if (!$user) {
    echo "❌ User not found\n";
    exit(1);
}

echo "👤 User: {$user->name}\n";
echo "📧 Email: {$user->email}\n";
echo "🎭 Role ID: {$user->role_id}\n";
echo "🎭 Role Name: {$user->role->name}\n";
echo "📺 Display Name: {$user->getRoleDisplayName()}\n";

echo "\n=== SIMULATING API RESPONSE ===\n";
$apiResponse = [
    'status' => 'success',
    'user' => [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->getRoleDisplayName(),
    ]
];

echo json_encode($apiResponse, JSON_PRETTY_PRINT) . "\n";

echo "\n=== CONCLUSION ===\n";
echo "The backend is returning: " . $user->getRoleDisplayName() . "\n";
echo "If frontend shows 'Student', it's a localStorage caching issue.\n";