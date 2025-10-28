<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert default roles
        DB::table('roles')->insert([
            [
                'name' => 'nurse',
                'description' => 'Nurse users with full access to all features',
                'level' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'doctor',
                'description' => 'Medical doctors with restricted access (no inventory/reports)',
                'level' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'student',
                'description' => 'Student users with restricted access (level 3 restrictions)',
                'level' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'employee',
                'description' => 'Employee users with restricted access (level 3 restrictions)',
                'level' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')->whereIn('name', ['nurse', 'doctor', 'student', 'employee'])->delete();
    }
};