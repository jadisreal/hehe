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
        Schema::create('patient_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_initial')->nullable();
            $table->string('suffix')->nullable();
            $table->date('date_of_birth');
            $table->string('nationality');
            $table->string('civil_status');
            $table->text('address');
            $table->string('guardian_name')->nullable();
            $table->string('guardian_contact')->nullable();
            $table->string('blood_type')->nullable();
            $table->string('height')->nullable();
            $table->string('religion')->nullable();
            $table->string('eye_color')->nullable();
            $table->text('disabilities')->nullable();
            $table->text('genetic_conditions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_profiles');
    }
};
