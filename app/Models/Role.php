<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'level'
    ];

    /**
     * Get the users that belong to this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Check if this role is nurse (highest permissions)
     */
    public function isNurse(): bool
    {
        return $this->name === 'nurse';
    }

    /**
     * Check if this role is student
     */
    public function isStudent(): bool
    {
        return $this->name === 'student';
    }

    /**
     * Check if this role is employee
     */
    public function isEmployee(): bool
    {
        return $this->name === 'employee';
    }

    /**
     * Check if this role is doctor
     */
    public function isDoctor(): bool
    {
        return $this->name === 'doctor';
    }

    /**
     * Check if this role can access inventory pages
     * Only Nurse and Employee have full permissions, Student is restricted
     */
    public function canAccessInventory(): bool
    {
        return in_array($this->name, ['nurse', 'employee']);
    }

    /**
     * Check if this role can access search/reports pages
     * Only Nurse and Employee have full permissions, Student is restricted
     */
    public function canAccessReports(): bool
    {
        return in_array($this->name, ['nurse', 'employee']);
    }
}
