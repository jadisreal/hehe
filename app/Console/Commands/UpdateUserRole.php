<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class UpdateUserRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:set-nurse {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set a user role to nurse';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User not found with email: {$email}");
            return 1;
        }
        
        $this->info("Current user: {$user->name} ({$user->email})");
        $this->info("Current role ID: {$user->role_id}");
        
        // Set to nurse role (ID 7)
        $user->role_id = 7;
        $user->save();
        
        $this->info("User role updated to nurse (role_id = 7)");
        
        // Verify
        $user->refresh();
        $user->load('role');
        $this->info("New role: {$user->role->name} (Level: {$user->role->level})");
        
        return 0;
    }
}
