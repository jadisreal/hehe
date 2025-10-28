// resources/js/pages/Consultation/EmployeeProfile.tsx
import { router, usePage } from '@inertiajs/react';
import { Menu, Plus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import NotificationBell from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { Employee as EmployeeType } from '../../data/mockData';
import { employeeService } from '../../services/employeeService.fixed';
import { shouldRefreshData } from '../../utils/dataRefresh';

const EmployeeProfile: React.FC = () => {
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

    // State for employee data
    const [employee, setEmployee] = useState<EmployeeType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const lastCheckRef = useRef(Date.now());

    // Fetch employee from API - use a key to force remount/refetch
    useEffect(() => {
        // Function to fetch employee data - moved inside useEffect to avoid dependency issues
        const fetchEmployee = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                // Add timestamp parameter to bust cache
                const timestamp = Date.now();
                const employeeData = await employeeService.getEmployeeById(id, timestamp);
                console.log('Fetched employee data with consultations:', employeeData);
                setEmployee(employeeData);
                lastCheckRef.current = timestamp;
            } catch (error) {
                console.error('Error fetching employee:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployee();

        // Set up an interval to refresh data every 3 seconds while page is open
        const refreshInterval = setInterval(() => {
            if (shouldRefreshData(lastCheckRef.current)) {
                console.log('Data change detected, refreshing employee data...');
                fetchEmployee();
            } else {
                console.log('Checking for data updates...');
            }
        }, 3000);

        // Listen for data update events
        const handleDataUpdate = () => {
            console.log('Data update event received, refreshing data...');
            fetchEmployee();
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
                <p className="text-xl text-gray-600">Loading employee data...</p>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl text-gray-600">Employee not found</p>
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
                        {employee.medicalHistory.map((item: any, index: number) => (
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
                        {employee.consultations.map((item: any, index: number) => (
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
                        {employee.remarks.map((item: any, index: number) => (
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
                        <p className="font-medium text-black">{employee.additionalProfile?.lastName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.firstName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Middle Initial</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.middleInitial || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Suffix</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.suffix || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.dateOfBirth || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Nationality/Citizenship</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.nationality || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Civil Status</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.civilStatus || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.address || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Guardian's Name</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.guardianName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Guardian's Contact Number</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.guardianContact || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Blood Type</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.bloodType || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.height || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Religion/Faith</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.religion || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Eye Color</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.eyeColor || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Chronic Condition(s)</p>
                        <p className="font-medium text-black">
                            {employee.additionalProfile?.chronicConditions
                                ? employee.additionalProfile.chronicConditions.join(', ') || 'None'
                                : 'None'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Known Allergies</p>
                        <p className="font-medium text-black">
                            {employee.additionalProfile?.knownAllergies ? employee.additionalProfile.knownAllergies.join(', ') || 'None' : 'None'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Disabilities</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.disabilities || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Immunization History</p>
                        <p className="font-medium text-black">
                            {employee.additionalProfile?.immunizationHistory
                                ? employee.additionalProfile.immunizationHistory.join(', ') || 'None'
                                : 'None'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Genetic Conditions</p>
                        <p className="font-medium text-black">{employee.additionalProfile?.geneticConditions || 'None'}</p>
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
                        <h1 className="text-3xl font-bold text-black">Employee Profile: {employee.name}</h1>
                        <div>
                            <button
                                className="rounded-full bg-[#A3386C] p-2 text-white hover:bg-[#77536A]"
                                onClick={() => handleNavigation(`/consultation/employee/${id}/create`)}
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-black">Personal Information</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-black">{employee.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Age</p>
                                <p className="font-medium text-black">{employee.age}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Gender</p>
                                <p className="font-medium text-black">{employee.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Department</p>
                                <p className="font-medium text-black">{employee.department}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Position</p>
                                <p className="font-medium text-black">{employee.position}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Contact</p>
                                <p className="font-medium text-black">{employee.contact}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium text-black">{employee.address}</p>
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
                                        onClick={() => handleNavigation(`/consultation/employee/${id}/walk-in`)}
                                    >
                                        Walk-in
                                    </button>
                                    <button
                                        className="w-full rounded-lg border border-[#A3386C] bg-white py-3 text-[#A3386C] hover:bg-[#f9f5f6]"
                                        onClick={() => handleNavigation(`/consultation/employee/${id}/scheduled`)}
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

export default EmployeeProfile;
