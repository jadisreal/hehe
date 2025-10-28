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
        Schema::table('consultations', function (Blueprint $table) {
            $table->string('blood_pressure')->nullable();
            $table->string('pulse')->nullable();
            $table->string('temperature')->nullable();
            $table->string('weight')->nullable();
            $table->string('last_menstrual_period')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn([
                'blood_pressure',
                'pulse',
                'temperature',
                'weight',
                'last_menstrual_period'
            ]);
        });
    }
};
