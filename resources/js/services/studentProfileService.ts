// Service for handling student profile operations
export interface StudentProfileData {
    lastName: string;
    firstName: string;
    middleInitial: string;
    suffix: string;
    dateOfBirth: string;
    nationality: string;
    civilStatus: string;
    address: string;
    guardianName: string;
    guardianContact: string;
    bloodType: string;
    height: string;
    religion: string;
    eyeColor: string;
    disabilities: string;
    geneticConditions: string;
    contact: string;
    currentAddress: string;
}

export interface StudentProfileUpdateResponse {
    success: boolean;
    message: string;
    student?: Record<string, unknown>;
    errors?: Record<string, string[]>;
}

export class StudentProfileService {
    /**
     * Update student's own profile
     */
    static async updateProfile(patientId: number, profileData: StudentProfileData): Promise<StudentProfileUpdateResponse> {
        try {
            const response = await fetch(`/api/student/profile/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to update profile',
                    errors: data.errors || {},
                };
            }

            return {
                success: true,
                message: data.message || 'Profile updated successfully',
                student: data.student,
            };
        } catch (error) {
            console.error('Error updating student profile:', error);
            return {
                success: false,
                message: 'Network error occurred while updating profile',
                errors: {},
            };
        }
    }

    /**
     * Get student's own profile data
     */
    static async getProfile(patientId: number): Promise<Record<string, unknown>> {
        try {
            const response = await fetch(`/api/students/${patientId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching student profile:', error);
            throw error;
        }
    }

    /**
     * Get student's patient ID from current session
     */
    static async getStudentPatientId(): Promise<number | null> {
        try {
            const response = await fetch('/api/student/patient-id', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                console.error('Failed to get student patient ID:', response.status);
                return null;
            }

            const data = await response.json();
            return data.success ? data.patient_id : null;
        } catch (error) {
            console.error('Error getting student patient ID:', error);
            return null;
        }
    }

    /**
     * Validate profile data before submission
     */
    static validateProfile(data: StudentProfileData): Record<string, string> {
        const errors: Record<string, string> = {};

        // Required fields
        if (!data.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!data.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!data.dateOfBirth) {
            errors.dateOfBirth = 'Date of birth is required';
        }

        if (!data.nationality.trim()) {
            errors.nationality = 'Nationality is required';
        }

        if (!data.civilStatus.trim()) {
            errors.civilStatus = 'Civil status is required';
        }

        if (!data.contact.trim()) {
            errors.contact = 'Contact number is required';
        }

        // Format validation
        const phoneRegex = /^09\d{9}$/;
        if (data.contact && !phoneRegex.test(data.contact)) {
            errors.contact = 'Contact must be in format 09XXXXXXXXX';
        }

        if (data.guardianContact && !phoneRegex.test(data.guardianContact)) {
            errors.guardianContact = 'Guardian contact must be in format 09XXXXXXXXX';
        }

        // Age-based validation
        if (data.dateOfBirth) {
            const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
            if (age < 18) {
                if (!data.guardianName.trim()) {
                    errors.guardianName = 'Guardian name is required for minors';
                }
                if (!data.guardianContact.trim()) {
                    errors.guardianContact = 'Guardian contact is required for minors';
                }
            }
        }

        return errors;
    }

    /**
     * Calculate age from date of birth
     */
    static calculateAge(dateOfBirth: string): number {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Check if profile is complete
     */
    static isProfileComplete(profile: Record<string, unknown> | null): boolean {
        if (!profile) return false;

        const requiredFields = ['blood_type', 'height', 'date_of_birth', 'nationality', 'civil_status', 'guardian_contact'];

        return requiredFields.every((field) => profile[field]);
    }

    /**
     * Get profile completion percentage
     */
    static getProfileCompleteness(profile: Record<string, unknown> | null): { percentage: number; missingFields: string[] } {
        if (!profile) {
            return { percentage: 0, missingFields: [] };
        }

        const fields: Record<string, string> = {
            blood_type: 'Blood Type',
            height: 'Height',
            date_of_birth: 'Date of Birth',
            nationality: 'Nationality',
            civil_status: 'Civil Status',
            guardian_contact: 'Guardian Contact',
            religion: 'Religion',
            eye_color: 'Eye Color',
            disabilities: 'Disabilities',
            genetic_conditions: 'Genetic Conditions',
        };

        const completedFields = Object.keys(fields).filter((field) => profile[field]);
        const missingFields = Object.keys(fields)
            .filter((field) => !profile[field])
            .map((field) => fields[field] as string);

        const percentage = (completedFields.length / Object.keys(fields).length) * 100;

        return { percentage: Math.round(percentage), missingFields };
    }
}
