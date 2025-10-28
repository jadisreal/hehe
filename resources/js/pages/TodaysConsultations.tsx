import { router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Calendar, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';

interface TodaysConsultation {
    id: number;
    patient: string;
    patient_id: number;
    patient_type: string;
    type: string;
    date: string;
    time: string;
    notes: string;
    status: string;
    refer_to_doctor: string;
}

const TodaysConsultations: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [todaysConsultations, setTodaysConsultations] = useState<TodaysConsultation[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch today's consultations data
    useEffect(() => {
        const fetchTodaysConsultations = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/dashboard/todays-consultations');
                setTodaysConsultations(response.data);
            } catch (error) {
                console.error("Error fetching today's consultations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTodaysConsultations();
    }, []);

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleBack = () => {
        router.visit('/dashboard');
    };

    const handleConsultationClick = (consultation: TodaysConsultation): void => {
        const profilePath =
            consultation.patient_type === 'student'
                ? `/consultation/student/${consultation.patient_id}`
                : `/consultation/employee/${consultation.patient_id}`;
        router.visit(profilePath);
    };

    // Get current date for display
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar component */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="dashboard"
            />

            {/* Main Content */}
            <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="z-10 border-b border-gray-200 bg-gradient-to-b from-[#3D1528] to-[#A3386C] px-7 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="rounded-full p-2 text-white hover:bg-white/20">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="mr-2 h-15 w-15" />
                            <h1 className="text-[28px] font-semibold text-white">MEDICARE</h1>
                        </div>
                        <div className="flex items-center">
                            <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-white p-6">
                    {/* Page Header */}
                    <div className="mb-6 flex items-center">
                        <button
                            onClick={handleBack}
                            className="mr-4 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div className="flex items-center">
                            <Calendar className="mr-3 h-10 w-10 text-green-600" />
                            <div>
                                <h1 className="text-4xl font-bold text-black">Today's Consultations</h1>
                                <p className="text-lg text-gray-600">{todayFormatted}</p>
                            </div>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <p className="mb-8 text-gray-600">All consultations completed today across walk-in and scheduled appointments.</p>

                    {/* Statistics Summary */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-6">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-500 p-3 text-white">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-800">{todaysConsultations.length}</p>
                                    <p className="font-medium text-green-600">Total Consultations</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-blue-500 p-3 text-white">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-800">
                                        {todaysConsultations.filter((c) => c.type === 'Walk-in Consultation').length}
                                    </p>
                                    <p className="font-medium text-blue-600">Walk-in</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-6">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-purple-500 p-3 text-white">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-800">
                                        {todaysConsultations.filter((c) => c.type === 'Scheduled Consultation').length}
                                    </p>
                                    <p className="font-medium text-purple-600">Scheduled</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500">Loading today's consultations...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && todaysConsultations.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="mb-4 text-gray-400">
                                <Calendar className="mx-auto h-16 w-16" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No Consultations Today</h3>
                            <p className="text-gray-500">There are no consultations recorded for today yet.</p>
                        </div>
                    )}

                    {/* Today's Consultations Table */}
                    {!loading && todaysConsultations.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Referred to Doctor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {todaysConsultations.map((consultation) => (
                                        <tr
                                            key={consultation.id}
                                            className="cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                                            onClick={() => handleConsultationClick(consultation)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{consultation.patient}</div>
                                                <div className="text-sm text-gray-500">
                                                    {consultation.patient_type === 'student' ? 'Student' : 'Employee'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        consultation.type === 'Walk-in Consultation'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}
                                                >
                                                    {consultation.type === 'Walk-in Consultation' ? 'Walk-in' : 'Scheduled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{consultation.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                    {consultation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        consultation.refer_to_doctor === 'Yes'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}
                                                >
                                                    {consultation.refer_to_doctor}
                                                </span>
                                            </td>
                                            <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">
                                                {consultation.notes || 'No additional notes'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TodaysConsultations;
