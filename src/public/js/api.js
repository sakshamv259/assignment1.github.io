// API Configuration
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'sakshamv259.github.io' || hostname === 'assignment1-github-io.vercel.app') {
        return 'https://volunteer-backend-cy21.onrender.com/api';
    } else if (hostname === 'volunteer-backend-cy21.onrender.com') {
        return 'https://volunteer-backend-cy21.onrender.com/api';
    }
    return 'http://localhost:8080/api';
})();

console.log('[API] Using base URL:', API_BASE_URL);

// Debug flag
const DEBUG = true;

// Common fetch options for all API calls
const defaultFetchOptions = {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
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
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('[API] Login response status:', response.status);

        if (!response.ok) {
            console.error('[API] Login failed:', data.message);
            throw new Error(data.message || 'Login failed');
        }

        if (!data.success || !data.user) {
            console.error('[API] Invalid login response:', data);
            throw new Error('Invalid login response from server');
        }

        console.log('[API] Login successful:', data.user.username);
        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('[API] Login error:', error);
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
        log('Attempting logout...');
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            ...defaultFetchOptions,
            method: 'POST'
        });

        const data = await response.json();
        log('Logout response:', data);

        return {
            success: response.ok && data.success,
            message: data.message
        };
    } catch (error) {
        log('Logout error:', error);
        return {
            success: false,
            message: 'An error occurred during logout. Please try again.'
        };
    }
}

async function verifySession() {
    try {
        log('Verifying session with:', `${API_BASE_URL}/auth/verify`);
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        log('Verify session response:', data);
        return data;
    } catch (error) {
        log('Verify session error:', error);
        return { success: false, message: 'Session verification failed' };
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