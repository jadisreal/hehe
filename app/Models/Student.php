<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'course',
        'student_id',
        'year_level',
        'section'
    ];

    /**
     * Get the patient record associated with the student.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
