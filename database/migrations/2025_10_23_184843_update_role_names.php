<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update 'student' role to 'nurse'
        Role::where('name', 'student')->update(['name' => 'nurse']);
        
        // Remove old 'nurse' role with level 3
        Role::where('name', 'nurse')->where('level', 3)->delete();
        
        echo "Updated role names: student -> nurse, removed old level 3 nurse\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse: Change 'nurse' back to 'student' 
        Role::where('name', 'nurse')->where('level', 1)->update(['name' => 'student']);
        
        // Recreate old level 3 nurse role
        Role::create([
            'name' => 'nurse',
            'description' => 'Nurse role with highest permissions',
            'level' => 3
        ]);
        
        echo "Reverted role names: nurse -> student, recreated level 3 nurse\n";
    }
};
