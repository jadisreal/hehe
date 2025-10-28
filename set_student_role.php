<?php

use Illuminate\Support\Facades\DB;

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Setting Student Role for Testing ===\n";

// Set Jad David to Student role (role_id = 3)
$result = DB::table('users')
    ->where('email', 'jdavid_240000000175@uic.edu.ph')
    ->update(['role_id' => 3]);

if ($result) {
    echo "✅ Updated Jad David to Student role\n";
    echo "🎯 Now test OAuth login - should redirect to /student/profile-dashboard\n";
} else {
    echo "❌ Failed to update role\n";
}