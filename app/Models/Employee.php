<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'department',
        'position',
        'employee_id',
        'hire_date'
    ];

    /**
     * Get the patient record associated with the employee.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
