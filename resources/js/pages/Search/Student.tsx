// resources/js/pages/Search/Student.tsx
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NotificationBell from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { Student as StudentType } from '../../data/mockData';
import { studentService } from '../../services/studentService';
import { StaffOnlyRoute } from '../../utils/RouteGuard';

const Student: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'lastName' | 'course'>('lastName');
    const [searchTerm, setSearchTerm] = useState('');

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        console.log('Logout clicked');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // NotificationBell will fetch notifications itself

    // State for student data
    const [students, setStudents] = useState<StudentType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Fetch students from API
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentData = await studentService.getAllStudents();
                setStudents(studentData);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Filter and sort students
    const filteredAndSortedStudents = students
        .filter(
            (student: StudentType) =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.id.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a: StudentType, b: StudentType) => {
            if (sortBy === 'lastName') {
                const lastNameA = a.name.split(' ').pop() || '';
                const lastNameB = b.name.split(' ').pop() || '';
                return lastNameA.localeCompare(lastNameB);
            } else {
                return a.course.localeCompare(b.course);
            }
        });

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
                <header className="z-10 border-b border-gray-200 bg-gradient-to-b from-[#3D1528] to-[#A3386C] px-7 py-3 shadow-sm print:hidden">
                    <div className="flex items-center justify-between">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="rounded-full p-2 text-white hover:bg-white/20">
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
                    <h1 className="mb-6 text-3xl font-bold text-gray-800">Student Patients</h1>

                    {/* Search and Sort Controls */}
                    <div className="mb-6 flex flex-wrap items-center gap-4">
                        <div className="min-w-[200px] flex-1">
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black outline-none focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="font-medium text-black">Sort by:</label>
                            <select
                                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-black outline-none focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C]"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'lastName' | 'course')}
                            >
                                <option value="lastName">Last Name</option>
                                <option value="course">Course</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#D4A5B8] text-black">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Age</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Gender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Course</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-black">
                                            Loading students...
                                        </td>
                                    </tr>
                                ) : filteredAndSortedStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-black">
                                            No students found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedStudents.map((student: StudentType) => (
                                        <tr
                                            key={student.id}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => router.visit(`/consultation/student/${student.id}`)}
                                        >
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{student.id}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{student.name}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{student.age}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{student.gender}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{student.course}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Wrap the Student Search component with staff-only route protection
const ProtectedStudentSearch: React.FC = () => {
    return (
        <StaffOnlyRoute>
            <Student />
        </StaffOnlyRoute>
    );
};

export default ProtectedStudentSearch;
