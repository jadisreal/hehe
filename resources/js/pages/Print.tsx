import { router } from '@inertiajs/react';
import { Menu, Printer } from 'lucide-react';
import React, { useState } from 'react';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar'; // Import Sidebar
import { StaffOnlyRoute } from '../utils/RouteGuard';

const Print: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    // NotificationBell will fetch notifications itself

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        localStorage.removeItem('isLoggedIn');
        router.visit('/');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Function to trigger the browser's print dialog
    const handlePrint = () => {
        window.print();
    };

    const [activePrintTab, setActivePrintTab] = useState<'inventory' | 'prescription'>('inventory');
    // Sample data for the printable report
    const printData = [
        { name: 'RITEMED Paracetamol 500mg', stock: 150, expiration: '2026-12-31' },
        { name: 'DECOLGEN Forte', stock: 45, expiration: '2025-11-20' },
        { name: 'Cetirizine (Allerkid)', stock: 80, expiration: '2027-05-10' },
        { name: 'Neozep Forte', stock: 120, expiration: '2026-08-15' },
    ];

    const currentDate = 'July 28, 2025';

    // Use sample printData as inventoryData for the table
    const inventoryData = printData;

    return (
        <>
            {/* These styles will be applied only when printing */}
            <style>
                {`
                    @media print {
                        /* Hide everything on the page by default */
                        body * {
                            visibility: hidden;
                        }
                        /* Then, make the printable area and its children visible */
                        .printable-area, .printable-area * {
                            visibility: visible;
                        }
                        /* Position the printable area to the top-left corner */
                        .printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        /* Hide the print controls when printing */
                        .print-controls {
                            display: none;
                        }
                    }
                `}
            </style>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    isSearchOpen={isSearchOpen}
                    setSearchOpen={setSearchOpen}
                    isInventoryOpen={isInventoryOpen}
                    setInventoryOpen={setInventoryOpen}
                    handleNavigation={handleNavigation}
                    handleLogout={handleLogout}
                    activeMenu="print" // <-- Highlight About as active
                />

                {/* Main Content */}
                <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    {/* Header */}
                    <header className="z-10 border-b border-gray-200 bg-gradient-to-b from-[#3D1528] to-[#A3386C] px-7 py-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            {/* Sidebar Toggle Button */}
                            <button onClick={toggleSidebar} className="rounded-full p-2 text-white hover:bg-white/20">
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="flex items-center">
                                <img src="/images/Logo.png" alt="UIC Logo" className="mr-2 h-15 w-15" />
                                <h1 className="text-[28px] font-semibold text-white">UIC MediCare</h1>
                            </div>
                            {/* Notification Bell */}
                            <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                        </div>
                    </header>

                    {/* Main Print Container */}
                    <style>
                        {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .printable-area, .printable-area * {
                            visibility: visible;
                        }
                        .printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .print-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                            font-size: 14px;
                        }
                        .print-table th,
                        .print-table td {
                            border: 1px solid #333;
                            padding: 12px;
                            text-align: left;
                        }
                        .print-table th {
                            background-color: #f8f9fa;
                            font-weight: 600;
                        }
                        .prescription-print-container {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            padding: 0;
                        }
                        .prescription-image {
                            max-width: 100%;
                            max-height: 100vh;
                            object-fit: contain;
                            margin: 0;
                            padding: 0;
                        }
                    }
                `}
                    </style>

                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Print Documents</h1>
                                        <p className="text-gray-600">Select document type to print</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            className={`rounded-lg px-5 py-2.5 font-medium transition-colors ${
                                                activePrintTab === 'inventory'
                                                    ? 'bg-[#A3386C] text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                            onClick={() => setActivePrintTab('inventory')}
                                        >
                                            Inventory Report
                                        </button>
                                        <button
                                            className={`rounded-lg px-5 py-2.5 font-medium transition-colors ${
                                                activePrintTab === 'prescription'
                                                    ? 'bg-[#A3386C] text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                            onClick={() => setActivePrintTab('prescription')}
                                        >
                                            Prescription
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    {activePrintTab === 'inventory' ? (
                                        <div>
                                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">Inventory Report</h2>
                                                    <p className="text-gray-600">Generated on: {currentDate}</p>
                                                </div>
                                                <button
                                                    onClick={handlePrint}
                                                    className="flex items-center gap-2 rounded-lg bg-[#A3386C] px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-[#8a2f58]"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                    Print Report
                                                </button>
                                            </div>

                                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                Medicine Name
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                Current Stock
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                Expiration Date
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {inventoryData.map((item, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                                    {item.name}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                    {item.stock} units
                                                                </td>
                                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                    {item.expiration}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">Prescription</h2>
                                                    <p className="text-gray-600">Print prescription form</p>
                                                </div>
                                                <button
                                                    onClick={handlePrint}
                                                    className="flex items-center gap-2 rounded-lg bg-[#A3386C] px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-[#8a2f58]"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                    Print Prescription
                                                </button>
                                            </div>

                                            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                                <div className="mb-4">
                                                    <Printer className="mx-auto h-12 w-12 text-gray-400" />
                                                </div>
                                                <h3 className="mb-2 text-lg font-medium text-gray-900">Prescription Form Ready</h3>
                                                <p className="mb-4 text-gray-600">Click print to continue.</p>
                                                <div className="text-sm text-gray-500">
                                                    <p>Official Rx Prescription format</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Print Area - Only visible during printing */}
            <div className="printable-area">
                {activePrintTab === 'inventory' ? (
                    <div className="p-8">
                        <h1 className="mb-2 text-center text-2xl font-bold">Inventory Report</h1>
                        <p className="mb-6 text-center text-gray-600">Generated on: {currentDate}</p>
                        <table className="print-table">
                            <thead>
                                <tr>
                                    <th>Medicine Name</th>
                                    <th>Current Stock</th>
                                    <th>Expiration Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.stock} units</td>
                                        <td>{item.expiration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="prescription-print-container">
                        <img
                            src="/rx-prescription.png"
                            alt="Prescription"
                            className="prescription-image"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/rx-prescription.png';
                            }}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

// Wrap the Print component with staff-only route protection
const ProtectedPrint: React.FC = () => {
    return (
        <StaffOnlyRoute>
            <Print />
        </StaffOnlyRoute>
    );
};

export default ProtectedPrint;
