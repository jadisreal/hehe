import { router } from '@inertiajs/react';
import { Calendar, Menu, Stethoscope, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import { dashboardService, type DashboardStats, type RecentActivity } from '../services/dashboardService';
import { UserService } from '../services/userService';

interface DateTimeData {
    date: string;
    time: string;
}

function getCurrentDateTime(): DateTimeData {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
    return { date, time };
}

const Dashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalPatients: 0,
        todaysConsultations: 0,
        pendingAppointments: 0,
        completedConsultations: 0,
        currentConsultations: 0,
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Check user role and redirect students to their dashboard
    useEffect(() => {
        const checkUserRoleAndRedirect = async () => {
            try {
                // Check if user is a student
                const isStudent = await UserService.isStudent();
                if (isStudent) {
                    console.log('Student detected, redirecting to student dashboard');
                    router.visit('/student/dashboard');
                    return;
                }
            } catch (error) {
                console.error('Error checking user role:', error);
            }
        };

        checkUserRoleAndRedirect();
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getDashboardData();
                if (data) {
                    setDashboardStats(data.stats);
                    setRecentActivities(data.recentActivity);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleActivityRowClick = (activity: RecentActivity): void => {
        const profilePath =
            activity.patient_type === 'student' ? `/consultation/student/${activity.patient_id}` : `/consultation/employee/${activity.patient_id}`;
        router.visit(profilePath);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Dashboard data will be loaded via useEffect

    // NotificationBell will fetch notifications itself; no local dummy data needed

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

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-white p-6">
                    <div className="mb-8 flex flex-col items-center">
                        <p className="text-[22px] font-normal text-black">{date}</p>
                        <p className="mt-1 text-base text-[17px] text-gray-500">{time}</p>
                        <div className="mt-3 h-0.5 w-[130px] bg-[#A3386C]"></div>
                    </div>

                    <h1 className="mb-8 text-5xl font-bold text-black">Dashboard</h1>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                            <div className="flex items-center">
                                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">{dashboardStats.totalPatients}</p>
                                    <p className="text-gray-600">Total Registered Patients</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg"
                            onClick={() => router.visit('/todays-consultations')}
                        >
                            <div className="flex items-center">
                                <div className="rounded-full bg-green-100 p-3 text-green-600">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">{dashboardStats.todaysConsultations}</p>
                                    <p className="text-gray-600">Today's Consultations</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg"
                            onClick={() => router.visit('/pending-appointments')}
                        >
                            <div className="flex items-center">
                                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">{dashboardStats.completedConsultations}</p>
                                    <p className="text-gray-600">Completed Consultations</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Test Section removed per user request */}

                    {/* Current Consultations */}
                    <section className="mb-10">
                        <h2 className="mb-4 text-2xl font-normal text-black">Current Consultations:</h2>
                        <div className="space-y-4">
                            <div className="flex items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                                <p className="mr-4 text-4xl font-bold text-[#A3386C]">{dashboardStats.currentConsultations}</p>
                                <p className="text-xl text-gray-700">Completed Walk-in/Scheduled Consultations</p>
                            </div>
                            <div className="flex items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                                <p className="mr-4 text-4xl font-bold text-[#A3386C]">{dashboardStats.completedConsultations}</p>
                                <p className="text-xl text-gray-700">Doctor's Completed Consultations</p>
                            </div>
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section>
                        <h2 className="mb-4 text-2xl font-normal text-black">Recent Activity:</h2>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {recentActivities.map((activity) => (
                                        <tr
                                            key={activity.id}
                                            className="cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                                            onClick={() => handleActivityRowClick(activity)}
                                        >
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{activity.patient}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{activity.type}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{activity.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                                        activity.status === 'Completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {activity.status || 'Completed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
