import {
    Archive,
    Briefcase,
    ChevronDown,
    FileText,
    GraduationCap,
    History,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Package,
    Printer,
    Search,
    ShieldQuestion,
    User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { UserService } from '../services/userService';
import LogoutModal from './LogoutModal';

interface SidebarProps {
    isSidebarOpen: boolean;
    isSearchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    isInventoryOpen: boolean;
    setInventoryOpen: (open: boolean) => void;
    handleNavigation: (path: string) => void;
    handleLogout: () => void;
    activeMenu: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    isSearchOpen,
    setSearchOpen,
    isInventoryOpen,
    setInventoryOpen,
    handleNavigation,
    handleLogout,
    activeMenu,
}) => {
    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
    const currentUser = UserService.getCurrentUser();

    // Debug logging
    console.log('🔍 Sidebar - Current user from localStorage:', currentUser);

    // Helper function to check if current user is a doctor
    const isDoctor =
        typeof currentUser?.role === 'string' ? currentUser.role.toLowerCase() === 'doctor' : currentUser?.role?.name?.toLowerCase() === 'doctor';
    console.log('🩺 Is user a doctor?', isDoctor, 'Role:', currentUser?.role);

    // Helper function to check if current user is a student
    const isStudent =
        typeof currentUser?.role === 'string' ? currentUser.role.toLowerCase() === 'student' : currentUser?.role?.name?.toLowerCase() === 'student';
    console.log('🎓 Is user a student?', isStudent, 'Role:', currentUser?.role);

    // derive current path to auto-open the Search submenu and highlight child
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const activeSearchChild = currentPath.startsWith('/search/student') ? 'student' : currentPath.startsWith('/search/employee') ? 'employee' : null;

    useEffect(() => {
        // If the user is on any /search/* route, ensure the Search submenu is open
        if (currentPath.startsWith('/search') && !isSearchOpen) {
            setSearchOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPath]);

    const handleLogoutConfirm = () => {
        // Clear client-side session storage
        UserService.clearUserSession();

        // Attempt server-side logout then redirect to login page.
        // Use fetch so we can trigger a full page redirect after logout.
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({}),
        }).finally(() => {
            // Ensure we land on the login page regardless of the response
            window.location.href = '/';
        });
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 z-20 flex h-screen flex-col bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}
            >
                {/* Profile */}
                <div className="mt-4 border-b border-white/50 p-6">
                    <div className="mb-2 flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                            <User className="h-6 w-6 text-[#A3386C]" />
                        </div>
                        <div className={`flex flex-col items-center transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-[20px] font-semibold">{currentUser?.name || 'John Doe'}</p>
                            <p className="text-sm">{typeof currentUser?.role === 'string' ? currentUser.role : currentUser?.role?.name || 'Nurse'}</p>
                        </div>
                    </div>
                    <p className={`text-center text-xs transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                        Main Campus
                    </p>
                </div>

                {/* Navigation */}
                <nav className="mt-8 flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-2 overflow-y-auto px-4" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                        {/* Student Dashboard - Only visible for students */}
                        {isStudent && (
                            <div
                                className={`flex cursor-pointer items-center rounded-lg px-4 py-3 ${activeMenu === 'student-dashboard' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                onClick={() => {
                                    console.log('🎓 Student Dashboard clicked in sidebar');
                                    handleNavigation('/student/profile-dashboard');
                                }}
                            >
                                <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <p className="ml-3 text-sm font-medium whitespace-nowrap text-white">My Profile</p>}
                            </div>
                        )}

                        {/* Dashboard - Hidden for students */}
                        {!isStudent && (
                            <div
                                className={`flex cursor-pointer items-center rounded-lg px-4 py-3 ${activeMenu === 'dashboard' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                onClick={() => {
                                    console.log('🏠 Dashboard clicked in sidebar');
                                    handleNavigation('/dashboard');
                                }}
                            >
                                <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <p className="ml-3 text-sm font-medium whitespace-nowrap text-white">Dashboard</p>}
                            </div>
                        )}

                        {/* Search Submenu - Hidden for doctors and students */}
                        {!isDoctor && !isStudent && (
                            <div>
                                <div
                                    className={`flex cursor-pointer items-center rounded-lg px-4 py-3 ${activeMenu === 'search' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                    onClick={() => setSearchOpen(!isSearchOpen)}
                                >
                                    <Search className="h-5 w-5 flex-shrink-0 text-white" />
                                    {isSidebarOpen && (
                                        <div className="flex w-full items-center justify-between">
                                            <p className="ml-3 text-sm whitespace-nowrap text-white">Search</p>
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform duration-200 ${isSearchOpen ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${isSidebarOpen && isSearchOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} `}
                                >
                                    {isSidebarOpen && (
                                        <div className="mt-1 space-y-1 pl-8">
                                            <div
                                                className={`flex cursor-pointer items-center rounded-lg p-2 ${activeMenu === 'search' && activeSearchChild === 'student' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                                onClick={() => {
                                                    console.log('🎓 Student clicked in sidebar');
                                                    handleNavigation('/search/student');
                                                }}
                                            >
                                                <GraduationCap className="h-5 w-5 flex-shrink-0 text-white" />
                                                <p className="ml-3 text-sm whitespace-nowrap text-white">Student</p>
                                            </div>
                                            <div
                                                className={`flex cursor-pointer items-center rounded-lg p-2 ${activeMenu === 'search' && activeSearchChild === 'employee' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                                onClick={() => {
                                                    console.log('💼 Employee clicked in sidebar');
                                                    handleNavigation('/search/employee');
                                                }}
                                            >
                                                <Briefcase className="h-5 w-5 flex-shrink-0 text-white" />
                                                <p className="ml-3 text-sm whitespace-nowrap text-white">Employee</p>
                                            </div>
                                            {/* Community removed per request */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Inventory Submenu - Hidden for doctors and students */}
                        {!isDoctor && !isStudent && (
                            <div>
                                <div
                                    className={`flex cursor-pointer items-center rounded-lg px-4 py-3 ${activeMenu === 'inventory' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                    onClick={() => setInventoryOpen(!isInventoryOpen)}
                                >
                                    <Archive className="h-5 w-5 flex-shrink-0 text-white" />
                                    {isSidebarOpen && (
                                        <div className="flex w-full items-center justify-between">
                                            <p className="ml-3 text-sm whitespace-nowrap text-white">Inventory</p>
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform duration-200 ${isInventoryOpen ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${isSidebarOpen && isInventoryOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} `}
                                >
                                    {isSidebarOpen && (
                                        <div className="mt-1 space-y-1 pl-8">
                                            <div
                                                className={`flex cursor-pointer items-center rounded-lg p-2 ${activeMenu === 'inventory-dashboard' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                                onClick={() => handleNavigation('/inventory/dashboard')}
                                            >
                                                <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-white" />
                                                <p className="ml-3 text-sm whitespace-nowrap text-white">Dashboard</p>
                                            </div>
                                            <div
                                                className={`flex cursor-pointer items-center rounded-lg p-2 ${activeMenu === 'inventory-stocks' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                                onClick={() => {
                                                    console.log('📦 Inventory Stocks clicked in sidebar');
                                                    handleNavigation('/inventory/stocks');
                                                }}
                                            >
                                                <Package className="h-5 w-5 flex-shrink-0 text-white" />
                                                <p className="ml-3 text-sm whitespace-nowrap text-white">Stocks</p>
                                            </div>
                                            <div
                                                className={`flex cursor-pointer items-center rounded-lg p-2 ${activeMenu === 'inventory-history' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                                onClick={() => {
                                                    console.log('📋 Inventory History clicked in sidebar');
                                                    handleNavigation('/inventory/history');
                                                }}
                                            >
                                                <History className="h-5 w-5 flex-shrink-0 text-white" />
                                                <p className="ml-3 text-sm whitespace-nowrap text-white">History</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reports - Hidden for doctors and students */}
                        {!isDoctor && !isStudent && (
                            <div
                                className={`flex cursor-pointer items-center rounded-lg px-4 py-3 ${activeMenu === 'reports' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                onClick={() => {
                                    console.log('📄 Reports clicked in sidebar');
                                    handleNavigation('/Reports');
                                }}
                            >
                                <FileText className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <p className="ml-3 text-sm whitespace-nowrap text-white">Reports</p>}
                            </div>
                        )}

                        {/* Print - Hidden for students */}
                        {!isStudent && (
                            <div
                                className={`flex cursor-pointer items-center rounded-lg px-4 py-3 ${activeMenu === 'print' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                onClick={() => {
                                    console.log('🖨️ Print clicked in sidebar');
                                    handleNavigation('/Print');
                                }}
                            >
                                <Printer className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <p className="ml-3 text-sm whitespace-nowrap text-white">Print</p>}
                            </div>
                        )}

                        {/* About */}
                        <div
                            className={`flex cursor-pointer items-center rounded-lg px-4 py-3 ${activeMenu === 'about' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                            onClick={() => {
                                console.log('ℹ️ About clicked in sidebar');
                                handleNavigation('/About');
                            }}
                        >
                            <ShieldQuestion className="h-5 w-5 flex-shrink-0 text-white" />
                            {isSidebarOpen && <p className="ml-3 text-sm whitespace-nowrap text-white">About</p>}
                        </div>

                        {/* Chat - Hidden for students */}
                        {!isStudent && (
                            <div
                                className={`flex cursor-pointer items-center rounded-lg px-4 py-3 ${activeMenu === 'chat' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                onClick={() => {
                                    console.log('💬 Chat clicked in sidebar');
                                    handleNavigation('/Chat');
                                }}
                            >
                                <MessageSquare className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <p className="ml-3 text-sm whitespace-nowrap text-white">Chat</p>}
                            </div>
                        )}
                    </div>
                </nav>

                {/* Logout Button - Now opens the modal */}
                <div className="px-4 pb-6">
                    <div
                        className={`flex cursor-pointer items-center rounded-lg p-3 hover:bg-[#77536A] ${!isSidebarOpen && 'justify-center'}`}
                        onClick={() => setLogoutModalOpen(true)}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0 text-white" />
                        {isSidebarOpen && <p className="ml-3 text-sm whitespace-nowrap">Logout</p>}
                    </div>
                </div>
            </div>

            {/* Render the LogoutModal */}
            <LogoutModal isOpen={isLogoutModalOpen} setIsOpen={setLogoutModalOpen} onLogout={handleLogoutConfirm} />
        </>
    );
};

export default Sidebar;
