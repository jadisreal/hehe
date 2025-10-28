<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Employee;
use App\Models\MedicalHistory;
use App\Models\Patient;
use App\Models\PatientAllergy;
use App\Models\PatientCondition;
use App\Models\PatientImmunization;
use App\Models\PatientProfile;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Illuminate\Http\Response as IlluminateResponse;
use Illuminate\Support\Facades\Log;

class PatientController extends Controller
{
    /**
     * API methods for frontend integration
     */
    
    public function apiIndex()
    {
        $patients = Patient::with(['profile', 'student', 'employee'])->get();
        return Response::json($patients);
    }
    
    public function apiShow($id)
    {
        $patient = Patient::with([
            'profile', 
            'student', 
            'employee', 
            'medicalHistories', 
            'consultations',
            'chronicConditions',
            'allergies',
            'immunizations'
        ])->findOrFail($id);
        
        return response()->json($patient);
    }
    
    public function apiStore(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0',
            'gender' => 'required|string',
            'address' => 'required|string',
            'contact' => 'required|string|max:255',
            'patient_type' => 'required|string|in:student,employee',
        ]);

        $patient = Patient::create($validatedData);
        
        // Create associated records based on request data
        if ($request->has('profile')) {
            PatientProfile::create(array_merge(
                $request->profile,
                ['patient_id' => $patient->id]
            ));
        }
        
        if ($request->patient_type === 'student' && $request->has('student')) {
            Student::create(array_merge(
                $request->student,
                ['patient_id' => $patient->id]
            ));
        } else if ($request->patient_type === 'employee' && $request->has('employee')) {
            Employee::create(array_merge(
                $request->employee,
                ['patient_id' => $patient->id]
            ));
        }
        
        return response()->json($patient, 201);
    }
    
    public function apiUpdate(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0',
            'gender' => 'required|string',
            'address' => 'required|string',
            'contact' => 'required|string|max:255',
        ]);
        
        $patient->update($validatedData);
        
        // Update related records
        if ($request->has('profile') && $patient->profile) {
            $patient->profile->update($request->profile);
        }
        
        if ($patient->patient_type === 'student' && $request->has('student') && $patient->student) {
            $patient->student->update($request->student);
        } else if ($patient->patient_type === 'employee' && $request->has('employee') && $patient->employee) {
            $patient->employee->update($request->employee);
        }
        
        return response()->json($patient);
    }
    
    public function apiDestroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        
        return response()->json(null, 204);
    }
    
    public function getMedicalHistory($id)
    {
        $history = MedicalHistory::where('patient_id', $id)->get();
        return response()->json($history);
    }
    
    public function getConsultations($id)
    {
        $consultations = Consultation::where('patient_id', $id)->get();
        return response()->json($consultations);
    }
    
    public function getConditions($id)
    {
        $conditions = PatientCondition::where('patient_id', $id)->get();
        return response()->json($conditions);
    }
    
    public function getAllergies($id)
    {
        $allergies = PatientAllergy::where('patient_id', $id)->get();
        return response()->json($allergies);
    }
    
    public function getImmunizations($id)
    {
        $immunizations = PatientImmunization::where('patient_id', $id)->get();
        return response()->json($immunizations);
    }
    
    /**
     * Web UI methods
     */
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patients = Patient::with(['profile', 'student', 'employee', 'medicalHistory', 'consultations'])->get();
        return Inertia::render('Patients/Index', [
            'patients' => $patients
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Patients/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0',
            'gender' => 'required|string',
            'address' => 'required|string',
            'contact' => 'required|string|max:255',
            'patient_type' => 'required|string|in:student,employee',
        ]);

        $patient = Patient::create($validatedData);

        // Create a patient profile
        PatientProfile::create([
            'patient_id' => $patient->id,
            'blood_type' => $request->blood_type,
            'height' => $request->height,
            'weight' => $request->weight,
            'emergency_contact' => $request->emergency_contact,
        ]);

        // Create student or employee record based on patient type
        if ($request->patient_type === 'student') {
            Student::create([
                'patient_id' => $patient->id,
                'student_id' => $request->student_id,
                'course' => $request->course,
                'year_level' => $request->year_level,
                'department' => $request->department,
            ]);
        } else if ($request->patient_type === 'employee') {
            Employee::create([
                'patient_id' => $patient->id,
                'employee_id' => $request->employee_id,
                'department' => $request->department,
                'position' => $request->position,
                'hire_date' => $request->hire_date,
            ]);
        }

        return Redirect::route('patients.index')->with('success', 'Patient created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $patient = Patient::with([
            'profile', 
            'student', 
            'employee', 
            'medicalHistory', 
            'consultations',
            'conditions',
            'allergies',
            'immunizations'
        ])->findOrFail($id);

        return Inertia::render('Patients/Show', [
            'patient' => $patient
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $patient = Patient::with([
            'profile', 
            'student', 
            'employee'
        ])->findOrFail($id);

        return Inertia::render('Patients/Edit', [
            'patient' => $patient
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0',
            'gender' => 'required|string',
            'address' => 'required|string',
            'contact' => 'required|string|max:255',
        ]);

        $patient = Patient::findOrFail($id);
        $patient->update($validatedData);

        // Update profile
        if ($patient->profile) {
            $patient->profile->update([
                'blood_type' => $request->blood_type,
                'height' => $request->height,
                'weight' => $request->weight,
                'emergency_contact' => $request->emergency_contact,
            ]);
        }

        // Update student or employee record
        if ($patient->patient_type === 'student' && $patient->student) {
            $patient->student->update([
                'student_id' => $request->student_id,
                'course' => $request->course,
                'year_level' => $request->year_level,
                'department' => $request->department,
            ]);
        } else if ($patient->patient_type === 'employee' && $patient->employee) {
            $patient->employee->update([
                'employee_id' => $request->employee_id,
                'department' => $request->department,
                'position' => $request->position,
                'hire_date' => $request->hire_date,
            ]);
        }

        return Redirect::route('patients.index')->with('success', 'Patient updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $patient = Patient::findOrFail($id);
        
        // Delete related records
        if ($patient->profile) {
            $patient->profile->delete();
        }
        
        if ($patient->student) {
            $patient->student->delete();
        }
        
        if ($patient->employee) {
            $patient->employee->delete();
        }
        
        $patient->delete();
        
        return Redirect::route('patients.index')->with('success', 'Patient deleted successfully');
    }

    /**
     * API: Get all students
     */
    public function apiGetStudents()
    {
        try {
            // Using query builder instead of model methods due to PHP IDE type errors
            $students = DB::table('patients')
                ->where('patient_type', 'student')
                ->join('patient_profiles', 'patients.id', '=', 'patient_profiles.patient_id')
                ->join('students', 'patients.id', '=', 'students.patient_id')
                ->leftJoin('medical_histories', 'patients.id', '=', 'medical_histories.patient_id')
                ->select('patients.*', 'patient_profiles.*', 'students.*', 'medical_histories.*')
                ->get();
            
            Log::info('Students fetched: ' . count($students));
            return Response::json($students);
        } catch (\Exception $e) {
            Log::error('Error fetching students: ' . $e->getMessage());
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * API: Get student by ID
     */
    public function apiGetStudentById(string $id)
    {
        try {
            // Using query builder instead of model methods due to PHP IDE type errors
            $student = DB::table('patients')
                ->where('patients.id', $id)
                ->where('patients.patient_type', 'student')
                ->join('patient_profiles', 'patients.id', '=', 'patient_profiles.patient_id')
                ->join('students', 'patients.id', '=', 'students.patient_id')
                ->leftJoin('medical_histories', 'patients.id', '=', 'medical_histories.patient_id')
                ->select('patients.*', 'patient_profiles.*', 'students.*', 'medical_histories.*')
                ->first();
            
            if (!$student) {
                Log::info('Student not found: ' . $id);
                return Response::json(['message' => 'Student not found'], 404);
            }
            
            Log::info('Student fetched: ' . $id);
            return Response::json($student);
        } catch (\Exception $e) {
            Log::error('Error fetching student: ' . $e->getMessage());
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * API: Get all employees
     */
    public function apiGetEmployees()
    {
        try {
            // Using query builder instead of model methods due to PHP IDE type errors
            $employees = DB::table('patients')
                ->where('patient_type', 'employee')
                ->join('patient_profiles', 'patients.id', '=', 'patient_profiles.patient_id')
                ->join('employees', 'patients.id', '=', 'employees.patient_id')
                ->leftJoin('medical_histories', 'patients.id', '=', 'medical_histories.patient_id')
                ->select('patients.*', 'patient_profiles.*', 'employees.*', 'medical_histories.*')
                ->get();
            
            Log::info('Employees fetched: ' . count($employees));
            return Response::json($employees);
        } catch (\Exception $e) {
            Log::error('Error fetching employees: ' . $e->getMessage());
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * API: Get employee by ID
     */
    public function apiGetEmployeeById(string $id)
    {
        try {
            // Using query builder instead of model methods due to PHP IDE type errors
            $employee = DB::table('patients')
                ->where('patients.id', $id)
                ->where('patients.patient_type', 'employee')
                ->join('patient_profiles', 'patients.id', '=', 'patient_profiles.patient_id')
                ->join('employees', 'patients.id', '=', 'employees.patient_id')
                ->leftJoin('medical_histories', 'patients.id', '=', 'medical_histories.patient_id')
                ->select('patients.*', 'patient_profiles.*', 'employees.*', 'medical_histories.*')
                ->first();
            
            if (!$employee) {
                Log::info('Employee not found: ' . $id);
                return Response::json(['message' => 'Employee not found'], 404);
            }
            
            Log::info('Employee fetched: ' . $id);
            return Response::json($employee);
        } catch (\Exception $e) {
            Log::error('Error fetching employee: ' . $e->getMessage());
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }
}
