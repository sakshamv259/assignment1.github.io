// API Configuration
const API_BASE_URL = 'https://volunteer-backend-cy21.onrender.com/api';

console.log('[API] Using base URL:', API_BASE_URL);

// Debug flag
const DEBUG = true;

// Common fetch options for all API calls
const defaultFetchOptions = {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    mode: 'cors'
};

// Helper function for logging
function log(...args) {
    if (DEBUG) {
        console.log('[API]', ...args);
    }
}

// Authentication functions
async function login(username, password) {
    try {
        console.log('[API] Login attempt for user:', username);
        
        // Get the current origin
        const origin = window.location.origin;
        console.log('[API] Request origin:', origin);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            ...defaultFetchOptions,
            method: 'POST',
            headers: {
                ...defaultFetchOptions.headers,
                'Origin': origin
            },
            body: JSON.stringify({ username, password })
        });

        // Log response details for debugging
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        console.log('[API] Login response headers:', responseHeaders);
        console.log('[API] Login response status:', response.status);

        const data = await response.json();
        console.log('[API] Login response data:', data);

        if (!response.ok) {
            const error = new Error(data.message || 'Login failed');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        if (!data.success || !data.user) {
            throw new Error('Invalid login response from server');
        }

        // Store session info
        if (data.sessionID) {
            localStorage.setItem('sessionID', data.sessionID);
            console.log('[API] Session ID stored:', data.sessionID);
        }

        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('[API] Login error:', {
            message: error.message,
            status: error.status,
            data: error.data
        });
        throw error;
    }
}

async function register(username, email, password) {
    try {
        console.log('Attempting registration with:', { username, email });
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });

        console.log('Register response status:', response.status);
        const data = await response.json();
        console.log('Register response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        return data;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
}

async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            ...defaultFetchOptions,
            method: 'POST'
        });

        const data = await response.json();
        console.log('[API] Logout response:', data);

        // Clear local session data
        localStorage.removeItem('sessionID');

        return {
            success: response.ok && data.success,
            message: data.message
        };
    } catch (error) {
        console.error('[API] Logout error:', error);
        // Clear session data even if logout fails
        localStorage.removeItem('sessionID');
        return {
            success: false,
            message: 'An error occurred during logout'
        };
    }
}

async function verifySession() {
    try {
        const sessionID = localStorage.getItem('sessionID');
        const origin = window.location.origin;
        console.log('[API] Verifying session:', { sessionID, origin });

        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            ...defaultFetchOptions,
            headers: {
                ...defaultFetchOptions.headers,
                'X-Session-ID': sessionID || '',
                'Origin': origin
            }
        });

        const data = await response.json();
        console.log('[API] Verify session response:', {
            status: response.status,
            data
        });

        if (!response.ok) {
            // Clear invalid session
            localStorage.removeItem('sessionID');
            throw new Error(data.message || 'Session verification failed');
        }

        return data;
    } catch (error) {
        console.error('[API] Verify session error:', error);
        return { 
            success: false, 
            message: error.message || 'Session verification failed'
        };
    }
}

// Get current user
async function getCurrentUser() {
    try {
        log('Fetching current user...');
        const response = await fetch(`${API_BASE_URL}/auth/current`, {
            ...defaultFetchOptions,
            method: 'GET'
        });

        const data = await response.json();
        log('Current user response:', data);

        return {
            success: response.ok && data.success,
            user: data.user
        };
    } catch (error) {
        log('Current user error:', error);
        return {
            success: false,
            message: 'Failed to fetch current user.'
        };
    }
}

// Event functions with CORS support
async function getEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            ...defaultFetchOptions
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get events error:', error);
        throw error;
    }
}

async function createEvent(eventData) {
    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create event');
        }
        
        return data;
    } catch (error) {
        console.error('Create event error:', error);
        throw error;
    }
}

async function updateEvent(eventId, eventData) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update event');
        }
        
        return data;
    } catch (error) {
        console.error('Update event error:', error);
        throw error;
    }
}

async function deleteEvent(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete event');
        }
        
        return data;
    } catch (error) {
        console.error('Delete event error:', error);
        throw error;
    }
}

async function joinEvent(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/join`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to join event');
        }
        
        return data;
    } catch (error) {
        console.error('Join event error:', error);
        throw error;
    }
}

async function leaveEvent(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/leave`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to leave event');
        }
        
        return data;
    } catch (error) {
        console.error('Leave event error:', error);
        throw error;
    }
}

// Export functions
window.api = {
    login,
    register,
    logout,
    verifySession,
    getCurrentUser
};
window.getEvents = getEvents;
window.createEvent = createEvent;
window.updateEvent = updateEvent;
window.deleteEvent = deleteEvent;
window.joinEvent = joinEvent;
window.leaveEvent = leaveEvent; 