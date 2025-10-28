import { router } from '@inertiajs/react';
import { Menu, Printer } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import { BranchInventoryService } from '../services/branchInventoryService';
import { UserService } from '../services/userService';
import { StaffOnlyRoute } from '../utils/RouteGuard';

// Add print-specific styles to the head
const printStyles = `
@media print {
    /* Hide everything by default, reveal printable area */
    body * { visibility: hidden; }
    #printable-area, #printable-area * { visibility: visible; }
    #printable-area { position: absolute; left: 0; top: 0; width: 100%; }

    /* Hide the right-side 'Commonly Used Medicine' card and let the chart use full width */
    .print-hide-right { display: none !important; }
    /* Prefer Letter (bondpaper) sizing but keep portrait fallback; reduce margins slightly for more room */
    @page { size: Letter portrait; margin: 12mm; }
    /* Keep a fallback for A4 if the printer uses that */
    @page :left { size: A4 portrait; margin: 20mm; }

    #printable-area { box-sizing: border-box; padding: 0; margin: 0; }
    /* Limit chart height to printable area minus header/footer to avoid overflow; slightly looser so labels fit */
    .print-expand-chart .h-72 { max-height: calc(100vh - 160px) !important; height: auto !important; }
    /* Ensure the chart container scales contents to fit */
    .print-expand-chart .recharts-wrapper { max-height: calc(100vh - 180px) !important; }
    /* Add additional right padding so chart doesn't touch the page edge on print (a bit more breathing room) */
    .print-expand-chart { padding-right: 25mm !important; }
}
`;

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);

// Chart data will be fetched from the backend (medicines table: name, medicine_stock_out)
type MedicineData = {
    name: string;
    medicine_stock_out: number;
    color?: string;
    percent?: number;
    category?: string;
};

// Placeholder images for items without image
const placeholderImage = (initial: string) => `https://placehold.co/60x40/9CA3AF/FFFFFF?text=${encodeURIComponent(initial)}`;

const Reports: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [chartData, setChartData] = useState<MedicineData[]>([]);
    const [loadingChart, setLoadingChart] = useState<boolean>(true);
    const [totalDispensed, setTotalDispensed] = useState<number>(0);
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const fallbackData: MedicineData[] = [{ name: 'No data', medicine_stock_out: 0, color: '#E5E7EB' }];

    // color palette to assign to medicines (will be used if DB color not provided)
    const colorPalette = ['#3B82F6', '#F97316', '#A855F7', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#06B6D4', '#F472B6', '#84CC16'];

    // NotificationBell will fetch notifications itself

    // Navigation and logout handlers
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

    const handlePrintReport = () => {
        console.log(`Preparing to print report...`);
        window.print();
    };

    useEffect(() => {
        // fetch medicines stock-out data from backend
        const fetchData = async () => {
            setLoadingChart(true);
            try {
                const currentUser = UserService.getCurrentUser();
                const paramsArr: string[] = [];
                if (currentUser) paramsArr.push(`user_id=${currentUser.user_id}`);
                if (selectedMonth !== 'all') paramsArr.push(`month=${selectedMonth}`);
                if (selectedYear) paramsArr.push(`year=${selectedYear}`);
                const params = paramsArr.length > 0 ? `?${paramsArr.join('&')}` : '';
                const url = `${window.location.origin}/api/medicines/stock-out${params}`;
                console.debug('Fetching medicine stock-out from', url);
                const res = await fetch(url, { credentials: 'same-origin' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                console.debug('Received chart data', data);
                // Expecting array of { name, medicine_stock_out, color? }
                const raw = data.map((d: any, i: number) => ({
                    name: d.name,
                    medicine_stock_out: Number(d.medicine_stock_out) || 0,
                    color: d.color || colorPalette[i % colorPalette.length],
                    category: d.category || d.medicine_category || d.medicineCategory || null,
                }));

                const totalCount = raw.reduce((s: number, r: MedicineData) => s + r.medicine_stock_out, 0);

                // compute integer percentages that sum to 100
                let withPercents = raw.map((r: MedicineData) => ({ ...(r as any), percent: 0 }));
                if (totalCount > 0) {
                    const floats: number[] = raw.map((r: MedicineData) => (r.medicine_stock_out / totalCount) * 100);
                    const floors: number[] = floats.map((f: number) => Math.floor(f));
                    const remainder = 100 - floors.reduce((a: number, b: number) => a + b, 0);
                    const fractions = floats
                        .map((f: number, idx: number) => ({ idx, frac: f - Math.floor(f) }))
                        .sort((a: any, b: any) => b.frac - a.frac);
                    const percents = floors.slice();
                    for (let k = 0; k < remainder; k++) {
                        percents[fractions[k].idx] = (percents[fractions[k].idx] || 0) + 1;
                    }
                    withPercents = raw.map((r: MedicineData, idx: number) => ({
                        ...(r as any),
                        percent: percents[idx],
                        medicine_stock_out: r.medicine_stock_out,
                    }));
                }
                // Fill missing categories from canonical medicines list
                try {
                    const meds = await BranchInventoryService.getAllMedicines();
                    const map = new Map<string, string>();
                    meds.forEach((m: any) =>
                        map.set((m.medicine_name || '').toString().toLowerCase(), m.medicine_category || m.category || 'Uncategorized'),
                    );
                    withPercents = withPercents.map((r: any) => ({
                        ...r,
                        category: r.category || map.get((r.name || '').toString().toLowerCase()) || 'Uncategorized',
                    }));
                } catch (e) {
                    // ignore and leave categories as-is
                }

                setTotalDispensed(totalCount);
                setChartData(withPercents as any);
            } catch (err) {
                console.error('Failed to load chart data', err);
                setChartData([]);
            } finally {
                setLoadingChart(false);
            }
        };
        fetchData();
        // refetch whenever month/year selection changes
    }, [selectedMonth, selectedYear]);

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
                activeMenu="reports"
            />
            <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="z-10 border-b border-gray-200 bg-gradient-to-b from-[#3D1528] to-[#A3386C] px-7 py-3 shadow-sm print:hidden">
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
                <main id="printable-area" className="flex-1 overflow-y-auto bg-white p-6">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 print:block">
                        <div className="lg:col-span-2">
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-2xl font-normal text-black">Overview</h3>
                                    <button
                                        onClick={handlePrintReport}
                                        className="flex items-center gap-2 rounded-lg bg-[#A3386C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8f2f5c] print:hidden"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print Report
                                    </button>
                                </div>
                                <div className="mb-4">
                                    <p className="font-medium text-gray-700">Dispensed Medicine: ({totalDispensed})</p>
                                </div>
                                <div className="mb-6">
                                    <p className="mb-2 text-sm text-gray-500">Used Medicine (Stock-Out)</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs text-gray-500">Month</label>
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                                className="rounded border px-2 py-1 text-sm text-black"
                                            >
                                                <option value="all">All</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                    <option key={m} value={m}>
                                                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs text-gray-500">Year</label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                className="rounded border px-2 py-1 text-sm text-black"
                                            >
                                                {Array.from({ length: 5 }, (_, idx) => new Date().getFullYear() - idx).map((y) => (
                                                    <option key={y} value={y}>
                                                        {y}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="print-expand-chart relative mb-6 h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" interval={0} height={60} />
                                            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                            <Tooltip formatter={(value: any, name: any, props: any) => [`${value}%`, 'Percent']} />
                                            <Bar dataKey="percent" name="Percent" fill="#A3386C">
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || '#A3386C'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-3">
                                    {chartData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color || '#A3386C' }}></div>
                                            <span className="text-sm text-gray-700">{item.name}</span>
                                            <span className="ml-2 text-sm font-medium text-gray-900">{item.percent ?? 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="print-hide-right lg:col-span-1">
                            <div className="print-hidden h-full rounded-lg border border-gray-200 bg-white p-6">
                                <h3 className="mb-6 text-xl font-normal text-black">Commonly Used Medicine</h3>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Products</p>
                                </div>
                                {/* removed the small 'Used Medicine (Stock-Out)' label here per request */}

                                <div className="space-y-3">
                                    {chartData && chartData.length > 0 ? (
                                        // top 8 by raw stock-out count; fallback to percent sorting if same
                                        chartData
                                            .slice()
                                            .sort((a, b) => b.medicine_stock_out - a.medicine_stock_out || (b.percent ?? 0) - (a.percent ?? 0))
                                            .slice(0, 8)
                                            .map((m, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white"
                                                        style={{ backgroundColor: m.color || colorPalette[idx % colorPalette.length] }}
                                                    >
                                                        {(m.name || 'M').charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">{m.name}</div>
                                                        <div className="text-xs text-gray-500">{m.category ?? 'Uncategorized'}</div>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{m.medicine_stock_out ?? 0}</div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-sm text-gray-500">No data</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Wrap the Reports component with staff-only route protection
const ProtectedReports: React.FC = () => {
    return (
        <StaffOnlyRoute>
            <Reports />
        </StaffOnlyRoute>
    );
};

export default ProtectedReports;
