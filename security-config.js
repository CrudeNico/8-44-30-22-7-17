/**
 * Security Configuration Utility
 * Provides environment-aware API URLs and security settings
 */

// Determine API base URL based on environment
export function getApiBaseUrl() {
    // In production, use HTTPS and the actual domain
    if (window.location.protocol === 'https:') {
        // Production: use same origin (HTTPS)
        return `${window.location.origin}`;
    }
    
    // Development: use localhost (HTTP is OK for local dev)
    // Check if we're on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://localhost:${window.location.port || '3000'}`;
    }
    
    // Fallback: use same origin
    return window.location.origin;
}

// Export API endpoint
export const API_ENDPOINTS = {
    sendEmail: () => `${getApiBaseUrl()}/api/send-email`,
    health: () => `${getApiBaseUrl()}/api/health`,
};

// Make available globally for inline scripts
if (typeof window !== 'undefined') {
    window.getApiBaseUrl = getApiBaseUrl;
    window.API_ENDPOINTS = API_ENDPOINTS;
}

