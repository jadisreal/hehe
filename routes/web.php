<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Consultation;
use App\Models\Patient;

// Include test routes
require __DIR__ . '/test.php';

// Debug routes
Route::get('/debug/consultation/{id}', function($id) {
    return [
        'requested_id' => $id,
        'parsed_id' => (int)$id,
        'exists' => Patient::where('id', $id)->exists(),
        'patient' => Patient::find($id)
    ];
});

Route::post('/debug/create-consultation', function(Request $request) {
    $patientId = $request->input('patient_id');
    $date = $request->input('date', now()->toDateString());
    $notes = $request->input('notes', 'Debug consultation');
    $type = $request->input('type', 'walk-in');
    
    try {
        // Check if patient exists
        $patient = Patient::find($patientId);
        if (!$patient) {
            return response()->json([
                'success' => false,
                'error' => 'Patient not found',
                'patient_id' => $patientId
            ], 404);
        }
        
        // Create the consultation
        $consultation = Consultation::create([
            'patient_id' => $patientId,
            'date' => $date,
            'notes' => $notes,
            'type' => $type
        ]);
        
        return response()->json([
            'success' => true,
            'consultation' => $consultation,
            'patient' => $patient
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// --- Public Routes ---
Route::get('/', function () {
    return Inertia::render('Login');
})->name('login');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/patients-list', function () {
    return Inertia::render('PatientsList');
})->name('patients.list');

Route::get('/search/student', fn() => Inertia::render('Search/Student'));
Route::get('/search/employee', fn() => Inertia::render('Search/Employee'));

Route::get('/inventory/dashboard', fn() => Inertia::render('Inventory/InventDashboard'));
Route::get('/inventory/stocks', function() {
    return Inertia::render('Inventory/Stocks');
})->name('inventory.stocks');

Route::get('/inventory/branchinventory', function () {
    return Inertia::render('Inventory/BranchInventory');
});

Route::get('/inventory/branchinventory/{branchId}', function ($branchId) {
    return Inertia::render('Inventory/BranchInventory', [
        'branchId' => (int) $branchId
    ]);
});

Route::get('/inventory/otherinventorystocks/{branchId}', function ($branchId) {
    return Inertia::render('Inventory/OtherInventoryStocks', [
        'branchId' => (int) $branchId
    ]);
});

Route::get('/inventory/history', fn() => Inertia::render('Inventory/History'));
Route::get('/Reports', fn() => Inertia::render('Reports'));
Route::get('/Print', fn() => Inertia::render('Print'));
Route::get('/Chat', fn() => Inertia::render('Chat'));

Route::get('/HSMS/Consultation/Inpatient', fn() => Inertia::render('HSMS/Consultation/Inpatient'));
Route::get('/HSMS/Consultation/Outpatient', fn() => Inertia::render('HSMS/Consultation/Outpatient'));
Route::get('/HSMS/Consultation/Emergency', fn() => Inertia::render('HSMS/Consultation/Emergency'));

Route::get('/consultation/student/{id}', fn($id) => Inertia::render('Consultation/StudentProfile', ['id' => $id]));
Route::get('/consultation/employee/{id}', fn($id) => Inertia::render('Consultation/EmployeeProfile', ['id' => $id]));
Route::get('/consultation/student/{id}/create', fn($id) => Inertia::render('Consultation/CreateConsultation', ['id' => $id]));
Route::get('/consultation/employee/{id}/create', fn($id) => Inertia::render('Consultation/CreateConsultation', ['id' => $id]));
Route::get('/consultation/student/{id}/create/walk-in', fn($id) => Inertia::render('Consultation/WalkIn', ['id' => $id]));
Route::get('/consultation/employee/{id}/create/walk-in', fn($id) => Inertia::render('Consultation/WalkIn', ['id' => $id]));
Route::get('/consultation/student/{id}/create/scheduled', fn($id) => Inertia::render('Consultation/Scheduled', ['id' => $id]));
Route::get('/consultation/employee/{id}/create/scheduled', fn($id) => Inertia::render('Consultation/Scheduled', ['id' => $id]));

Route::get('/test', fn() => Inertia::render('Test'));
Route::get('/About', fn() => Inertia::render('About'));
Route::get('/Notification', fn() => Inertia::render('Notification'));
Route::get('/pending-appointments', fn() => Inertia::render('PendingAppointments'));
Route::get('/todays-consultations', fn() => Inertia::render('TodaysConsultations'));

// Student self-service routes
Route::get('/student/dashboard', fn() => Inertia::render('StudentDashboard'));
Route::get('/student/my-profile', fn() => Inertia::render('StudentMyProfile'));
Route::get('/student/profile-dashboard', fn() => Inertia::render('StudentProfileDashboard'));

// Google OAuth callback (must match Google Console URI)
Route::get('/auth', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'handleGoogleCallback']);

// Debug routes (only in local environment)
if (app()->environment('local')) {
    require __DIR__ . '/debug_routes.php';
}

// --- Protected Routes ---
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', function () {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');
    
    // Patient routes
    Route::resource('patients', \App\Http\Controllers\PatientController::class);
});