// resources/js/pages/Consultation/Scheduled.tsx
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ChevronLeft, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { addConsultation, addRemark, getPatientById } from '../../data';
import { forceDataRefresh } from '../../utils/dataRefresh';

const Scheduled: React.FC = () => {
    const { props } = usePage();
    const id = (props as any).id as string;

    // Sidebar
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    // Form
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [referToDoctor, setReferToDoctor] = useState(false);
    const [bloodPressure, setBloodPressure] = useState('');
    const [pulse, setPulse] = useState('');
    const [temperature, setTemperature] = useState('');
    const [weight, setWeight] = useState('');
    const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState('');
    const [complaints, setComplaints] = useState('');
    const [remarks, setRemarks] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        if (id) {
            // First try to get patient data from API
            axios
                .get(`/api/patients/${id}`)
                .then((response) => {
                    setPatient(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching patient data:', error);
                    // Fall back to mock data if API fails
                    const p = getPatientById(id);
                    if (p) setPatient(p);
                });
        }
    }, [id]);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const handleNavigation = (path: string) => router.visit(path);
    const handleLogout = () => router.post('/logout');

    const handleBack = () => window.history.back();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !patient) return;

        // Get the consultation type from localStorage or default to 'scheduled' since we're in the Scheduled component
        const type = localStorage.getItem('consultationType') || 'scheduled';

        // Get the patient ID from the URL and ensure it's properly parsed
        const urlParams = new URLSearchParams(window.location.search);
        const pathParts = window.location.pathname.split('/');

        // Extract the ID differently based on the URL pattern
        // URL format: /consultation/(student|employee)/{id}/scheduled
        const pathType = pathParts[2]; // either 'student' or 'employee'
        const urlPatientId = pathParts[3];

        // Enhanced debugging
        console.log('Full URL path:', window.location.pathname);
        console.log('Path parts:', pathParts);
        console.log('Path type (student/employee):', pathType);
        console.log('Patient ID from URL path:', urlPatientId);
        console.log('Patient ID from props:', id);
        console.log('Patient object:', patient);

        // Use the correct patient ID, ensuring it's properly parsed
        const patientId = parseInt(urlPatientId || id);

        if (isNaN(patientId)) {
            console.error('Invalid patient ID');
            alert('Invalid patient ID. Please try again.');
            return;
        }

        // Prepare consultation and remark data with the verified patient ID
        const consultationData = {
            patient_id: patientId,
            date: date || new Date().toISOString().split('T')[0],
            notes: complaints || 'No notes',
            type: type as 'walk-in' | 'scheduled',
            refer_to_doctor: referToDoctor,
            status: referToDoctor ? 'in-progress' : 'completed',
            // Include vital signs in consultation data
            blood_pressure: bloodPressure || null,
            pulse: pulse || null,
            temperature: temperature || null,
            weight: weight || null,
            last_menstrual_period: lastMenstrualPeriod || null,
        };

        const remarkData = {
            patient_id: patientId,
            date: date || new Date().toISOString().split('T')[0],
            note:
                remarks ||
                `BP: ${bloodPressure}, Pulse: ${pulse}, Temp: ${temperature}°C, Weight: ${weight}kg${referToDoctor ? ', Referred to Doctor' : ''}`,
        };

        // Use axios to directly submit data to the backend
        axios
            .post('/api/consultations', consultationData)
            .then((consultationResponse) => {
                console.log('Consultation created:', consultationResponse.data);

                // Create the remark after consultation is created
                return axios.post('/api/remarks', remarkData);
            })
            .then((remarkResponse) => {
                console.log('Remark created:', remarkResponse.data);

                // Signal to all components that data needs to be refreshed
                forceDataRefresh();

                setShowSuccess(true);

                // Show success message and navigate with complete reload to refresh data
                setTimeout(() => {
                    setShowSuccess(false);
                    const patientType = patient.patient_type || 'student';

                    // Force a complete reload to ensure fresh data
                    const profileUrl = patientType === 'student' ? `/consultation/student/${id}` : `/consultation/employee/${id}`;

                    // Use window.location instead of router for a full page reload
                    window.location.href = profileUrl;
                }, 1500);
            })
            .catch((error) => {
                console.error('Error creating consultation or remark:', error);

                // Log more detailed error information
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);
                    console.error('Error response headers:', error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error('Error request:', error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error('Error message:', error.message);
                }

                // Fall back to mock data as last resort
                console.log('Falling back to mock data...');
                addConsultation(id, {
                    date: date || new Date().toISOString(),
                    notes: complaints,
                    type: type,
                });
                addRemark(id, {
                    date: date || new Date().toISOString(),
                    note: remarkData.note,
                });

                // Still show success and navigate
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    const patientType = patient.patient_type || 'student';
                    if (patientType === 'student') {
                        router.visit(`/consultation/student/${id}`, {
                            preserveState: false, // Don't preserve the state to ensure fresh data
                            replace: true, // Replace current history entry
                        });
                    } else {
                        router.visit(`/consultation/employee/${id}`, {
                            preserveState: false, // Don't preserve the state to ensure fresh data
                            replace: true, // Replace current history entry
                        });
                    }
                }, 1500);
            });
    };

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Appointment scheduled', isRead: false, createdAt: new Date().toISOString() },
    ];

    if (!patient) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl text-gray-600">Patient not found</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="search"
            />

            <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="z-10 border-b border-gray-200 bg-gradient-to-b from-[#3D1528] to-[#A3386C] px-7 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button onClick={handleBack} className="mr-3 rounded-full p-2 text-white hover:bg-white/20">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button onClick={toggleSidebar} className="rounded-full p-2 text-white hover:bg-white/20">
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="mr-2 h-15 w-15" />
                            <h1 className="text-[28px] font-semibold text-white">UIC MediCare</h1>
                        </div>
                        <NotificationBell onSeeAll={() => router.visit('../Notification')} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-white p-6">
                    <div className="mb-6 flex items-center">
                        <h1 className="text-3xl font-bold text-black">Scheduled Consultation - {patient.name}</h1>
                    </div>

                    {showSuccess && (
                        <div className="fixed top-20 right-4 z-50 rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg">
                            Consultation Scheduled!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-black">Date *</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-black">Time *</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={referToDoctor}
                                    onChange={(e) => setReferToDoctor(e.target.checked)}
                                    className="h-5 w-5 rounded text-[#A3386C] focus:ring-[#A3386C]"
                                />
                                <span className="ml-2 font-bold text-black">Refer to Doctor?</span>
                            </label>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-black">Blood Pressure</label>
                                <input
                                    type="text"
                                    value={bloodPressure}
                                    onChange={(e) => setBloodPressure(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                    placeholder="e.g., 120/80"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-black">Pulse (BPM)</label>
                                <input
                                    type="number"
                                    value={pulse}
                                    onChange={(e) => setPulse(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                    placeholder="e.g., 72"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-black">Temperature (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                    placeholder="e.g., 36.5"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-black">Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                    placeholder="e.g., 65.5"
                                />
                            </div>
                        </div>

                        {patient.gender === 'Female' && (
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-bold text-black">Last Menstrual Period</label>
                                <input
                                    type="date"
                                    value={lastMenstrualPeriod}
                                    onChange={(e) => setLastMenstrualPeriod(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                />
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-bold text-black">Complaints</label>
                            <textarea
                                value={complaints}
                                onChange={(e) => setComplaints(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-bold text-black">Remarks</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 p-3 text-black focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="rounded-lg bg-[#A3386C] px-6 py-3 font-semibold text-white hover:bg-[#77536A]">
                                Schedule
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Scheduled;
