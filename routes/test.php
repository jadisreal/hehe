<?php
// Test route to manually check employee data retrieval

use App\Http\Controllers\Api\EmployeeController;
use Illuminate\Support\Facades\Route;

// Test route to check employee data
Route::get('/test/employee/{id}', function($id) {
    $controller = new EmployeeController();
    return $controller->show($id);
});

// Test route to check all employees
Route::get('/test/employees', function() {
    $controller = new EmployeeController();
    return $controller->index();
});