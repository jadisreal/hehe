// Simple client-side user/session helper used by the student profile page.
export interface User {
    id?: number | null;
    email?: string;
    name?: string;
    role?: string | { id: number; name: string };
    patient_id?: number | null;
}

export class UserService {
    static storeUserSession(userData: User): void {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
    }

    static getCurrentUser(): User | null {
        try {
            const s = localStorage.getItem('currentUser');
            return s ? JSON.parse(s) : null;
        } catch (e) {
            console.error('Error parsing currentUser', e);
            return null;
        }
    }

    static clearUserSession(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
    }

    static async getCurrentUserWithRole(): Promise<User | null> {
        try {
            const resp = await fetch('/api/user', { method: 'GET', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!resp.ok) return null;
            return await resp.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    static async getStudentPatientId(): Promise<number | null> {
        try {
            const resp = await fetch('/api/student/patient-id', {
                method: 'GET',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!resp.ok) return null;
            const data = await resp.json();
            return data && data.success ? data.patient_id : null;
        } catch (e) {
            console.error('Error fetching student patient id', e);
            return null;
        }
    }

    /**
     * Verify user access by querying the backend MSSQL integration endpoint.
     * The backend route `POST /api/users/by-email` returns the user info for the given email.
     * Returns the user object on success, or null when not found or on error.
     */
    static async verifyUserAccess(email: string): Promise<User | null> {
        try {
            const resp = await fetch('/api/users/by-email', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email }),
            });

            if (!resp.ok) {
                console.warn('verifyUserAccess: backend returned', resp.status);
                return null;
            }

            const data = await resp.json();
            // backend may return { success: true, user: {...} } or just the user object
            if (!data) return null;
            if (data.user) return data.user as User;
            return data as User;
        } catch (e) {
            console.error('Error verifying user access', e);
            return null;
        }
    }

    static setStudentPatientId(patientId: number): void {
        try {
            const curr = this.getCurrentUser() || {};
            curr.patient_id = patientId;
            localStorage.setItem('currentUser', JSON.stringify(curr));
        } catch (e) {
            console.error('Failed to set student patient id locally', e);
        }
    }
}

export default UserService;
// Persist student patient id into currentUser in localStorage
