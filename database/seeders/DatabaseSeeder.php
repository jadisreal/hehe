<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // First seed roles if they don't exist
        $this->call([
            RoleSeeder::class,
        ]);

        // Create or update test users with proper roles
        $nurseRole = Role::where('name', 'nurse')->first();
        $doctorRole = Role::where('name', 'doctor')->first();
        $studentRole = Role::where('name', 'student')->first();

        // Create admin/nurse user
        User::updateOrCreate(
            ['email' => 'tieryder88@gmail.com'],
            [
                'name' => 'Admin User',
                'email' => 'tieryder88@gmail.com',
                'role_id' => $nurseRole->id,
            ]
        );

        // Create test nurse user
        User::updateOrCreate(
            ['email' => 'jdavid_240000000175@uic.edu.ph'],
            [
                'name' => 'Jad David Test',
                'email' => 'jdavid_240000000175@uic.edu.ph',
                'role_id' => $nurseRole->id,
            ]
        );

        // Create test doctor user
        User::updateOrCreate(
            ['email' => 'sampon_230000001231@uic.edu.ph'],
            [
                'name' => 'Dr. Sampon Test',
                'email' => 'sampon_230000001231@uic.edu.ph',
                'role_id' => $doctorRole->id,
            ]
        );

        // Create a few test student users
        User::updateOrCreate(
            ['email' => 'student1_240000000001@uic.edu.ph'],
            [
                'name' => 'Test Student One',
                'email' => 'student1_240000000001@uic.edu.ph',
                'role_id' => $studentRole->id,
            ]
        );

        User::updateOrCreate(
            ['email' => 'student2_240000000002@uic.edu.ph'],
            [
                'name' => 'Test Student Two',
                'email' => 'student2_240000000002@uic.edu.ph',
                'role_id' => $studentRole->id,
            ]
        );

        // Run the patient seeder
        $this->call([
            PatientSeeder::class,
        ]);
    }
}
