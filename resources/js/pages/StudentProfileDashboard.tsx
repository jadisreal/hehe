import { router } from '@inertiajs/react';
import { Activity, AlertCircle, Heart, Menu, Save, Stethoscope, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import { UserService } from '../services/userService';
import { StudentOnlyRoute } from '../utils/RouteGuard';

interface StudentProfileData {
    // Basic Information
    lastName: string;
    firstName: string;
    middleInitial: string;
    suffix: string;
    dateOfBirth: string;
    nationality: string;
    civilStatus: string;
    address: string;

    // Guardian Information
    guardianName: string;
    guardianContact: string;

    // Physical Information
    bloodType: string;
    height: string;
    religion: string;
    eyeColor: string;

    // Medical Information
    chronicConditions: string;
    knownAllergies: string;
    disabilities: string;
    immunizationHistory: string;
    geneticConditions: string;
}

const StudentProfileDashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [profileData, setProfileData] = useState<StudentProfileData>({
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
        chronicConditions: '',
        knownAllergies: '',
        disabilities: '',
        immunizationHistory: '',
        geneticConditions: '',
    });

    useEffect(() => {
        loadStudentProfile();
    }, []);

    const loadStudentProfile = async () => {
        try {
            const user = UserService.getCurrentUser();
            if (!user) {
                handleLogout();
                return;
            }

            // Try to load existing profile data
            const response = await fetch('/api/student/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin', // Include cookies for session-based auth
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.profile) {
                    setProfileData({
                        lastName: data.profile.last_name || '',
                        firstName: data.profile.first_name || '',
                        middleInitial: data.profile.middle_initial || '',
                        suffix: data.profile.suffix || '',
                        dateOfBirth: data.profile.date_of_birth || '',
                        nationality: data.profile.nationality || '',
                        civilStatus: data.profile.civil_status || '',
                        address: data.profile.address || '',
                        guardianName: data.profile.guardian_name || '',
                        guardianContact: data.profile.guardian_contact || '',
                        bloodType: data.profile.blood_type || '',
                        height: data.profile.height || '',
                        religion: data.profile.religion || '',
                        eyeColor: data.profile.eye_color || '',
                        chronicConditions: data.profile.chronic_conditions || '',
                        knownAllergies: data.profile.known_allergies || '',
                        disabilities: data.profile.disabilities || '',
                        immunizationHistory: data.profile.immunization_history || '',
                        geneticConditions: data.profile.genetic_conditions || '',
                    });
                }
            }
        } catch (error) {
            console.error('Error loading student profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof StudentProfileData, value: string) => {
        setProfileData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Required fields validation
        if (!profileData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!profileData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!profileData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!profileData.guardianContact.trim()) newErrors.guardianContact = 'Guardian contact is required';

        // Validate date of birth (must be in the past)
        if (profileData.dateOfBirth) {
            const birthDate = new Date(profileData.dateOfBirth);
            const today = new Date();
            if (birthDate >= today) {
                newErrors.dateOfBirth = 'Date of birth must be in the past';
            }
        }

        // Validate phone number format (basic validation)
        if (profileData.guardianContact && !/^\+?[\d\s\-\(\)]{7,}$/.test(profileData.guardianContact)) {
            newErrors.guardianContact = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Save should update an existing profile linked to patient's id.
            const patientId = await UserService.getStudentPatientId();
            if (!patientId) throw new Error('No patient id available');

            const response = await fetch(`/api/student/profile/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    last_name: profileData.lastName,
                    first_name: profileData.firstName,
                    middle_initial: profileData.middleInitial,
                    suffix: profileData.suffix,
                    date_of_birth: profileData.dateOfBirth,
                    nationality: profileData.nationality,
                    civil_status: profileData.civilStatus,
                    address: profileData.address,
                    guardian_name: profileData.guardianName,
                    guardian_contact: profileData.guardianContact,
                    blood_type: profileData.bloodType,
                    height: profileData.height,
                    religion: profileData.religion,
                    eye_color: profileData.eyeColor,
                    chronic_conditions: profileData.chronicConditions,
                    known_allergies: profileData.knownAllergies,
                    disabilities: profileData.disabilities,
                    immunization_history: profileData.immunizationHistory,
                    genetic_conditions: profileData.geneticConditions,
                }),
            });

            if (response.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
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
                activeMenu="student-dashboard"
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
                            <h1 className="text-[28px] font-semibold text-white">STUDENT PROFILE</h1>
                        </div>
                        <div className="flex items-center">
                            <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-white p-6">
                    {/* Success Message */}
                    {saveSuccess && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Stethoscope className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Profile Saved Successfully!</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>Your profile information has been updated.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* General Error Message */}
                    {errors.general && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{errors.general}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Form */}
                    <div className="space-y-8">
                        {/* Basic Information Section */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                            <div className="mb-6 flex items-center">
                                <div className="mr-3 rounded-full bg-blue-100 p-3">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                            errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter last name"
                                    />
                                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                            errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter first name"
                                    />
                                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Middle Initial</label>
                                    <input
                                        type="text"
                                        maxLength={1}
                                        value={profileData.middleInitial}
                                        onChange={(e) => handleInputChange('middleInitial', e.target.value.toUpperCase())}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="M"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Suffix</label>
                                    <select
                                        value={profileData.suffix}
                                        onChange={(e) => handleInputChange('suffix', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select suffix</option>
                                        <option value="Jr.">Jr.</option>
                                        <option value="Sr.">Sr.</option>
                                        <option value="II">II</option>
                                        <option value="III">III</option>
                                        <option value="IV">IV</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={profileData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                            errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nationality/Citizenship</label>
                                    <input
                                        type="text"
                                        value={profileData.nationality}
                                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="e.g., Filipino"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Civil Status</label>
                                    <select
                                        value={profileData.civilStatus}
                                        onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Religion/Faith</label>
                                    <input
                                        type="text"
                                        value={profileData.religion}
                                        onChange={(e) => handleInputChange('religion', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="e.g., Catholic, Protestant, Islam"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea
                                    value={profileData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter complete address"
                                />
                            </div>
                        </div>

                        {/* Guardian Information Section */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                            <div className="mb-6 flex items-center">
                                <div className="mr-3 rounded-full bg-green-100 p-3">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Guardian Information</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Guardian's Name</label>
                                    <input
                                        type="text"
                                        value={profileData.guardianName}
                                        onChange={(e) => handleInputChange('guardianName', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Enter guardian's full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Guardian's Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.guardianContact}
                                        onChange={(e) => handleInputChange('guardianContact', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                            errors.guardianContact ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., +63 912 345 6789"
                                    />
                                    {errors.guardianContact && <p className="mt-1 text-sm text-red-600">{errors.guardianContact}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Physical Information Section */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                            <div className="mb-6 flex items-center">
                                <div className="mr-3 rounded-full bg-purple-100 p-3">
                                    <Activity className="h-6 w-6 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Physical Information</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                                    <select
                                        value={profileData.bloodType}
                                        onChange={(e) => handleInputChange('bloodType', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Height</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            value={profileData.height}
                                            onChange={(e) => handleInputChange('height', e.target.value)}
                                            className="block w-full rounded-l-md border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="170"
                                        />
                                        <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                            cm
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Eye Color</label>
                                    <select
                                        value={profileData.eyeColor}
                                        onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select eye color</option>
                                        <option value="Brown">Brown</option>
                                        <option value="Black">Black</option>
                                        <option value="Blue">Blue</option>
                                        <option value="Green">Green</option>
                                        <option value="Gray">Gray</option>
                                        <option value="Hazel">Hazel</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Medical Information Section */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                            <div className="mb-6 flex items-center">
                                <div className="mr-3 rounded-full bg-red-100 p-3">
                                    <Heart className="h-6 w-6 text-red-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Medical Information</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chronic Condition(s)</label>
                                    <textarea
                                        value={profileData.chronicConditions}
                                        onChange={(e) => handleInputChange('chronicConditions', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="List any chronic conditions (e.g., asthma, diabetes, hypertension). Enter 'None' if no conditions."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Known Allergies</label>
                                    <textarea
                                        value={profileData.knownAllergies}
                                        onChange={(e) => handleInputChange('knownAllergies', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="List any known allergies (food, medications, environmental). Enter 'None' if no allergies."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Disabilities</label>
                                    <textarea
                                        value={profileData.disabilities}
                                        onChange={(e) => handleInputChange('disabilities', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="List any disabilities or special accommodations needed. Enter 'None' if no disabilities."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Immunization History</label>
                                    <textarea
                                        value={profileData.immunizationHistory}
                                        onChange={(e) => handleInputChange('immunizationHistory', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="List all immunizations with dates (e.g., COVID-19 vaccine - March 2023, Hepatitis B - completed series 2020)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Genetic Conditions</label>
                                    <textarea
                                        value={profileData.geneticConditions}
                                        onChange={(e) => handleInputChange('geneticConditions', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="List any known genetic conditions or family history of genetic disorders. Enter 'None' if no genetic conditions."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-[#A3386C] px-6 py-3 text-white transition-colors hover:bg-[#8a2f5a] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Wrap the Student Profile Dashboard with student-only route protection
const ProtectedStudentProfileDashboard: React.FC = () => {
    return (
        <StudentOnlyRoute>
            <StudentProfileDashboard />
        </StudentOnlyRoute>
    );
};

export default ProtectedStudentProfileDashboard;
