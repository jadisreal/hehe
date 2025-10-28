<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\User;

class UpdateRoles extends Command
{
    protected $signature = 'roles:update';
    protected $description = 'Update roles - create nurse role and assign to users';

    public function handle()
    {
        $this->info('Starting role update...');

        // Create nurse role
        $nurseRole = Role::firstOrCreate(
            ['name' => 'nurse'],
            ['level' => 1]
        );
        $this->info("Nurse role created/found: ID {$nurseRole->id}");

        // Check if doctor role exists
        $doctorRole = Role::where('name', 'doctor')->first();
        if ($doctorRole) {
            $this->info("Doctor role exists: ID {$doctorRole->id}");
        } else {
            $this->error("Doctor role not found!");
        }

        // Update users without role to nurse
        $usersUpdated = User::whereNull('role_id')->update(['role_id' => $nurseRole->id]);
        $this->info("Users updated to nurse role: {$usersUpdated}");

        // Show current roles
        $this->info('Current roles:');
        $roles = Role::all();
        foreach ($roles as $role) {
            $userCount = User::where('role_id', $role->id)->count();
            $this->line("- {$role->name} (ID: {$role->id}, Level: {$role->level}) - {$userCount} users");
        }

        // Show users without roles
        $usersWithoutRole = User::whereNull('role_id')->count();
        $this->line("- Users without role: {$usersWithoutRole}");

        $this->info('Role update completed!');
    }
}