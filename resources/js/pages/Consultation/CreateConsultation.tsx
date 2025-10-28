// resources/js/pages/Consultation/CreateConsultation.tsx
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ChevronLeft, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { addConsultation, getPatientById } from '../../data';

const CreateConsultation: React.FC = () => {
    const { props } = usePage();
    const id = (props as any).id as string;

    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [consultationText, setConsultationText] = useState('');
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
    const handleBack = () => window.history.back();

    const handleSave = () => {
        addConsultation(id, {
            date: new Date().toISOString(),
            notes: consultationText,
        });
        router.visit(`/consultation/student/${id}`);
    };

    const handleWalkIn = () => {
        // Use the patient data fetched from API if available
        const patientType = patient ? patient.patient_type : 'student';
        const base = patientType === 'employee' ? `/consultation/employee/${id}/create` : `/consultation/student/${id}/create`;

        // Pass the consultation type as a query parameter or use localStorage to pass it
        localStorage.setItem('consultationType', 'walk-in');
        router.visit(`${base}/walk-in`);
    };

    const handleScheduled = () => {
        // Use the patient data fetched from API if available
        const patientType = patient ? patient.patient_type : 'student';
        const base = patientType === 'employee' ? `/consultation/employee/${id}/create` : `/consultation/student/${id}/create`;

        // Pass the consultation type as a query parameter or use localStorage to pass it
        localStorage.setItem('consultationType', 'scheduled');
        router.visit(`${base}/scheduled`);
    };

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Consultation saved', isRead: false, createdAt: new Date().toISOString() },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={(p) => router.visit(p)}
                handleLogout={() => router.post('/logout')}
                activeMenu="search"
            />

            <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="z-10 border-b border-gray-200 bg-gradient-to-b from-[#3D1528] to-[#A3386C] px-7 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="rounded-full p-2 text-white hover:bg-white/20">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="mr-2 h-15 w-15" />
                            <h1 className="text-[28px] font-semibold text-white">UIC MediCare</h1>
                        </div>
                        <NotificationBell onSeeAll={() => router.visit('../Notification')} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-white p-6">
                    <div className="mb-6 flex items-center">
                        <button className="mr-4 text-gray-600 hover:text-black" onClick={handleBack}>
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-semibold">Create Consultation Record</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-black">Consultation Type:</h2>
                        <div className="space-y-4">
                            <button className="w-full rounded-lg bg-[#A3386C] p-4 text-white hover:bg-[#77536A]" onClick={handleWalkIn}>
                                Walk-in
                            </button>
                            <button className="w-full rounded-lg bg-[#A3386C] p-4 text-white hover:bg-[#77536A]" onClick={handleScheduled}>
                                Scheduled
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateConsultation;
