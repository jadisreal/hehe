// Type definitions
export interface Medicine {
    id: number;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    expiry: string;
}

export interface ClinicBranch {
    id: number;
    name: string;
    suffix: string;
}

export interface BranchMedicines {
    [key: number]: Medicine[];
}

// Clinic branches data
export const clinicBranches: ClinicBranch[] = [
    { id: 1, name: "Fr Selga Campus, Davao City, Philippines", suffix: "" },
    { id: 2, name: "Bonifacio Campus, Davao City, Philippines", suffix: "" },
    { id: 3, name: "Bajada Campus, Davao City, Philippines", suffix: "(SHS)" },
    { id: 4, name: "Bajada Campus, Davao City, Philippines", suffix: "(JHS)" },
    { id: 5, name: "Bajada Campus, Davao City, Philippines", suffix: "(GS)" },
];

// Medicine data for each branch
export const branchMedicines: BranchMedicines = {
    1: [ // Fr Selga Campus
        { id: 1, name: "Paracetamol 500mg", category: "Pain Relief", stock: 150, minStock: 50, expiry: "2025-12-15" },
        { id: 2, name: "Amoxicillin 250mg", category: "Antibiotic", stock: 75, minStock: 30, expiry: "2025-08-20" },
        { id: 3, name: "Ibuprofen 400mg", category: "Anti-inflammatory", stock: 25, minStock: 40, expiry: "2025-11-30" },
        { id: 4, name: "Cetirizine 10mg", category: "Antihistamine", stock: 90, minStock: 25, expiry: "2026-01-10" },
        { id: 5, name: "Omeprazole 20mg", category: "Antacid", stock: 60, minStock: 20, expiry: "2025-09-25" },
        { id: 20, name: "Aspirin 80mg", category: "Cardioprotective", stock: 110, minStock: 35, expiry: "2025-10-20" },
    ],
    2: [ // Bonifacio Campus
        { id: 6, name: "Paracetamol 500mg", category: "Pain Relief", stock: 120, minStock: 50, expiry: "2025-10-15" },
        { id: 7, name: "Salbutamol Inhaler", category: "Bronchodilator", stock: 15, minStock: 10, expiry: "2025-07-30" },
        { id: 8, name: "Metformin 500mg", category: "Diabetes", stock: 80, minStock: 30, expiry: "2025-12-20" },
        { id: 9, name: "Losartan 50mg", category: "Hypertension", stock: 45, minStock: 25, expiry: "2025-11-15" },
        { id: 21, name: "Amlodipine 5mg", category: "Hypertension", stock: 65, minStock: 20, expiry: "2025-09-30" },
    ],
    3: [ // Bajada Campus (SHS)
        { id: 10, name: "Paracetamol 500mg", category: "Pain Relief", stock: 200, minStock: 50, expiry: "2026-02-15" },
        { id: 11, name: "Betadine Solution", category: "Antiseptic", stock: 30, minStock: 15, expiry: "2025-08-10" },
        { id: 12, name: "Bandages", category: "First Aid", stock: 100, minStock: 20, expiry: "2027-01-01" },
        { id: 13, name: "Alcohol 70%", category: "Antiseptic", stock: 50, minStock: 20, expiry: "2025-12-31" },
        { id: 22, name: "Hydrogen Peroxide", category: "Antiseptic", stock: 35, minStock: 15, expiry: "2025-11-25" },
    ],
    4: [ // Bajada Campus (JHS)
        { id: 14, name: "Children's Paracetamol", category: "Pain Relief", stock: 85, minStock: 30, expiry: "2025-09-20" },
        { id: 15, name: "Oral Rehydration Salts", category: "Rehydration", stock: 40, minStock: 20, expiry: "2026-03-15" },
        { id: 16, name: "Cough Syrup", category: "Cough Relief", stock: 20, minStock: 15, expiry: "2025-08-30" },
        { id: 23, name: "Children's Ibuprofen", category: "Anti-inflammatory", stock: 55, minStock: 25, expiry: "2025-12-05" },
    ],
    5: [ // Bajada Campus (GS)
        { id: 17, name: "Children's Vitamins", category: "Supplements", stock: 60, minStock: 25, expiry: "2025-11-10" },
        { id: 18, name: "First Aid Kit", category: "Emergency", stock: 10, minStock: 5, expiry: "2026-12-31" },
        { id: 19, name: "Thermometer", category: "Medical Device", stock: 8, minStock: 3, expiry: "N/A" },
        { id: 24, name: "Zinc Supplements", category: "Supplements", stock: 45, minStock: 20, expiry: "2025-10-15" },
    ]
};

// Utility functions
export const getBranchById = (id: number): ClinicBranch | undefined => {
    return clinicBranches.find(branch => branch.id === id);
};

export const getMedicinesForBranch = (branchId: number): Medicine[] => {
    return branchMedicines[branchId] || [];
};

export const isLowStock = (stock: number, minStock: number): boolean => stock <= minStock;

export const isExpiringSoon = (expiry: string): boolean => {
    if (expiry === "N/A") return false;
    const expiryDate = new Date(expiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90; // Expiring within 3 months
};