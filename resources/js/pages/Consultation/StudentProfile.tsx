// resources/js/pages/Consultation/StudentProfile.tsx
import { router, usePage } from '@inertiajs/react';
import { Menu, Plus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import NotificationBell from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { Student as StudentType } from '../../data/mockData';
import { studentService } from '../../services/studentService.fixed';
import { shouldRefreshData } from '../../utils/dataRefresh';

const StudentProfile: React.FC = () => {
    // Get the id from Inertia's page props (passed from Laravel controller)
    const { props } = usePage();
    const id = (props as any).id as string;

    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('medicalHistory');
    const [showCreateOptions, setShowCreateOptions] = useState(false);

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // State for student data
    const [student, setStudent] = useState<StudentType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const lastCheckRef = useRef(Date.now());

    // Fetch student from API - use a key to force remount/refetch
    useEffect(() => {
        // Function to fetch student data - moved inside useEffect to avoid dependency issues
        const fetchStudent = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                // Add timestamp parameter to bust cache
                const timestamp = Date.now();
                const studentData = await studentService.getStudentById(id, timestamp);
                console.log('Fetched student data with consultations:', studentData);
                setStudent(studentData);
                lastCheckRef.current = timestamp;
            } catch (error) {
                console.error('Error fetching student:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudent();

        // Set up an interval to refresh data every 3 seconds while page is open
        const refreshInterval = setInterval(() => {
            if (shouldRefreshData(lastCheckRef.current)) {
                console.log('Data change detected, refreshing student data...');
                fetchStudent();
            } else {
                console.log('Checking for data updates...');
            }
        }, 3000);

        // Listen for data update events
        const handleDataUpdate = () => {
            console.log('Data update event received, refreshing data...');
            fetchStudent();
        };

        window.addEventListener('uic_medcare_data_updated', handleDataUpdate);

        // Clean up interval and event listener on unmount
        return () => {
            clearInterval(refreshInterval);
            window.removeEventListener('uic_medcare_data_updated', handleDataUpdate);
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl text-gray-600">Loading student data...</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl text-gray-600">Student not found</p>
            </div>
        );
    }

    // Add the type annotation to fix the error
    const tabContent: Record<string, React.ReactNode> = {
        medicalHistory: (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Condition</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Diagnosed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {student.medicalHistory.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{item.condition}</td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{item.diagnosed}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        consultations: (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {student.consultations.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{item.date}</td>
                                <td className="px-6 py-4 text-sm text-black">{item.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        remarks: (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {student.remarks.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{item.date}</td>
                                <td className="px-6 py-4 text-sm text-black">{item.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        additionalProfile: (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="font-medium text-black">{student.additionalProfile?.lastName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="font-medium text-black">{student.additionalProfile?.firstName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Middle Initial</p>
                        <p className="font-medium text-black">{student.additionalProfile?.middleInitial || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Suffix</p>
                        <p className="font-medium text-black">{student.additionalProfile?.suffix || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium text-black">{student.additionalProfile?.dateOfBirth || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Nationality/Citizenship</p>
                        <p className="font-medium text-black">{student.additionalProfile?.nationality || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Civil Status</p>
                        <p className="font-medium text-black">{student.additionalProfile?.civilStatus || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-black">{student.additionalProfile?.address || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Guardian's Name</p>
                        <p className="font-medium text-black">{student.additionalProfile?.guardianName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Guardian's Contact Number</p>
                        <p className="font-medium text-black">{student.additionalProfile?.guardianContact || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Blood Type</p>
                        <p className="font-medium text-black">{student.additionalProfile?.bloodType || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="font-medium text-black">{student.additionalProfile?.height || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Religion/Faith</p>
                        <p className="font-medium text-black">{student.additionalProfile?.religion || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Eye Color</p>
                        <p className="font-medium text-black">{student.additionalProfile?.eyeColor || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Chronic Condition(s)</p>
                        <p className="font-medium text-black">
                            {student.additionalProfile?.chronicConditions ? student.additionalProfile.chronicConditions.join(', ') || 'None' : 'None'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Known Allergies</p>
                        <p className="font-medium text-black">
                            {student.additionalProfile?.knownAllergies ? student.additionalProfile.knownAllergies.join(', ') || 'None' : 'None'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Disabilities</p>
                        <p className="font-medium text-black">{student.additionalProfile?.disabilities || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Immunization History</p>
                        <p className="font-medium text-black">
                            {student.additionalProfile?.immunizationHistory
                                ? student.additionalProfile.immunizationHistory.join(', ') || 'None'
                                : 'None'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Genetic Conditions</p>
                        <p className="font-medium text-black">{student.additionalProfile?.geneticConditions || 'None'}</p>
                    </div>
                </div>
            </div>
        ),
    };

    // Sample notifications if needed later
    // const notifications: NotificationType[] = [
    //     { id: 1, type: 'info', message: 'New medicine stock added', isRead: false, createdAt: new Date().toISOString() },
    // ];

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
                        <button onClick={toggleSidebar} className="rounded-full p-2 text-white hover:bg-white/20">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="mr-2 h-15 w-15" />
                            <h1 className="text-[28px] font-semibold text-white">UIC MediCare</h1>
                        </div>
                        <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-black">Patient Profile: {student.name}</h1>
                        <div>
                            <button
                                className="rounded-full bg-[#A3386C] p-2 text-white hover:bg-[#77536A]"
                                onClick={() => handleNavigation(`/consultation/student/${id}/create`)}
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-black">Personal Information</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-black">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Age</p>
                                <p className="font-medium text-black">{student.age}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Gender</p>
                                <p className="font-medium text-black">{student.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Course</p>
                                <p className="font-medium text-black">{student.course}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Contact</p>
                                <p className="font-medium text-black">{student.contact}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium text-black">{student.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Create Options Card (Main Content) */}
                    {showCreateOptions && (
                        <div className="mb-8 flex justify-center">
                            <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                                <h2 className="mb-4 text-xl font-semibold text-black">Create Consultation</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <button
                                        className="w-full rounded-lg bg-[#A3386C] py-3 text-white hover:bg-[#77536A]"
                                        onClick={() => handleNavigation(`/consultation/student/${id}/walk-in`)}
                                    >
                                        Walk-in
                                    </button>
                                    <button
                                        className="w-full rounded-lg border border-[#A3386C] bg-white py-3 text-[#A3386C] hover:bg-[#f9f5f6]"
                                        onClick={() => handleNavigation(`/consultation/student/${id}/scheduled`)}
                                    >
                                        Scheduled
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabbed Interface */}
                    <div className="mb-8">
                        <div className="mb-4 flex space-x-4">
                            <button
                                className={`rounded-lg px-4 py-2 ${activeTab === 'medicalHistory' ? 'bg-[#D4A5B8] text-black' : 'text-black hover:bg-[#D4A5B8]'}`}
                                onClick={() => setActiveTab('medicalHistory')}
                            >
                                Medical History
                            </button>
                            <button
                                className={`rounded-lg px-4 py-2 ${activeTab === 'consultations' ? 'bg-[#D4A5B8] text-black' : 'text-black hover:bg-[#D4A5B8]'}`}
                                onClick={() => setActiveTab('consultations')}
                            >
                                Past Consultations
                            </button>
                            <button
                                className={`rounded-lg px-4 py-2 ${activeTab === 'remarks' ? 'bg-[#D4A5B8] text-black' : 'text-black hover:bg-[#D4A5B8]'}`}
                                onClick={() => setActiveTab('remarks')}
                            >
                                Remark Records
                            </button>
                            <button
                                className={`rounded-lg px-4 py-2 ${activeTab === 'additionalProfile' ? 'bg-[#D4A5B8] text-black' : 'text-black hover:bg-[#D4A5B8]'}`}
                                onClick={() => setActiveTab('additionalProfile')}
                            >
                                Additional Profile
                            </button>
                        </div>
                        <div>{tabContent[activeTab]}</div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentProfile;
