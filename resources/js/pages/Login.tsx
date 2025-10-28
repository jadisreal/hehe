import { router } from '@inertiajs/react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import { UserService } from '../services/userService';

interface GoogleUser {
    email: string;
    name: string;
    picture?: string;
}

export default function Login() {
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!credentialResponse.credential) {
                throw new Error('Login failed: Credential not found.');
            }

            // Decode Google JWT token to get user info
            const googleUser: GoogleUser = jwtDecode(credentialResponse.credential);

            // Check if email is from UIC domain for logging purposes
            const isUicEmail = googleUser.email.endsWith('@uic.edu.ph');

            // Student detection: Check if email matches the student pattern
            const emailPrefix = googleUser.email.split('@')[0];
            const isStudent = isUicEmail && /.*_\d{12}$/.test(emailPrefix);

            console.log(isUicEmail ? `UIC ${isStudent ? 'student' : 'employee'} email detected` : 'Non-UIC email', googleUser.email);

            // Verify user access through MSSQL database
            const userData = await UserService.verifyUserAccess(googleUser.email);
            console.log('🔍 MSSQL userData:', userData);

            // Send authentication data to Laravel backend to get role assignment
            try {
                console.log('🚀 Calling Laravel backend for:', googleUser.email);

                // Get CSRF token from meta tag
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                const laravelResponse = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin', // Include cookies for session-based auth
                    body: JSON.stringify({
                        token: credentialResponse.credential,
                        userData: userData,
                    }),
                });

                console.log('📡 Laravel response status:', laravelResponse.status);

                if (laravelResponse.ok) {
                    const laravelData = await laravelResponse.json();
                    console.log('✅ Laravel data:', laravelData);

                    // Update user session with role information from Laravel
                    if (laravelData.status === 'success' && laravelData.user) {
                        const updatedUserData = {
                            ...userData,
                            role: laravelData.user.role,
                        };
                        console.log('🎯 Final userData with role:', updatedUserData);
                        // Store user session with Laravel role data
                        UserService.storeUserSession(updatedUserData);

                        // Use redirect URL from backend based on user role
                        const redirectUrl = laravelData.redirectUrl || '/dashboard';
                        console.log('🚀 Redirecting to:', redirectUrl);
                        router.visit(redirectUrl);
                        return;
                    } else {
                        console.warn('⚠️ Laravel success but no user data, using fallback');
                        // Fallback to userData without Laravel role
                        UserService.storeUserSession(userData);
                    }
                } else {
                    const errorText = await laravelResponse.text();
                    console.error('❌ Laravel authentication failed:', laravelResponse.status, errorText);
                    // Fallback to userData without Laravel role
                    UserService.storeUserSession(userData);
                }
            } catch (sessionError) {
                console.error('💥 Laravel session creation failed:', sessionError);
                // Fallback to userData without Laravel role
                UserService.storeUserSession(userData);
            }

            // Navigate to dashboard on successful authentication (fallback)
            router.visit('/dashboard');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            console.error('Login error:', err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    // State to handle loading and display errors to the user
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle Google login error
    const handleGoogleError = () => {
        setError('Google sign-in was unsuccessful. Please try again.');
    };

    return (
        <div className="flex h-screen w-full flex-row justify-center bg-white">
            <div className="relative h-full w-full max-w-[1550px]">
                <div className="relative h-full bg-[url(/images/UIC.png)] bg-cover bg-[50%_50%]">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,72,100,0.5)_0%,rgba(255,160,173,0.5)_100%)]" />
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
                        <img className="mb-6 h-[125px] w-[125px] object-cover" alt="UIC logo" src="/images/Logo.png" />
                        <h1 className="text-center text-[50px] font-bold text-white italic">UIC MEDICARE</h1>
                        <h2 className="mt-3 mb-8 text-center text-3xl leading-normal tracking-[0] text-white">
                            Health Services & Inventory Management System
                        </h2>

                        {/* Display loading or error states */}
                        {isLoading ? (
                            <div className="my-4 text-lg font-semibold text-white">Signing in...</div>
                        ) : (
                            <div className="my-4">
                                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap />
                            </div>
                        )}

                        {error && (
                            <div className="bg-opacity-70 mt-4 max-w-sm rounded-md bg-red-800 p-3 text-center font-semibold text-white">{error}</div>
                        )}

                        <p className="mt-6 text-center text-lg font-semibold text-white">Sign in with your UIC Google Account</p>
                        {/* Removed Skip and Debug Test buttons for production UI */}

                        {/* Removed debugResult UI */}
                    </div>
                </div>
            </div>
        </div>
    );
}
