<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the role that belongs to the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Check if user is a nurse
     */
    public function isNurse(): bool
    {
        return $this->hasRole('nurse');
    }

    /**
     * Check if user is a doctor
     */
    public function isDoctor(): bool
    {
        return $this->hasRole('doctor');
    }

    /**
     * Check if user can access inventory pages
     */
    public function canAccessInventory(): bool
    {
        return $this->role ? $this->role->canAccessInventory() : true;
    }

    /**
     * Check if user can access reports pages
     */
    public function canAccessReports(): bool
    {
        return $this->role ? $this->role->canAccessReports() : true;
    }

    /**
     * Get user's role display name
     */
    public function getRoleDisplayName(): string
    {
        if (!$this->role) {
            return 'Student';
        }
        
        return ucfirst($this->role->name);
    }
}
