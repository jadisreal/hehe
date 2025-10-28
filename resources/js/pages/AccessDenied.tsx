// resources/js/pages/AccessDenied.tsx
import { router } from '@inertiajs/react';
import { ArrowLeft, Home, ShieldX } from 'lucide-react';
import React from 'react';

interface Props {
    message?: string;
    userRole?: string;
}

const AccessDenied: React.FC<Props> = ({ message = 'You do not have permission to access this page.', userRole = 'nurse' }) => {
    const handleGoHome = () => {
        router.visit('/dashboard');
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                <div className="mb-6">
                    <ShieldX className="mx-auto h-16 w-16 text-red-500" />
                </div>

                <h1 className="mb-4 text-2xl font-bold text-gray-900">Access Denied</h1>

                <p className="mb-2 text-gray-600">{message}</p>

                <p className="mb-8 text-sm text-gray-500">
                    Your current role: <span className="font-medium capitalize">{userRole}</span>
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleGoHome}
                        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[#A3386C] px-4 py-3 text-white transition-colors hover:bg-[#77536A]"
                    >
                        <Home className="h-4 w-4" />
                        <span>Go to Dashboard</span>
                    </button>

                    <button
                        onClick={handleGoBack}
                        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-200 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Go Back</span>
                    </button>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                    <p className="text-xs text-gray-400">If you believe this is an error, please contact the system administrator.</p>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
