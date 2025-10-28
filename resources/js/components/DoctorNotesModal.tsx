import axios from 'axios';
import { Save, X } from 'lucide-react';
import React, { useState } from 'react';

interface DoctorNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    consultation: {
        id: number;
        patient: string;
        patient_id: number;
        patient_type: string;
        notes: string;
        status: string;
        doctor_notes?: string;
        // Additional fields for medical details
        blood_pressure?: string;
        pulse?: string;
        temperature?: string;
        weight?: string;
        last_menstrual_period?: string;
        gender?: string;
        remarks?: string;
    };
    onSave: () => void;
}

const DoctorNotesModal: React.FC<DoctorNotesModalProps> = ({ isOpen, onClose, consultation, onSave }) => {
    const [doctorNotes, setDoctorNotes] = useState(consultation.doctor_notes || '');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!doctorNotes.trim()) {
            alert('Please enter doctor notes before saving.');
            return;
        }

        try {
            setSaving(true);
            await axios.put(`/api/consultations/${consultation.id}/doctor-notes`, {
                doctor_notes: doctorNotes,
            });

            alert('Doctor notes saved successfully! Consultation marked as completed.');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving doctor notes:', error);
            alert('Error saving doctor notes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setDoctorNotes(consultation.doctor_notes || '');
        onClose();
    };

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-[#3D1528] to-[#A3386C] px-6 py-4 text-white">
                    <div>
                        <h2 className="text-xl font-semibold">Doctor's Review</h2>
                        <p className="text-sm opacity-90">Patient: {consultation.patient}</p>
                    </div>
                    <button onClick={handleClose} className="rounded-full p-2 text-white transition-colors hover:bg-white/20">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Left Side - Patient Information */}
                        <div className="space-y-4">
                            {/* Patient Complaints & Nurse Remarks */}
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-800">
                                    <svg className="mr-2 h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Complaints & Remarks
                                </h3>
                                <div className="rounded border bg-white p-4">
                                    <div className="mb-4">
                                        <h4 className="mb-2 font-medium text-gray-700">Patient's Complaints:</h4>
                                        <div className="rounded border bg-gray-50 p-3 whitespace-pre-wrap text-gray-600">
                                            {consultation.notes || 'No complaints recorded'}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="mb-2 font-medium text-gray-700">Nurse's Remarks:</h4>
                                        <div className="rounded border bg-gray-50 p-3 whitespace-pre-wrap text-gray-600">
                                            {consultation.remarks || 'No remarks recorded'}
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="mb-2 font-medium text-gray-700">Current Status:</h4>
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                                                consultation.status === 'in-progress'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {consultation.status === 'in-progress' ? 'Awaiting Doctor Review' : 'Completed'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Vital Signs */}
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-800">
                                    <svg className="mr-2 h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                    Vital Signs
                                </h3>
                                <div className="rounded border bg-white p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="mb-1 font-medium text-gray-700">Blood Pressure:</h4>
                                            <div className="rounded border bg-gray-50 p-2 text-gray-600">
                                                {consultation.blood_pressure || 'Not recorded'}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="mb-1 font-medium text-gray-700">Pulse (BPM):</h4>
                                            <div className="rounded border bg-gray-50 p-2 text-gray-600">{consultation.pulse || 'Not recorded'}</div>
                                        </div>
                                        <div>
                                            <h4 className="mb-1 font-medium text-gray-700">Temperature:</h4>
                                            <div className="rounded border bg-gray-50 p-2 text-gray-600">
                                                {consultation.temperature ? `${consultation.temperature}°C` : 'Not recorded'}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="mb-1 font-medium text-gray-700">Weight:</h4>
                                            <div className="rounded border bg-gray-50 p-2 text-gray-600">
                                                {consultation.weight ? `${consultation.weight} kg` : 'Not recorded'}
                                            </div>
                                        </div>
                                        {consultation.gender === 'female' && (
                                            <div className="col-span-2">
                                                <h4 className="mb-1 font-medium text-gray-700">Last Menstrual Period:</h4>
                                                <div className="rounded border bg-gray-50 p-2 text-gray-600">
                                                    {consultation.last_menstrual_period || 'Not recorded'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Doctor's Notes */}
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-800">
                                    <svg className="mr-2 h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Doctor's Notes
                                </h3>
                                <div className="rounded border bg-white p-4">
                                    <textarea
                                        value={doctorNotes}
                                        onChange={(e) => setDoctorNotes(e.target.value)}
                                        placeholder="Enter your medical assessment, diagnosis, treatment recommendations, and any additional notes..."
                                        className="min-h-[300px] w-full resize-none rounded-lg border border-gray-300 p-3 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        disabled={saving}
                                    />
                                    <div className="mt-2 text-sm text-gray-500">{doctorNotes.length}/1000 characters</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Note:</span> Saving will mark this consultation as completed.
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            disabled={saving}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !doctorNotes.trim()}
                            className="flex items-center rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <svg
                                        className="mr-3 -ml-1 h-4 w-4 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save & Complete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorNotesModal;
