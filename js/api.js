const API_BASE_URL = 'http://localhost:3000/api';

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
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Login API response:', data);  // Debug log

        if (response.ok && data.success && data.user) {
            return {
                success: true,
                user: data.user
            };
        } else {
            return { 
                success: false, 
                message: data.message || 'Login failed. Please check your credentials.'
            };
        }
    } catch (error) {
        console.error('Login API error:', error);
        return { 
            success: false, 
            message: 'An error occurred during login. Please try again.'
        };
    }
}

async function register(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            return { 
                success: true, 
                message: 'Registration successful! Please login.'
            };
        } else {
            return { 
                success: false, 
                message: data.message || 'Registration failed. Please try again.'
            };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { 
            success: false, 
            message: 'An error occurred during registration. Please try again.'
        };
    }
}

async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            ...defaultFetchOptions,
            method: 'POST'
        });

        const data = await response.json();
        console.log('Logout API response:', data);  // Debug log
        
        if (response.ok) {
            return { 
                success: true,
                message: 'Logged out successfully'
            };
        } else {
            return {
                success: false,
                message: data.message || 'Logout failed'
            };
        }
    } catch (error) {
        console.error('Logout API error:', error);
        return { 
            success: false,
            message: 'Error during logout'
        };
    }
}

// Check authentication status
async function isAuthenticated() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            ...defaultFetchOptions
        });

        const data = await response.json();
        console.log('Auth verify API response:', data);  // Debug log
        
        return response.ok && data.success;
    } catch (error) {
        console.error('Auth verify API error:', error);
        return false;
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
window.login = login;
window.register = register;
window.logout = logout;
window.getEvents = getEvents;
window.createEvent = createEvent;
window.updateEvent = updateEvent;
window.deleteEvent = deleteEvent;
window.joinEvent = joinEvent;
window.leaveEvent = leaveEvent;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser; 