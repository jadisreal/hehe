<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalHistory extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'condition',
        'diagnosed'
    ];

    /**
     * Get the patient that owns the medical history record.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
