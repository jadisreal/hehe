import { router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Check, FileText, Heart, Menu, Save, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import { UserService } from '../services/userService';

interface StudentProfileData {
    id: string;
    name: string;
    age: number;
    gender: string;
    address: string;
    contact: string;
    lastVisit?: string;
    studentInfo?: {
        studentId: string;
        course: string;
        yearLevel: string;
        department: string;
    };
    additionalProfile?: {
        lastName: string;
        firstName: string;
        middleInitial: string;
        suffix: string;
        dateOfBirth: string;
        nationality: string;
        civilStatus: string;
        address: string;
        guardianName: string;
        guardianContact: string;
        bloodType: string;
        height: string;
        religion: string;
        eyeColor: string;
        disabilities: string;
        geneticConditions: string;
    };
    medicalHistory?: Array<{
        condition: string;
        diagnosed: string;
    }>;
    consultations?: Array<{
        date: string;
        notes: string;
    }>;
    remarks?: Array<{
        date: string;
        note: string;
    }>;
}

interface FormErrors {
    [key: string]: string | null;
}

const StudentMyProfile: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('additionalProfile');
    const [student, setStudent] = useState<StudentProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Form data state
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        middleInitial: '',
        suffix: '',
        dateOfBirth: '',
        nationality: '',
        civilStatus: '',
        address: '',
        guardianName: '',
        guardianContact: '',
        bloodType: '',
        height: '',
        religion: '',
        eyeColor: '',
        disabilities: '',
        geneticConditions: '',
        // Basic info
        contact: '',
        currentAddress: '',
    });

    useEffect(() => {
        loadStudentProfile();
    }, []);

    const loadStudentProfile = async () => {
        try {
            const patientId = await UserService.getStudentPatientId();
            if (!patientId) {
                console.error('No patient ID found for student');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/students/${patientId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStudent(data);

                // Initialize form data
                setFormData({
                    lastName: data.additionalProfile?.lastName || '',
                    firstName: data.additionalProfile?.firstName || '',
                    middleInitial: data.additionalProfile?.middleInitial || '',
                    suffix: data.additionalProfile?.suffix || '',
                    dateOfBirth: data.additionalProfile?.dateOfBirth || '',
                    nationality: data.additionalProfile?.nationality || '',
                    civilStatus: data.additionalProfile?.civilStatus || '',
                    address: data.additionalProfile?.address || '',
                    guardianName: data.additionalProfile?.guardianName || '',
                    guardianContact: data.additionalProfile?.guardianContact || '',
                    bloodType: data.additionalProfile?.bloodType || '',
                    height: data.additionalProfile?.height || '',
                    religion: data.additionalProfile?.religion || '',
                    eyeColor: data.additionalProfile?.eyeColor || '',
                    disabilities: data.additionalProfile?.disabilities || '',
                    geneticConditions: data.additionalProfile?.geneticConditions || '',
                    contact: data.contact || '',
                    currentAddress: data.address || '',
                });
            } else {
                console.error('Failed to load student profile');
            }
        } catch (error) {
            console.error('Error loading student profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: null,
            }));
        }
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};

        // Required fields validation
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
        if (!formData.civilStatus.trim()) newErrors.civilStatus = 'Civil status is required';
        if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';

        // Format validation
        if (formData.contact && !/^09\d{9}$/.test(formData.contact)) {
            newErrors.contact = 'Contact must be in format 09XXXXXXXXX';
        }

        if (formData.guardianContact && !/^09\d{9}$/.test(formData.guardianContact)) {
            newErrors.guardianContact = 'Guardian contact must be in format 09XXXXXXXXX';
        }

        // Age validation for guardian requirement
        if (formData.dateOfBirth) {
            const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
            if (age < 18) {
                if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required for minors';
                if (!formData.guardianContact.trim()) newErrors.guardianContact = 'Guardian contact is required for minors';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        setErrors({});

        try {
            const patientId = await UserService.getStudentPatientId();
            if (!patientId) {
                throw new Error('No patient ID found');
            }

            const response = await fetch(`/api/student/profile/${patientId}`, {
                method: 'PUT',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                await loadStudentProfile();
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    throw new Error(errorData.message || 'Failed to save profile');
                }
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setErrors({ general: 'Failed to save profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const handleNavigation = (path: string) => {
        router.visit(path);
    };

    const handleLogout = () => {
        UserService.clearUserSession();
        router.visit('/login');
    };

    const handleBack = () => {
        router.visit('/student/dashboard');
    };

    const tabContent = {
        additionalProfile: (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                {/* Save Success Message */}
                {saveSuccess && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex">
                            <Check className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">Profile updated successfully!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* General Error Message */}
                {errors.general && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{errors.general}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Last Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none ${
                                errors.lastName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter last name"
                        />
                        {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none ${
                                errors.firstName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter first name"
                        />
                        {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>

                    {/* Middle Initial */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">Middle Initial</label>
                        <input
                            type="text"
                            value={formData.middleInitial}
                            onChange={(e) => handleInputChange('middleInitial', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                            placeholder="M.I."
                            maxLength={2}
                        />
                    </div>

                    {/* Suffix */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">Suffix</label>
                        <input
                            type="text"
                            value={formData.suffix}
                            onChange={(e) => handleInputChange('suffix', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                            placeholder="Jr., Sr., III, etc."
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none ${
                                errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                    </div>

                    {/* Nationality */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Nationality/Citizenship <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.nationality}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none ${
                                errors.nationality ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Filipino"
                        />
                        {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>}
                    </div>

                    {/* Civil Status */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Civil Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.civilStatus}
                            onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none ${
                                errors.civilStatus ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select civil status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                        {errors.civilStatus && <p className="mt-1 text-sm text-red-600">{errors.civilStatus}</p>}
                    </div>

                    {/* Contact Number */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.contact}
                            onChange={(e) => handleInputChange('contact', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none ${
                                errors.contact ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="09XXXXXXXXX"
                        />
                        {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
                    </div>

                    {/* Address - Full Width */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-black">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                            rows={2}
                            placeholder="Complete address"
                        />
                    </div>

                    {/* Guardian's Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Guardian's Name{' '}
                            {formData.dateOfBirth && new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() < 18 && (
                                <span className="text-red-500">*</span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={formData.guardianName}
                            onChange={(e) => handleInputChange('guardianName', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none ${
                                errors.guardianName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Guardian's full name"
                        />
                        {errors.guardianName && <p className="mt-1 text-sm text-red-600">{errors.guardianName}</p>}
                    </div>

                    {/* Guardian's Contact */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Guardian's Contact Number{' '}
                            {formData.dateOfBirth && new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() < 18 && (
                                <span className="text-red-500">*</span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={formData.guardianContact}
                            onChange={(e) => handleInputChange('guardianContact', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none ${
                                errors.guardianContact ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="09XXXXXXXXX"
                        />
                        {errors.guardianContact && <p className="mt-1 text-sm text-red-600">{errors.guardianContact}</p>}
                    </div>

                    {/* Blood Type */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">Blood Type</label>
                        <select
                            value={formData.bloodType}
                            onChange={(e) => handleInputChange('bloodType', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                        >
                            <option value="">Select blood type</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    {/* Height */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">Height</label>
                        <input
                            type="text"
                            value={formData.height}
                            onChange={(e) => handleInputChange('height', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                            placeholder="e.g., 170 cm"
                        />
                    </div>

                    {/* Religion */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">Religion/Faith</label>
                        <input
                            type="text"
                            value={formData.religion}
                            onChange={(e) => handleInputChange('religion', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                            placeholder="e.g., Catholic, Protestant, Islam"
                        />
                    </div>

                    {/* Eye Color */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">Eye Color</label>
                        <input
                            type="text"
                            value={formData.eyeColor}
                            onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                            placeholder="e.g., Brown, Black, Blue"
                        />
                    </div>

                    {/* Disabilities - Full Width */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-black">Disabilities</label>
                        <textarea
                            value={formData.disabilities}
                            onChange={(e) => handleInputChange('disabilities', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                            rows={2}
                            placeholder="Please list any disabilities or indicate 'None'"
                        />
                    </div>

                    {/* Genetic Conditions - Full Width */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-black">Genetic Conditions</label>
                        <textarea
                            value={formData.geneticConditions}
                            onChange={(e) => handleInputChange('geneticConditions', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#A3386C] focus:ring-2 focus:ring-[#A3386C] focus:outline-none"
                            rows={2}
                            placeholder="Please list any known genetic conditions or indicate 'None'"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center rounded-lg bg-[#A3386C] px-6 py-3 text-white transition-colors hover:bg-[#8B2F5A] focus:ring-2 focus:ring-[#A3386C] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Profile
                            </>
                        )}
                    </button>
                </div>
            </div>
        ),
        medicalHistory: (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                <div className="py-8 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Medical History</h3>
                    <p className="text-gray-500">Your medical history is maintained by healthcare professionals during consultations.</p>
                </div>
                {student?.medicalHistory && student.medicalHistory.length > 0 && (
                    <div className="mt-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Condition</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Date Diagnosed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {student.medicalHistory.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{item.condition}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{item.diagnosed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        ),
        consultations: (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                <div className="py-8 text-center">
                    <Heart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Consultation History</h3>
                    <p className="text-gray-500">Your consultation records are confidential and maintained by clinic staff.</p>
                </div>
                {student?.consultations && student.consultations.length > 0 && (
                    <div className="mt-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-black uppercase">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {student.consultations.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-black">{item.date}</td>
                                        <td className="px-6 py-4 text-sm text-black">{item.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        ),
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2 text-black">Loading your profile...</p>
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
                activeMenu="profile"
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
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-black">My Profile</h1>
                            <p className="mt-2 text-black">Update your personal information and medical details</p>
                        </div>
                    </div>

                    {/* Student Info Summary */}
                    {student && (
                        <div className="mb-6 rounded-lg bg-gradient-to-r from-[#A3386C] to-[#8B2F5A] p-6 text-white">
                            <div className="flex items-center">
                                <User className="mr-4 h-12 w-12" />
                                <div>
                                    <h2 className="text-2xl font-bold">{student.name}</h2>
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        <span>Student ID: {student.studentInfo?.studentId || 'N/A'}</span>
                                        <span>Course: {student.studentInfo?.course || 'N/A'}</span>
                                        <span>Year: {student.studentInfo?.yearLevel || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation and Content */}
                    <div className="rounded-lg bg-white shadow-md">
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className={`rounded-lg px-4 py-2 ${activeTab === 'additionalProfile' ? 'bg-[#D4A5B8] text-black' : 'text-black hover:bg-[#D4A5B8]'}`}
                                    onClick={() => setActiveTab('additionalProfile')}
                                >
                                    Personal Information
                                </button>
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
                                    Consultation History
                                </button>
                            </div>
                        </div>
                        <div className="p-6">{tabContent[activeTab]}</div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentMyProfile;
