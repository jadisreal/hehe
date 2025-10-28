import React from 'react';
import UnauthorizedAccess from '../components/UnauthorizedAccess';
import { UserService } from '../services/userService';

interface RouteGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    fallback?: React.ReactNode;
}

/**
 * RouteGuard component to protect routes based on user roles
 * By default, students are only allowed to access the About page
 */
const RouteGuard: React.FC<RouteGuardProps> = ({
    children,
    allowedRoles = ['Admin', 'Nurse', 'Doctor'], // Default: all roles except Student
    fallback,
}) => {
    const currentUser = UserService.getCurrentUser();

    if (!currentUser) {
        // User not logged in, redirect will be handled by authentication
        return null;
    }

    // Get user role as string
    const userRole = typeof currentUser.role === 'string' ? currentUser.role : currentUser.role?.name || '';

    console.log('🛡️ RouteGuard checking access for role:', userRole, 'Allowed roles:', allowedRoles);

    // Check if user role is in allowed roles
    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
        console.log('❌ Access denied for role:', userRole);
        return fallback || <UnauthorizedAccess />;
    }

    console.log('✅ Access granted for role:', userRole);
    return <>{children}</>;
};

/**
 * Hook to check if current user has access to a specific feature
 */
export const useRoleAccess = (allowedRoles: string[] = ['Admin', 'Nurse', 'Doctor']) => {
    const currentUser = UserService.getCurrentUser();

    if (!currentUser) {
        return {
            hasAccess: false,
            userRole: null,
            isStudent: false,
            isDoctor: false,
            isNurse: false,
            isAdmin: false,
        };
    }

    const userRole = typeof currentUser.role === 'string' ? currentUser.role : currentUser.role?.name || '';

    const hasAccess = allowedRoles.includes(userRole);

    return {
        hasAccess,
        userRole,
        isStudent: userRole.toLowerCase() === 'student',
        isDoctor: userRole.toLowerCase() === 'doctor',
        isNurse: userRole.toLowerCase() === 'nurse',
        isAdmin: userRole.toLowerCase() === 'admin',
    };
};

/**
 * Component specifically for student-only content
 */
export const StudentOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <RouteGuard
            allowedRoles={['Student']}
            fallback={
                <UnauthorizedAccess
                    title="Staff Only Area"
                    message="This section is restricted to medical staff only. Students can access the About page for system information."
                />
            }
        >
            {children}
        </RouteGuard>
    );
};

/**
 * Component for staff-only content (excludes students)
 */
export const StaffOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <RouteGuard
            allowedRoles={['Admin', 'Nurse', 'Doctor']}
            fallback={
                <UnauthorizedAccess
                    title="Staff Only Area"
                    message="This section is restricted to medical staff only. Students can access the About page for system information."
                />
            }
        >
            {children}
        </RouteGuard>
    );
};

export default RouteGuard;
