import { router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Eye, Menu, Stethoscope } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ConsultationDetailsModal from '../components/ConsultationDetailsModal';
import DoctorNotesModal from '../components/DoctorNotesModal';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import { UserService } from '../services/userService';

interface PendingAppointment {
    id: number;
    patient: string;
    patient_id: number;
    patient_type: string;
    type: string;
    date: string;
    time: string;
    notes: string;
    status: string;
    // Additional medical fields for doctor review
    blood_pressure?: string;
    pulse?: string;
    temperature?: string;
    weight?: string;
    last_menstrual_period?: string;
    gender?: string;
    remarks?: string;
    doctor_notes?: string;
}

const PendingAppointments: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
    const [completedAppointments, setCompletedAppointments] = useState<PendingAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDoctor, setIsDoctor] = useState(false);
    const [showDoctorNotesModal, setShowDoctorNotesModal] = useState(false);
    const [showConsultationDetailsModal, setShowConsultationDetailsModal] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<PendingAppointment | null>(null);

    // Check if current user is a doctor
    useEffect(() => {
        const checkUserRole = async () => {
            console.log('🔍 Checking user role...');

            try {
                // Method 1: Check localStorage
                const currentUser = UserService.getCurrentUser();
                console.log('📱 Current user from localStorage:', JSON.stringify(currentUser, null, 2));

                if (currentUser?.role) {
                    console.log('🏷️ User role field:', currentUser.role, typeof currentUser.role);

                    let isUserDoctor = false;
                    if (typeof currentUser.role === 'string') {
                        isUserDoctor = currentUser.role === 'doctor';
                        console.log('✅ String role check:', isUserDoctor);
                    } else if (typeof currentUser.role === 'object' && currentUser.role.name) {
                        isUserDoctor = currentUser.role.name === 'doctor';
                        console.log('✅ Object role check:', isUserDoctor);
                    }

                    if (isUserDoctor) {
                        console.log('🏥 User is doctor from localStorage!');
                        setIsDoctor(true);
                        return;
                    }
                }

                // Method 2: Check if email contains known doctor patterns
                if (currentUser?.email) {
                    console.log('📧 Checking email pattern:', currentUser.email);
                    if (currentUser.email.includes('sampon') || currentUser.email.includes('doctor')) {
                        console.log('🏥 User is doctor based on email pattern!');
                        setIsDoctor(true);
                        return;
                    }
                }

                // Method 3: API fallback
                console.log('🌐 Trying API fallback...');
                const doctorRole = await UserService.isDoctor();
                console.log('🌐 API result:', doctorRole);
                setIsDoctor(doctorRole);
            } catch (error) {
                console.error('❌ Error checking user role:', error);
                // Emergency fallback - if user email contains sampon, assume doctor
                const currentUser = UserService.getCurrentUser();
                if (currentUser?.email?.includes('sampon')) {
                    console.log('🚨 Emergency fallback: sampon user detected as doctor');
                    setIsDoctor(true);
                } else {
                    setIsDoctor(false);
                }
            }
        };
        checkUserRole();
    }, []);

    // Fetch pending appointments data
    useEffect(() => {
        const fetchPendingAppointments = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/dashboard/pending-appointments');
                // The API now returns an object with 'pending' and 'completed' arrays
                setPendingAppointments(response.data.pending || []);
                setCompletedAppointments(response.data.completed || []);
            } catch (error) {
                console.error('Error fetching pending appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingAppointments();
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

    const handleAppointmentClick = (appointment: PendingAppointment): void => {
        const profilePath =
            appointment.patient_type === 'student'
                ? `/consultation/student/${appointment.patient_id}`
                : `/consultation/employee/${appointment.patient_id}`;
        router.visit(profilePath);
    };

    const handleDoctorNotesClick = (appointment: PendingAppointment, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent row click
        setSelectedConsultation(appointment);
        setShowDoctorNotesModal(true);
    };

    const handleDoctorNotesSave = () => {
        // Refresh both pending and completed appointments lists
        const fetchPendingAppointments = async () => {
            try {
                const response = await axios.get('/api/dashboard/pending-appointments');
                setPendingAppointments(response.data.pending || []);
                setCompletedAppointments(response.data.completed || []);
            } catch (error) {
                console.error('Error refreshing pending appointments:', error);
            }
        };
        fetchPendingAppointments();
    };

    const handleModalClose = () => {
        setShowDoctorNotesModal(false);
        setSelectedConsultation(null);
    };

    const handleViewDetailsClick = (appointment: PendingAppointment, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent row click
        setSelectedConsultation(appointment);
        setShowConsultationDetailsModal(true);
    };

    const handleDetailsModalClose = () => {
        setShowConsultationDetailsModal(false);
        setSelectedConsultation(null);
    };

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
                        <h1 className="text-4xl font-bold text-black">Pending Appointments</h1>
                    </div>

                    {/* Subtitle */}
                    <p className="mb-8 text-gray-600">Consultations where patients were referred to a doctor for further review.</p>

                    {/* Loading State */}
                    {loading && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500">Loading appointments...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && pendingAppointments.length === 0 && completedAppointments.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="mb-4 text-gray-400">
                                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No Appointments</h3>
                            <p className="text-gray-500">There are currently no consultations that were referred to a doctor.</p>
                        </div>
                    )}

                    {!loading && (pendingAppointments.length > 0 || completedAppointments.length > 0) && (
                        <div className="space-y-8">
                            {/* Pending Appointments Table */}
                            {pendingAppointments.length > 0 && (
                                <div>
                                    <div className="mb-4 flex items-center">
                                        <h2 className="text-2xl font-semibold text-gray-900">Pending Doctor Review</h2>
                                        <span className="ml-3 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                            {pendingAppointments.length} appointment{pendingAppointments.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Patient
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Time
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Notes
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {pendingAppointments.map((appointment) => (
                                                    <tr
                                                        key={appointment.id}
                                                        className="cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                                                        onClick={() => handleAppointmentClick(appointment)}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{appointment.patient}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {appointment.patient_type === 'student' ? 'Student' : 'Employee'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{appointment.type}</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{appointment.date}</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{appointment.time}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                                                                {appointment.status}
                                                            </span>
                                                        </td>
                                                        <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">
                                                            {appointment.notes || 'No additional notes'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isDoctor ? (
                                                                <button
                                                                    onClick={(e) => handleDoctorNotesClick(appointment, e)}
                                                                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm leading-4 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                                                >
                                                                    <Stethoscope className="mr-2 h-4 w-4" />
                                                                    Add Doctor's Notes
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => handleViewDetailsClick(appointment, e)}
                                                                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm leading-4 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Completed Consultations Table */}
                            {completedAppointments.length > 0 && (
                                <div>
                                    <div className="mb-4 flex items-center">
                                        <h2 className="text-2xl font-semibold text-gray-900">Completed Consultations</h2>
                                        <span className="ml-3 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            {completedAppointments.length} consultation{completedAppointments.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Patient
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Time
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Doctor's Notes
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {completedAppointments.map((appointment) => (
                                                    <tr
                                                        key={appointment.id}
                                                        className="cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                                                        onClick={() => handleAppointmentClick(appointment)}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{appointment.patient}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {appointment.patient_type === 'student' ? 'Student' : 'Employee'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{appointment.type}</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{appointment.date}</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{appointment.time}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                                {appointment.status}
                                                            </span>
                                                        </td>
                                                        <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">
                                                            {appointment.doctor_notes || 'No notes recorded'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isDoctor ? (
                                                                <button
                                                                    onClick={(e) => handleDoctorNotesClick(appointment, e)}
                                                                    className="inline-flex items-center rounded-md border border-transparent bg-gray-100 px-3 py-2 text-sm leading-4 font-medium text-gray-600 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                                                                >
                                                                    <Stethoscope className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => handleViewDetailsClick(appointment, e)}
                                                                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm leading-4 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Doctor Notes Modal */}
            {selectedConsultation && (
                <DoctorNotesModal
                    isOpen={showDoctorNotesModal}
                    onClose={handleModalClose}
                    consultation={selectedConsultation}
                    onSave={handleDoctorNotesSave}
                />
            )}

            {/* Consultation Details Modal for Nurses */}
            {selectedConsultation && (
                <ConsultationDetailsModal
                    isOpen={showConsultationDetailsModal}
                    onClose={handleDetailsModalClose}
                    consultation={selectedConsultation}
                />
            )}
        </div>
    );
};

export default PendingAppointments;
