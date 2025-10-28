// resources/js/services/patientService.ts
import axios from 'axios';
import { Patient } from '../data/mockData';

const API_URL = '/api/patients';

export const patientService = {
    /**
     * Get all patients
     */
    getAllPatients: async (): Promise<Patient[]> => {
        try {
            const response = await axios.get(API_URL);
            // Transform the API response to match the Patient interface
            return response.data.map((patient: any) => ({
                id: patient.id.toString(),
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                address: patient.address,
                contact: patient.contact,
                lastVisit: patient.last_visit || null,
                medicalHistory: patient.medical_history
                    ? patient.medical_history.map((history: any) => ({
                          condition: history.condition,
                          diagnosed: history.diagnosed,
                      }))
                    : [],
                consultations: patient.consultations
                    ? patient.consultations.map((consultation: any) => ({
                          date: consultation.date,
                          notes: consultation.notes,
                      }))
                    : [],
                remarks: patient.remarks
                    ? patient.remarks.map((remark: any) => ({
                          date: remark.date,
                          note: remark.note,
                      }))
                    : [],
                additionalProfile: patient.profile
                    ? {
                          lastName: patient.profile.last_name,
                          firstName: patient.profile.first_name,
                          middleInitial: patient.profile.middle_initial || '',
                          suffix: patient.profile.suffix || '',
                          dateOfBirth: patient.profile.date_of_birth,
                          nationality: patient.profile.nationality,
                          civilStatus: patient.profile.civil_status,
                          address: patient.profile.address,
                          guardianName: patient.profile.guardian_name || '',
                          guardianContact: patient.profile.guardian_contact || '',
                          bloodType: patient.profile.blood_type || '',
                          height: patient.profile.height || '',
                          weight: patient.profile.weight || '',
                          religion: patient.profile.religion || '',
                          eyeColor: patient.profile.eye_color || '',
                      }
                    : null,
                studentInfo: patient.student
                    ? {
                          studentId: patient.student.student_id,
                          course: patient.student.course,
                          yearLevel: patient.student.year_level,
                          section: patient.student.section || '',
                      }
                    : null,
                employeeInfo: patient.employee
                    ? {
                          employeeId: patient.employee.employee_id,
                          department: patient.employee.department,
                          position: patient.employee.position,
                          hireDate: patient.employee.hire_date,
                      }
                    : null,
            }));
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    },

    /**
     * Get a single patient by ID
     */
    getPatientById: async (id: string): Promise<Patient> => {
        try {
            console.log(`patientService: Fetching patient with ID: ${id}`);
            const response = await axios.get(`${API_URL}/${id}`);
            const patient = response.data;
            console.log('patientService: Raw API response:', patient);

            // Transform the API response to match the Patient interface
            const result = {
                id: patient.id.toString(),
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                address: patient.address,
                contact: patient.contact,
                lastVisit: patient.last_visit || null,
                // Initialize empty arrays for these if they don't exist in the API response
                medicalHistory: patient.medical_histories
                    ? patient.medical_histories.map((history: any) => ({
                          condition: history.condition || 'Unknown condition',
                          diagnosed: history.diagnosed_date || 'Unknown date',
                      }))
                    : [],
                consultations: patient.consultations
                    ? patient.consultations.map((consultation: any) => ({
                          date: consultation.date || new Date().toISOString().split('T')[0],
                          notes: consultation.notes || 'No notes',
                      }))
                    : [],
                remarks: patient.remarks
                    ? patient.remarks.map((remark: any) => ({
                          date: remark.date || new Date().toISOString().split('T')[0],
                          note: remark.content || 'No remarks',
                      }))
                    : [],
                additionalProfile: patient.profile
                    ? {
                          lastName: patient.profile.last_name,
                          firstName: patient.profile.first_name,
                          middleInitial: patient.profile.middle_initial || '',
                          suffix: patient.profile.suffix || '',
                          dateOfBirth: patient.profile.date_of_birth,
                          nationality: patient.profile.nationality,
                          civilStatus: patient.profile.civil_status,
                          address: patient.profile.address,
                          guardianName: patient.profile.guardian_name || '',
                          guardianContact: patient.profile.guardian_contact || '',
                          bloodType: patient.profile.blood_type || '',
                          height: patient.profile.height || '',
                          weight: patient.profile.weight || '',
                          religion: patient.profile.religion || '',
                          eyeColor: patient.profile.eye_color || '',
                      }
                    : null,
                studentInfo: patient.student
                    ? {
                          studentId: patient.student.student_id,
                          course: patient.student.course,
                          yearLevel: patient.student.year_level,
                          section: patient.student.section || '',
                      }
                    : null,
                employeeInfo: patient.employee
                    ? {
                          employeeId: patient.employee.employee_id,
                          department: patient.employee.department,
                          position: patient.employee.position,
                          hireDate: patient.employee.hire_date,
                      }
                    : null,
            };

            console.log('patientService: Transformed patient data:', result);
            return result;
        } catch (error) {
            console.error(`Error fetching patient with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create a new patient
     */
    createPatient: async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
        try {
            const response = await axios.post(API_URL, patientData);
            return response.data;
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    },

    /**
     * Update an existing patient
     */
    updatePatient: async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, patientData);
            return response.data;
        } catch (error) {
            console.error(`Error updating patient with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a patient
     */
    deletePatient: async (id: string): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting patient with id ${id}:`, error);
            throw error;
        }
    },
};

export default patientService;
