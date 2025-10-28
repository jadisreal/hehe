<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientCondition extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'condition_name',
        'diagnosis_date',
        'status',
        'notes'
    ];

    /**
     * Get the patient that owns the condition.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
