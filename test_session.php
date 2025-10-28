<?php

use Illuminate\Support\Facades\Auth;

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Session Test ===\n";

// Check if user is currently authenticated
if (Auth::check()) {
    $user = Auth::user();
    echo "✅ User is authenticated: " . $user->name . " (" . $user->email . ")\n";
    echo "User role: " . $user->getRoleDisplayName() . "\n";
} else {
    echo "❌ No user is currently authenticated\n";
}

echo "\n=== Instructions ===\n";
echo "1. Open http://localhost:8000 in browser\n";
echo "2. Login via Google OAuth\n";
echo "3. Check console for session cookie debugging\n";
echo "4. Try to save student profile\n";