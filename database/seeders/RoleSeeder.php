<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the four roles - nurse, student (default), employee, and doctor
        $nurseRole = Role::firstOrCreate(
            ['name' => 'nurse'],
            [
                'description' => 'Nurse users with full access to all features',
                'level' => 1
            ]
        );

        $studentRole = Role::firstOrCreate(
            ['name' => 'student'],
            [
                'description' => 'Student users with restricted access (level 3 restrictions)',
                'level' => 3
            ]
        );

        $employeeRole = Role::firstOrCreate(
            ['name' => 'employee'],
            [
                'description' => 'Employee users with restricted access (level 3 restrictions)',
                'level' => 3
            ]
        );

        $doctorRole = Role::firstOrCreate(
            ['name' => 'doctor'],
            [
                'description' => 'Medical doctors with restricted access (no inventory/reports)',
                'level' => 2
            ]
        );

        // Remove old roles that might conflict
        Role::where('name', 'nurse')->where('level', 3)->delete();

        // Hardcoded email assignments
        $doctorEmails = [
            'sampon_230000001231@uic.edu.ph'
        ];

        // Assign roles based on email
        foreach ($doctorEmails as $email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->update(['role_id' => $doctorRole->id]);
                $this->command->info("Assigned doctor role to: {$email}");
            } else {
                $this->command->warn("User not found for email: {$email}");
            }
        }

        // Assign student role to all users without roles (new default behavior)
        User::whereNull('role_id')->update(['role_id' => $studentRole->id]);
        
        $this->command->info('Roles seeded successfully!');
        $this->command->info('- Nurse role: ID ' . $nurseRole->id);
        $this->command->info('- Student role (default): ID ' . $studentRole->id);
        $this->command->info('- Employee role: ID ' . $employeeRole->id);
        $this->command->info('- Doctor role: ID ' . $doctorRole->id);
    }
}
