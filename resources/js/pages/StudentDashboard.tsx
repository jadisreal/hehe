import { router } from '@inertiajs/react';
import { Calendar, Edit3, FileText, Heart, Menu, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import { UserService } from '../services/userService';

interface StudentInfo {
    id: string;
    name: string;
    studentId: string;
    course: string;
    yearLevel: string;
    email: string;
    lastVisit?: string;
    profileComplete: boolean;
}

const StudentDashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudentInfo();
    }, []);

    const loadStudentInfo = async () => {
        try {
            const user = UserService.getCurrentUser();
            if (!user) {
                handleLogout();
                return;
            }

            // Get student's patient ID
            const patientId = await UserService.getStudentPatientId();
            if (patientId) {
                // Fetch student profile data
                const response = await fetch(`/api/students/${patientId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setStudentInfo({
                        id: data.id,
                        name: data.name,
                        studentId: data.student?.student_id || 'N/A',
                        course: data.student?.course || 'N/A',
                        yearLevel: data.student?.year_level || 'N/A',
                        email: user.email,
                        lastVisit: data.last_visit,
                        profileComplete: checkProfileCompleteness(data),
                    });
                }
            } else {
                // Fallback to user data
                setStudentInfo({
                    id: user.user_id.toString(),
                    name: user.name,
                    studentId: 'N/A',
                    course: 'N/A',
                    yearLevel: 'N/A',
                    email: user.email,
                    profileComplete: false,
                });
            }
        } catch (error) {
            console.error('Error loading student info:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkProfileCompleteness = (data: any): boolean => {
        if (!data.profile) return false;

        const requiredFields = ['blood_type', 'height', 'date_of_birth', 'nationality', 'civil_status', 'guardian_contact'];

        return requiredFields.every((field) => data.profile[field]);
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const handleNavigation = (path: string) => {
        router.visit(path);
    };

    const handleLogout = () => {
        UserService.clearUserSession();
        router.visit('/login');
    };

    const handleEditProfile = () => {
        router.visit('/student/my-profile');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2 text-black">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

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
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="mb-4 text-5xl font-bold text-black">Student Dashboard</h1>
                        <p className="text-xl text-black">
                            Welcome back, <span className="font-semibold text-[#A3386C]">{studentInfo?.name}</span>
                        </p>
                    </div>

                    {/* Profile Status Card */}
                    <div className="mb-8">
                        <div
                            className={`rounded-lg border-l-4 p-6 shadow-md ${
                                studentInfo?.profileComplete ? 'border-green-400 bg-green-50' : 'border-yellow-400 bg-yellow-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div
                                        className={`mr-4 rounded-full p-3 ${
                                            studentInfo?.profileComplete ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}
                                    >
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-semibold ${studentInfo?.profileComplete ? 'text-black' : 'text-black'}`}>
                                            Profile Status
                                        </h3>
                                        <p className={`${studentInfo?.profileComplete ? 'text-black' : 'text-black'}`}>
                                            {studentInfo?.profileComplete
                                                ? 'Your profile is complete and up to date'
                                                : 'Your profile needs attention - some fields are missing'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleEditProfile}
                                    className="flex items-center rounded-lg bg-[#A3386C] px-4 py-2 text-white transition-colors hover:bg-[#8B2F5A]"
                                >
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Student Information Grid */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Basic Info Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 rounded-full bg-blue-100 p-2 text-blue-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-black">Basic Information</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-black">Student ID</p>
                                    <p className="font-medium text-black">{studentInfo?.studentId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-black">Course</p>
                                    <p className="font-medium text-black">{studentInfo?.course}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-black">Year Level</p>
                                    <p className="font-medium text-black">{studentInfo?.yearLevel}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 rounded-full bg-green-100 p-2 text-green-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-black">Recent Activity</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-black">Last Clinic Visit</p>
                                    <p className="font-medium text-black">
                                        {studentInfo?.lastVisit ? new Date(studentInfo.lastVisit).toLocaleDateString() : 'No recent visits'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-black">Profile Updated</p>
                                    <p className="font-medium text-black">Today</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 rounded-full bg-purple-100 p-2 text-purple-600">
                                    <Heart className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-black">Health Information</h3>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={handleEditProfile}
                                    className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                                >
                                    <div className="flex items-center">
                                        <FileText className="mr-3 h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-black">Update Medical Information</span>
                                    </div>
                                </button>
                                <button
                                    onClick={handleEditProfile}
                                    className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                                >
                                    <div className="flex items-center">
                                        <Edit3 className="mr-3 h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-black">Edit Personal Details</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Important Notice */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FileText className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Keep Your Information Updated</h3>
                                <div className="mt-2 text-sm text-black">
                                    <p>
                                        It's important to keep your medical and personal information up to date. This helps our medical staff provide
                                        you with the best possible care during your visits.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={handleEditProfile}
                                        className="rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-200"
                                    >
                                        Update Profile Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;
