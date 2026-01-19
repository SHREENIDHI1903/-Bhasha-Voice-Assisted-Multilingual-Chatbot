
// Helper to get API URL
export const getApiUrl = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    // Convert wss:// -> https:// and ws:// -> http://
    return wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');
};
