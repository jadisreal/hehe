<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$allowedRoles): Response
    {
        $user = Auth::user();

        // If user is not authenticated, let the auth middleware handle it
        if (!$user) {
            return $next($request);
        }

        // If no role specified (default nurse), allow access
        if (!$user->role) {
            // For backward compatibility, users without roles are treated as nurses
            if (in_array('nurse', $allowedRoles)) {
                return $next($request);
            }
        } else {
            // Check if user's role is in the allowed roles
            if (in_array($user->role->name, $allowedRoles)) {
                return $next($request);
            }
        }

        // User doesn't have permission, return access denied page
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Access denied. You do not have permission to access this resource.'], 403);
        }

        return Inertia::render('AccessDenied', [
            'message' => 'You do not have permission to access this page.',
            'userRole' => $user->role ? $user->role->name : 'nurse'
        ]);
    }
}
