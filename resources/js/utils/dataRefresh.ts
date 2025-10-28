// resources/js/utils/dataRefresh.ts

/**
 * Force reload patient data in all profile views
 *
 * This function ensures that when a new consultation or remark is added,
 * all profile views will refresh their data from the server
 */
export const forceDataRefresh = () => {
    // Use localStorage to signal that data has been updated
    // Set a timestamp that profile components can check to see if they need to refresh
    localStorage.setItem('uic_medcare_data_updated', Date.now().toString());

    // Additionally dispatch a custom event that components can listen for
    const event = new CustomEvent('uic_medcare_data_updated', {
        detail: {
            timestamp: Date.now(),
        },
    });

    window.dispatchEvent(event);

    console.log('Data refresh signal sent:', Date.now());
};

/**
 * Check if data needs to be refreshed
 *
 * @param lastCheck - The last time the component checked for updates
 * @returns boolean - True if data needs to be refreshed
 */
export const shouldRefreshData = (lastCheck: number): boolean => {
    const lastUpdate = localStorage.getItem('uic_medcare_data_updated');

    if (!lastUpdate) {
        return false;
    }

    const lastUpdateTime = parseInt(lastUpdate, 10);
    return lastUpdateTime > lastCheck;
};
