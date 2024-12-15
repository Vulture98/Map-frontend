// Auth utility functions
// Auth utility functions
const USER_AUTH_KEY = 'user_auth_status';
const ADMIN_AUTH_KEY = 'admin_auth_status';

const setAuthStatus = (status, role) => {
    localStorage.setItem(`${role}_auth_status`, JSON.stringify({
        isAuthenticated: status,
        timestamp: Date.now()
    }));
};

const getAuthStatus = (key) => {
    const status = localStorage.getItem(key);
    return status ? JSON.parse(status) : { isAuthenticated: false, timestamp: null };
};

const clearAuthStatus = (key) => {
    localStorage.removeItem(key);
};

const broadcastAuthChange = (type, role) => {
    localStorage.setItem(`${role}_auth_event`, JSON.stringify({
        type,
        role,
        timestamp: Date.now()
    }));
};

export { setAuthStatus, getAuthStatus, clearAuthStatus, broadcastAuthChange };