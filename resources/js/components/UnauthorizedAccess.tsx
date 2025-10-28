import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import React from 'react';

interface UnauthorizedAccessProps {
    title?: string;
    message?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
    title = 'Unauthorized Access',
    message = "You don't have permission to access this page. Students can only view the About page.",
    showBackButton = true,
    showHomeButton = true,
}) => {
    const handleGoBack = () => {
        router.visit('/About');
    };

    const handleGoHome = () => {
        router.visit('/About');
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                {/* Warning Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-red-100 p-4">
                        <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">{title}</h1>

                {/* Message */}
                <p className="mb-8 text-center text-gray-600">{message}</p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    {showHomeButton && (
                        <button
                            onClick={handleGoHome}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#A3386C] px-4 py-3 text-white transition-colors hover:bg-[#8a2f5a]"
                        >
                            <Home className="h-5 w-5" />
                            Go to About Page
                        </button>
                    )}

                    {showBackButton && (
                        <button
                            onClick={handleGoBack}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to About
                        </button>
                    )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> As a student, you have access to the About page where you can learn more about the UIC Medicare system
                        and the development team.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedAccess;
