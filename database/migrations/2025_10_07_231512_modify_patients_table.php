<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->integer('age')->after('name');
            $table->string('gender')->after('age');
            $table->text('address')->after('gender');
            $table->string('contact')->after('address');
            $table->date('last_visit')->nullable()->after('contact');
            $table->string('patient_type')->after('last_visit'); // 'student' or 'employee'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'name',
                'age',
                'gender',
                'address',
                'contact',
                'last_visit',
                'patient_type'
            ]);
        });
    }
};
