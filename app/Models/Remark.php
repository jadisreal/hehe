<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Remark extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'date',
        'note'
    ];

    /**
     * Get the patient that owns the remark.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
