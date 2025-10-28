<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\BranchRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\StudentProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication routes
Route::post('/auth/google', [GoogleAuthController::class, 'authenticate']);

// User management routes for MSSQL integration
Route::post('/users/by-email', [UserController::class, 'getUserByEmail']);
Route::get('/users/{id}/branch', [UserController::class, 'getUserBranch']);
Route::get('/users', [UserController::class, 'getAllUsers']);
Route::post('/users', [UserController::class, 'createUser']);
Route::put('/users/{id}', [UserController::class, 'updateUser']);
Route::delete('/users/{id}', [UserController::class, 'deleteUser']);

// Branch management routes for MSSQL integration
Route::get('/branches', [UserController::class, 'getAllBranches']);
Route::get('/branches/{id}', [UserController::class, 'getBranchById']);
Route::get('/branches/other/{userBranchId}', [UserController::class, 'getOtherBranches']);
Route::get('/branches/{id}/inventory', [UserController::class, 'getBranchInventory']);

// Medicine management routes for MSSQL integration
Route::get('/medicines', [UserController::class, 'getAllMedicines']);
Route::post('/medicines', [UserController::class, 'createMedicine']);
Route::post('/medicines/delete', [UserController::class, 'deleteMedicine']);
Route::post('/medicine-stock-in', [UserController::class, 'addMedicineStockIn']);
Route::get('/medicines/stock-out', [MedicineController::class, 'stockOut']);
Route::get('/medicine-stock-records/{medicineId}/{branchId}', [UserController::class, 'getAvailableStockRecords']);
Route::post('/medicine-dispense', [UserController::class, 'dispenseMedicine']);
Route::post('/dispense', [UserController::class, 'dispenseMedicine']);
Route::post('/dispense-v2', [UserController::class, 'dispenseMedicineV2']);

// History log routes for MSSQL integration
Route::get('/history-log', [UserController::class, 'getHistoryLog']);
Route::post('/history-log', [UserController::class, 'addHistoryLog']);

// Dashboard routes for MSSQL integration
Route::get('/branches/{branchId}/low-stock', [UserController::class, 'getLowStockMedicines']);
Route::get('/branches/{branchId}/expiring-soon', [UserController::class, 'getSoonToExpireMedicines']);
// Archived medicines routes
Route::get('/branches/{branchId}/archived', [UserController::class, 'getArchivedMedicines']);
Route::post('/branches/{branchId}/archived/{archivedId}/restore', [UserController::class, 'restoreArchivedMedicine']);
Route::delete('/branches/{branchId}/archived/{archivedId}', [UserController::class, 'deleteArchivedMedicine']);
// Endpoint to archive a medicine (move to medicine_archived)
Route::post('/medicines/archive', [UserController::class, 'archiveMedicine']);

// Branch requests and notifications
Route::post('/branch-requests', [BranchRequestController::class, 'store']);
Route::get('/branches/{branchId}/branch-requests', [BranchRequestController::class, 'index']);
Route::post('/branch-requests/{requestId}/approve', [BranchRequestController::class, 'approve']);
Route::post('/branch-requests/{requestId}/reject', [BranchRequestController::class, 'reject']);
// History (approved/rejected) for branch requests involving a branch
Route::get('/branches/{branchId}/branch-requests/history', [BranchRequestController::class, 'history']);

// Notifications endpoints
Route::post('/notifications', [NotificationController::class, 'store']);
Route::get('/branches/{branchId}/notifications', [NotificationController::class, 'index']);
Route::post('/branches/{branchId}/notifications/mark-read', [NotificationController::class, 'markRead']);

// Dashboard endpoints
Route::prefix('dashboard')->group(function () {
    Route::get('/stats', [\App\Http\Controllers\DashboardController::class, 'getStats']);
    Route::get('/recent-activity', [\App\Http\Controllers\DashboardController::class, 'getRecentActivity']);
    Route::get('/pending-appointments', [\App\Http\Controllers\DashboardController::class, 'getPendingAppointments']);
    Route::get('/todays-consultations', [\App\Http\Controllers\DashboardController::class, 'getTodaysConsultations']);
    Route::get('/data', [\App\Http\Controllers\DashboardController::class, 'getDashboardData']);
});

// Patient API routes
Route::prefix('patients')->group(function () {
    Route::get('/', [\App\Http\Controllers\PatientController::class, 'apiIndex']);
    Route::post('/', [\App\Http\Controllers\PatientController::class, 'apiStore']);
    Route::get('/{id}', [\App\Http\Controllers\PatientController::class, 'apiShow']);
    Route::put('/{id}', [\App\Http\Controllers\PatientController::class, 'apiUpdate']);
    Route::delete('/{id}', [\App\Http\Controllers\PatientController::class, 'apiDestroy']);
    
    // Additional patient-related endpoints
    Route::get('/{id}/medical-history', [\App\Http\Controllers\PatientController::class, 'getMedicalHistory']);
    Route::get('/{id}/consultations', [\App\Http\Controllers\PatientController::class, 'getConsultations']);
    Route::get('/{id}/conditions', [\App\Http\Controllers\PatientController::class, 'getConditions']);
    Route::get('/{id}/allergies', [\App\Http\Controllers\PatientController::class, 'getAllergies']);
    Route::get('/{id}/immunizations', [\App\Http\Controllers\PatientController::class, 'getImmunizations']);
});

// Nurse API routes (for students)
Route::prefix('students')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\StudentController::class, 'index']);
    Route::get('/{id}', [\App\Http\Controllers\Api\StudentController::class, 'show']);
});

// Student self-service API routes
Route::prefix('student')->group(function () {
    Route::get('/patient-id', [\App\Http\Controllers\Api\StudentController::class, 'getPatientId']);
    Route::put('/profile/{id}', [\App\Http\Controllers\Api\StudentController::class, 'updateProfile']);
});

// Employee API routes
Route::prefix('employees')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\EmployeeController::class, 'index']);
    Route::get('/{id}', [\App\Http\Controllers\Api\EmployeeController::class, 'show']);
});

// Consultation API routes
Route::prefix('consultations')->group(function () {
    Route::get('/patient/{patientId}', [\App\Http\Controllers\ConsultationController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\ConsultationController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\ConsultationController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\ConsultationController::class, 'update']);
    Route::put('/{id}/doctor-notes', [\App\Http\Controllers\ConsultationController::class, 'addDoctorNotes']);
    Route::delete('/{id}', [\App\Http\Controllers\ConsultationController::class, 'destroy']);
});

// Remark API routes
Route::prefix('remarks')->group(function () {
    Route::get('/patient/{patientId}', [\App\Http\Controllers\RemarkController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\RemarkController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\RemarkController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\RemarkController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\RemarkController::class, 'destroy']);
});

// Student profile routes (session-based authentication)
Route::middleware('auth')->group(function () {
    Route::get('/student/profile', [StudentProfileController::class, 'getProfile']);
    Route::post('/student/profile', [StudentProfileController::class, 'saveProfile']);
});

// The default user route can stay if you need it
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $user = $request->user();
    if ($user) {
        $user->load('role'); // Load the role relationship
    }
    return $user;
});
