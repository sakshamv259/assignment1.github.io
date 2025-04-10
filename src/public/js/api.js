// API Configuration
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'sakshamv259.github.io' || hostname === 'assignment1-github-io.vercel.app') {
        return 'https://volunteer-backend-cy21.onrender.com/api';
    }
    return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();
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
        console.log('[API] Login attempt:', {
            username,
            url: `${API_BASE_URL}/auth/login`,
            origin: window.location.origin
        });

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        console.log('[API] Login response status:', response.status);
        console.log('[API] Login response headers:', Object.fromEntries([...response.headers.entries()]));

        const data = await response.json();
        console.log('[API] Login response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store user info in localStorage for client-side access
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('[API] User data stored in localStorage');
        }

        // Check if there's a return URL to redirect to
        const returnTo = data.returnTo || sessionStorage.getItem('returnTo') || '/';
        console.log('[API] Return URL after login:', returnTo);
        
        // Clear the stored return URL
        sessionStorage.removeItem('returnTo');
        
        // Small delay to ensure session is fully established
        setTimeout(() => {
            window.location.href = returnTo;
        }, 300);
        
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
        console.log('[API] Logging out...');
        
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            ...defaultFetchOptions,
            method: 'POST'
        });

        console.log('[API] Logout response:', {
            status: response.status,
            ok: response.ok
        });

        // Clear user data regardless of server response
        localStorage.removeItem('user');
        
        const data = await response.json();
        
        // Redirect to login page after logout
        window.location.href = '/login';
        
        return {
            success: response.ok && data.success
        };
    } catch (error) {
        console.error('[API] Logout error:', error);
        // Clear user data even on error
        localStorage.removeItem('user');
        // Redirect to login page even on error
        window.location.href = '/login';
        throw error;
    }
}

async function verifySession() {
    try {
        console.log('[API] Verifying session at:', `${API_BASE_URL}/auth/verify`);
        
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            ...defaultFetchOptions,
            method: 'GET'
        });

        console.log('[API] Verify session response:', {
            status: response.status,
            ok: response.ok
        });

        const data = await response.json();
        
        // Update stored user data if verified
        if (response.ok && data.success && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        } else if (!response.ok) {
            // Clear stored user data if not authenticated
            localStorage.removeItem('user');
        }
        
        return {
            isAuthenticated: response.ok && data.success,
            user: data.user
        };
    } catch (error) {
        console.error('[API] Session verification error:', error);
        localStorage.removeItem('user');
        return {
            isAuthenticated: false,
            user: null
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