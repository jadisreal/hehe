// resources/js/services/consultationService.ts
import axios from 'axios';

export interface ConsultationType {
    id?: number;
    patient_id: number;
    date: string;
    notes: string;
    type: 'walk-in' | 'scheduled';
    created_at?: string;
    updated_at?: string;
}

export interface RemarkType {
    id?: number;
    patient_id: number;
    date: string;
    note: string;
    created_at?: string;
    updated_at?: string;
}

// Get all consultations for a patient
export const getConsultations = async (patientId: number): Promise<ConsultationType[]> => {
    try {
        const response = await axios.get(`/api/consultations/patient/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching consultations:', error);
        return [];
    }
};

// Create a new consultation
export const createConsultation = async (consultation: ConsultationType): Promise<ConsultationType | null> => {
    try {
        const response = await axios.post('/api/consultations', consultation);
        return response.data;
    } catch (error) {
        console.error('Error creating consultation:', error);
        return null;
    }
};

// Update an existing consultation
export const updateConsultation = async (id: number, consultation: Partial<ConsultationType>): Promise<ConsultationType | null> => {
    try {
        const response = await axios.put(`/api/consultations/${id}`, consultation);
        return response.data;
    } catch (error) {
        console.error('Error updating consultation:', error);
        return null;
    }
};

// Delete a consultation
export const deleteConsultation = async (id: number): Promise<boolean> => {
    try {
        await axios.delete(`/api/consultations/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting consultation:', error);
        return false;
    }
};

// Get all remarks for a patient
export const getRemarks = async (patientId: number): Promise<RemarkType[]> => {
    try {
        const response = await axios.get(`/api/remarks/patient/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching remarks:', error);
        return [];
    }
};

// Create a new remark
export const createRemark = async (remark: RemarkType): Promise<RemarkType | null> => {
    try {
        const response = await axios.post('/api/remarks', remark);
        return response.data;
    } catch (error) {
        console.error('Error creating remark:', error);
        return null;
    }
};

// Create both consultation and remark in one go (common pattern in the app)
export const createConsultationWithRemark = async (
    consultation: ConsultationType,
    remark: RemarkType,
): Promise<{ consultation: ConsultationType | null; remark: RemarkType | null }> => {
    try {
        const consultationResult = await createConsultation(consultation);
        const remarkResult = await createRemark(remark);

        return {
            consultation: consultationResult,
            remark: remarkResult,
        };
    } catch (error) {
        console.error('Error creating consultation with remark:', error);
        return {
            consultation: null,
            remark: null,
        };
    }
};
