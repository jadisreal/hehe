// resources/js/services/employeeService.ts
import axios from 'axios';
import { Employee } from '../data/mockData';

export const employeeService = {
    /**
     * Get all employees
     */
    getAllEmployees: async (): Promise<Employee[]> => {
        try {
            const response = await axios.get('/api/employees');
            const employees = response.data;

            // Transform API response to match Employee interface
            return employees.map((employee: any) => ({
                id: employee.id.toString(),
                name: employee.name,
                age: employee.age,
                gender: employee.gender,
                department: employee.employee ? employee.employee.department : '',
                position: employee.employee ? employee.employee.position : '',
                address: employee.address,
                contact: employee.contact,
                lastVisit: employee.last_visit || '',
                type: 'employee' as const,
                medicalHistory: employee.medical_histories
                    ? employee.medical_histories.map((item: any) => ({
                          condition: item.condition,
                          diagnosed: item.diagnosed,
                      }))
                    : [],
                consultations: employee.consultations
                    ? employee.consultations.map((item: any) => ({
                          date: item.date || item.created_at,
                          notes: item.notes,
                      }))
                    : [],
                remarks: employee.remarks
                    ? employee.remarks.map((item: any) => ({
                          date: item.date || item.created_at,
                          note: item.note,
                      }))
                    : [],
                additionalProfile: employee.profile
                    ? {
                          lastName: employee.profile.last_name,
                          firstName: employee.profile.first_name,
                          middleInitial: employee.profile.middle_initial,
                          suffix: employee.profile.suffix,
                          dateOfBirth: employee.profile.date_of_birth,
                          nationality: employee.profile.nationality,
                          civilStatus: employee.profile.civil_status,
                          address: employee.profile.address,
                          guardianName: employee.profile.guardian_name,
                          guardianContact: employee.profile.guardian_contact,
                          bloodType: employee.profile.blood_type,
                          height: employee.profile.height,
                          religion: employee.profile.religion,
                          eyeColor: employee.profile.eye_color,
                          chronicConditions: employee.chronic_conditions ? employee.chronic_conditions.map((c: any) => c.name) : [],
                          knownAllergies: employee.allergies ? employee.allergies.map((a: any) => a.name) : [],
                          disabilities: employee.profile.disabilities || '',
                          immunizationHistory: employee.immunizations ? employee.immunizations.map((i: any) => i.name) : [],
                          geneticConditions: employee.profile.genetic_conditions || '',
                      }
                    : null,
            }));
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    },

    /**
     * Get a single employee by ID
     * @param id Employee ID
     * @param timestamp Optional timestamp to prevent caching
     */
    getEmployeeById: async (id: string, timestamp?: number): Promise<Employee | null> => {
        try {
            console.log(`Fetching employee with ID: ${id}`);
            // Add cache-busting timestamp if provided
            const url = timestamp ? `/api/employees/${id}?_=${timestamp}` : `/api/employees/${id}`;

            const response = await axios.get(url);
            const employee = response.data;
            console.log('Employee data received:', employee);

            if (!employee) {
                console.log('Employee not found');
                return null;
            }

            // Transform API response to match Employee interface
            return {
                id: employee.id.toString(),
                name: employee.name,
                age: employee.age,
                gender: employee.gender,
                department: employee.employee ? employee.employee.department : '',
                position: employee.employee ? employee.employee.position : '',
                address: employee.address,
                contact: employee.contact,
                lastVisit: employee.last_visit || '',
                type: 'employee' as const,
                medicalHistory: employee.medical_histories
                    ? employee.medical_histories.map((item: any) => ({
                          condition: item.condition,
                          diagnosed: item.diagnosed,
                      }))
                    : [],
                consultations: employee.consultations
                    ? employee.consultations.map((item: any) => ({
                          date: item.date || item.created_at,
                          notes: item.notes,
                      }))
                    : [],
                remarks: employee.remarks
                    ? employee.remarks.map((item: any) => ({
                          date: item.date || item.created_at,
                          note: item.note,
                      }))
                    : [],
                additionalProfile: employee.profile
                    ? {
                          lastName: employee.profile.last_name,
                          firstName: employee.profile.first_name,
                          middleInitial: employee.profile.middle_initial,
                          suffix: employee.profile.suffix,
                          dateOfBirth: employee.profile.date_of_birth,
                          nationality: employee.profile.nationality,
                          civilStatus: employee.profile.civil_status,
                          address: employee.profile.address,
                          guardianName: employee.profile.guardian_name,
                          guardianContact: employee.profile.guardian_contact,
                          bloodType: employee.profile.blood_type,
                          height: employee.profile.height,
                          religion: employee.profile.religion,
                          eyeColor: employee.profile.eye_color,
                          chronicConditions: employee.chronic_conditions ? employee.chronic_conditions.map((c: any) => c.name) : [],
                          knownAllergies: employee.allergies ? employee.allergies.map((a: any) => a.name) : [],
                          disabilities: employee.profile.disabilities || '',
                          immunizationHistory: employee.immunizations ? employee.immunizations.map((i: any) => i.name) : [],
                          geneticConditions: employee.profile.genetic_conditions || '',
                      }
                    : null,
            };
        } catch (error) {
            console.error(`Error fetching employee with id ${id}:`, error);
            throw error;
        }
    },
};
