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
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            
            // Basic Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_initial', 1)->nullable();
            $table->string('suffix', 10)->nullable();
            $table->date('date_of_birth');
            $table->string('nationality')->nullable();
            $table->enum('civil_status', ['Single', 'Married', 'Divorced', 'Widowed'])->nullable();
            $table->text('address')->nullable();
            
            // Guardian Information
            $table->string('guardian_name')->nullable();
            $table->string('guardian_contact');
            
            // Physical Information
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->string('height', 10)->nullable();
            $table->string('religion')->nullable();
            $table->enum('eye_color', ['Brown', 'Black', 'Blue', 'Green', 'Gray', 'Hazel'])->nullable();
            
            // Medical Information
            $table->text('chronic_conditions')->nullable();
            $table->text('known_allergies')->nullable();
            $table->text('disabilities')->nullable();
            $table->text('immunization_history')->nullable();
            $table->text('genetic_conditions')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
