<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consultation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'date',
        'notes',
        'type',
        'status',
        'scheduled_at',
        'reason',
        'refer_to_doctor',
        'doctor_notes',
        'blood_pressure',
        'pulse',
        'temperature',
        'weight',
        'last_menstrual_period'
    ];

    /**
     * Get the patient that owns the consultation.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
