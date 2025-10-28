// resources/js/services/studentService.updated.ts
import axios from 'axios';
import { Student } from '../data/mockData';

export const studentService = {
    /**
     * Get all students
     */
    getAllStudents: async (): Promise<Student[]> => {
        try {
            const response = await axios.get('/api/students');
            const students = response.data;

            // Transform API response to match Student interface
            return students.map((student: any) => ({
                id: student.id.toString(),
                name: student.name,
                age: student.age,
                gender: student.gender,
                course: student.student ? student.student.course : '',
                address: student.address,
                contact: student.contact,
                lastVisit: student.last_visit || '',
                type: 'student' as const,
                medicalHistory: student.medical_histories
                    ? student.medical_histories.map((item: any) => ({
                          condition: item.condition,
                          diagnosed: item.diagnosed,
                      }))
                    : [],
                consultations: student.consultations
                    ? student.consultations.map((item: any) => ({
                          date: item.date || item.created_at,
                          notes: item.notes,
                          type: item.type || 'walk-in', // Include type field with default value
                      }))
                    : [],
                remarks: student.remarks
                    ? student.remarks.map((item: any) => ({
                          date: item.date || item.created_at,
                          note: item.note,
                      }))
                    : [],
                additionalProfile: student.profile
                    ? {
                          lastName: student.profile.last_name,
                          firstName: student.profile.first_name,
                          middleInitial: student.profile.middle_initial,
                          suffix: student.profile.suffix,
                          dateOfBirth: student.profile.date_of_birth,
                          nationality: student.profile.nationality,
                          civilStatus: student.profile.civil_status,
                          address: student.profile.address,
                          guardianName: student.profile.guardian_name,
                          guardianContact: student.profile.guardian_contact,
                          bloodType: student.profile.blood_type,
                          height: student.profile.height,
                          religion: student.profile.religion,
                          eyeColor: student.profile.eye_color,
                          chronicConditions: student.chronic_conditions ? student.chronic_conditions.map((c: any) => c.name) : [],
                          knownAllergies: student.allergies ? student.allergies.map((a: any) => a.name) : [],
                          disabilities: student.profile.disabilities || '',
                          immunizationHistory: student.immunizations ? student.immunizations.map((i: any) => i.name) : [],
                          geneticConditions: student.profile.genetic_conditions || '',
                      }
                    : null,
            }));
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    },

    /**
     * Get a single student by ID
     * @param id Student ID
     * @param timestamp Optional timestamp to prevent caching
     */
    getStudentById: async (id: string, timestamp?: number): Promise<Student | null> => {
        try {
            console.log(`Fetching student with ID: ${id}`);
            // Add cache-busting timestamp if provided
            const url = timestamp ? `/api/students/${id}?_=${timestamp}` : `/api/students/${id}`;

            const response = await axios.get(url);
            const student = response.data;
            console.log('Student data received:', student);

            if (!student) {
                return null;
            }

            // Transform API response to match Student interface
            return {
                id: student.id.toString(),
                name: student.name,
                age: student.age,
                gender: student.gender,
                course: student.student ? student.student.course : '',
                address: student.address,
                contact: student.contact,
                lastVisit: student.last_visit || '',
                type: 'student' as const,
                medicalHistory: student.medical_histories
                    ? student.medical_histories.map((item: any) => ({
                          condition: item.condition,
                          diagnosed: item.diagnosed,
                      }))
                    : [],
                consultations: student.consultations
                    ? student.consultations.map((item: any) => ({
                          date: item.date || item.created_at,
                          notes: item.notes,
                          type: item.type || 'walk-in', // Include type field with default value
                      }))
                    : [],
                remarks: student.remarks
                    ? student.remarks.map((item: any) => ({
                          date: item.date || item.created_at,
                          note: item.note,
                      }))
                    : [],
                additionalProfile: student.profile
                    ? {
                          lastName: student.profile.last_name,
                          firstName: student.profile.first_name,
                          middleInitial: student.profile.middle_initial,
                          suffix: student.profile.suffix,
                          dateOfBirth: student.profile.date_of_birth,
                          nationality: student.profile.nationality,
                          civilStatus: student.profile.civil_status,
                          address: student.profile.address,
                          guardianName: student.profile.guardian_name,
                          guardianContact: student.profile.guardian_contact,
                          bloodType: student.profile.blood_type,
                          height: student.profile.height,
                          religion: student.profile.religion,
                          eyeColor: student.profile.eye_color,
                          chronicConditions: student.chronic_conditions ? student.chronic_conditions.map((c: any) => c.name) : [],
                          knownAllergies: student.allergies ? student.allergies.map((a: any) => a.name) : [],
                          disabilities: student.profile.disabilities || '',
                          immunizationHistory: student.immunizations ? student.immunizations.map((i: any) => i.name) : [],
                          geneticConditions: student.profile.genetic_conditions || '',
                      }
                    : null,
            };
        } catch (error) {
            console.error('Error fetching student by ID:', error);
            return null;
        }
    },
};
