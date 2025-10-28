<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;

echo "=== TESTING USERINCONTROLLER API ===\n";

$controller = new UserController();

// Create a mock request
$request = new Request();
$request->merge(['email' => 'jdavid_240000000175@uic.edu.ph']);

try {
    $response = $controller->getUserByEmail($request);
    $content = $response->getContent();
    $data = json_decode($content, true);
    
    echo "API Response:\n";
    echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    
    if (isset($data['user']['role'])) {
        echo "\n✅ Role returned: " . $data['user']['role'] . "\n";
        echo "✅ is_student: " . ($data['user']['is_student'] ? 'true' : 'false') . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}