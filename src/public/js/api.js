// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api'
    : 'https://volunteer-connect.onrender.com/api';

// Common fetch options for all API calls
const defaultFetchOptions = {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Authentication functions
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function register(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        console.log('Register response:', data);

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
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();
        console.log('Logout response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Logout failed');
        }

        return data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

async function verifySession() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            credentials: 'include'
        });

        const data = await response.json();
        console.log('Verify session response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Session verification failed');
        }

        return data;
    } catch (error) {
        console.error('Verify session error:', error);
        throw error;
    }
}

// Get current user
async function getCurrentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            ...defaultFetchOptions
        });

        const data = await response.json();
        console.log('Get current user API response:', data);  // Debug log
        
        if (response.ok && data.success && data.user) {
            return {
                success: true,
                user: data.user
            };
        } else {
            throw new Error(data.message || 'Failed to get current user');
        }
    } catch (error) {
        console.error('Get current user API error:', error);
        return {
            success: false,
            message: error.message || 'Failed to get user information'
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

// Export all functions
window.api = {
    login,
    register,
    logout,
    verifySession
};
window.getEvents = getEvents;
window.createEvent = createEvent;
window.updateEvent = updateEvent;
window.deleteEvent = deleteEvent;
window.joinEvent = joinEvent;
window.leaveEvent = leaveEvent;
window.getCurrentUser = getCurrentUser; 