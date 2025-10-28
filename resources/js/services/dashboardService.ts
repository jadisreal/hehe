// resources/js/services/dashboardService.ts
import axios from 'axios';

export interface DashboardStats {
    totalPatients: number;
    todaysConsultations: number;
    pendingAppointments: number;
    completedConsultations: number;
    currentConsultations: number;
}

export interface RecentActivity {
    id: number;
    patient: string;
    patient_id: number;
    patient_type: string;
    type: string;
    date: string;
    time: string;
    notes: string;
    status?: string; // Making status optional since it's computed from the consultation data
}

export interface DashboardData {
    stats: DashboardStats;
    recentActivity: RecentActivity[];
}

export const dashboardService = {
    /**
     * Get dashboard statistics
     */
    getStats: async (): Promise<DashboardStats | null> => {
        try {
            const response = await axios.get('/api/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return null;
        }
    },

    /**
     * Get recent activity
     */
    getRecentActivity: async (): Promise<RecentActivity[]> => {
        try {
            const response = await axios.get('/api/dashboard/recent-activity');
            return response.data;
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            return [];
        }
    },

    /**
     * Get comprehensive dashboard data
     */
    getDashboardData: async (): Promise<DashboardData | null> => {
        try {
            const response = await axios.get('/api/dashboard/data');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return null;
        }
    },
};
