<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 
        'age', 
        'gender', 
        'address', 
        'contact', 
        'last_visit', 
        'patient_type'
    ];

    /**
     * Get the patient's profile information.
     */
    public function profile()
    {
        return $this->hasOne(PatientProfile::class);
    }

    /**
     * Get the medical histories for the patient.
     */
    public function medicalHistories()
    {
        return $this->hasMany(MedicalHistory::class);
    }

    /**
     * Get the consultations for the patient.
     */
    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    /**
     * Get the remarks for the patient.
     */
    public function remarks()
    {
        return $this->hasMany(Remark::class);
    }

    /**
     * Get the chronic conditions for the patient.
     */
    public function chronicConditions()
    {
        return $this->hasMany(PatientCondition::class);
    }

    /**
     * Get the allergies for the patient.
     */
    public function allergies()
    {
        return $this->hasMany(PatientAllergy::class);
    }

    /**
     * Get the immunizations for the patient.
     */
    public function immunizations()
    {
        return $this->hasMany(PatientImmunization::class);
    }

    /**
     * Get the student record associated with the patient.
     */
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    /**
     * Get the employee record associated with the patient.
     */
    public function employee()
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * Determine if the patient is a student.
     */
    public function isStudent()
    {
        return $this->patient_type === 'student';
    }

    /**
     * Determine if the patient is an employee.
     */
    public function isEmployee()
    {
        return $this->patient_type === 'employee';
    }
}
