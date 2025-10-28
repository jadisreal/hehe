<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientAllergy extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'allergen',
        'reaction',
        'severity',
        'diagnosis_date',
        'notes'
    ];

    /**
     * Get the patient that owns the allergy.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
