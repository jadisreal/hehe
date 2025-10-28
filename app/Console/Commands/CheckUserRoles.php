<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;

class CheckUserRoles extends Command
{
    protected $signature = 'check:user-roles';
    protected $description = 'Check user roles in the database';

    public function handle()
    {
        $this->info('=== ROLES IN DATABASE ===');
        $roles = Role::all();
        foreach ($roles as $role) {
            $this->line("ID: {$role->id}, Name: {$role->name}, Level: {$role->level}");
        }

        $this->info('');
        $this->info('=== USERS WITH ROLES ===');
        $users = User::with('role')->get();
        foreach ($users as $user) {
            $roleName = $user->role ? $user->role->name : 'no role';
            $roleId = $user->role_id ?? 'null';
            $this->line("Email: {$user->email} -> Role ID: {$roleId} ({$roleName})");
        }

        $this->info('');
        $this->info('=== CHECKING SPECIFIC EMAIL ===');
        $targetUser = User::where('email', 'sampon_230000001231@uic.edu.ph')->with('role')->first();
        if ($targetUser) {
            $this->line("Found user: {$targetUser->email}");
            $this->line("Role ID: " . ($targetUser->role_id ?? 'null'));
            $this->line("Role Name: " . ($targetUser->role ? $targetUser->role->name : 'no role'));
            $this->line("User display role: " . $targetUser->getRoleDisplayName());
        } else {
            $this->line("User not found in database");
        }

        return 0;
    }
}