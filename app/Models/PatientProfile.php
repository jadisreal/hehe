<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientProfile extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'last_name',
        'first_name',
        'middle_initial',
        'suffix',
        'date_of_birth',
        'nationality',
        'civil_status',
        'address',
        'guardian_name',
        'guardian_contact',
        'blood_type',
        'height',
        'religion',
        'eye_color',
        'disabilities',
        'genetic_conditions'
    ];

    /**
     * Get the patient that owns the profile.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
