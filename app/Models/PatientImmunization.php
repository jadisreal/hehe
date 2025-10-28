<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientImmunization extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'vaccine_name',
        'administration_date',
        'dose_number',
        'provider',
        'notes'
    ];

    /**
     * Get the patient that owns the immunization.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
