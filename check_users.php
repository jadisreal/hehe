<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->boot();

use App\Models\User;

echo "=== CURRENT USERS IN DATABASE ===\n";

$users = User::all();

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Email: {$user->email}\n";
    echo "Name: {$user->name}\n";
    echo "Role ID: " . ($user->role_id ?? 'null') . "\n";
    if ($user->role) {
        echo "Role: {$user->role->name}\n";
    }
    echo "Created: {$user->created_at}\n";
    echo "Updated: {$user->updated_at}\n";
    echo "---\n";
}