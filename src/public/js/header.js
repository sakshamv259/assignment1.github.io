// List of pages that require authentication
const protectedPages = ['eventPlanning', 'statistics'];

// Update header based on authentication state
async function updateHeader() {
    try {
        // Get current page (remove .html and leading slash)
        let currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        if (currentPage === '') currentPage = 'index';
        
        console.log('[Header] Current page:', currentPage);
        console.log('[Header] Is protected page:', protectedPages.includes(currentPage));
        
        // Check if user is already stored in localStorage
        const storedUser = localStorage.getItem('user');
        let isAuthenticated = false;
        let user = null;
        
        if (storedUser) {
            // We have a stored user, but verify the session is still valid
            console.log('[Header] Found stored user, verifying session...');
            user = JSON.parse(storedUser);
            
            try {
                // Verify with the server
                const result = await window.api.verifySession();
                isAuthenticated = result.isAuthenticated;
                
                if (isAuthenticated) {
                    console.log('[Header] Session verified with server');
                    // Update with latest user data if available
                    if (result.user) {
                        user = result.user;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                } else {
                    console.log('[Header] Session invalid or expired');
                    localStorage.removeItem('user');
                    user = null;
                }
            } catch (error) {
                console.error('[Header] Error verifying session:', error);
                isAuthenticated = false;
                localStorage.removeItem('user');
                user = null;
            }
        } else {
            // No stored user, check with server
            console.log('[Header] No stored user, checking with server...');
            try {
                const result = await window.api.verifySession();
                isAuthenticated = result.isAuthenticated;
                user = result.user;
                
                if (isAuthenticated && user) {
                    // Store user for future use
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('[Header] Session verified, user stored');
                }
            } catch (error) {
                console.error('[Header] Error checking authentication:', error);
            }
        }
        
        console.log('[Header] Authentication status:', {
            isAuthenticated,
            username: user?.username || 'none',
            currentPage
        });
        
        // Update header UI based on authentication status
        if (isAuthenticated && user) {
            setLoggedInHeader(user);
        } else {
            setLoginButton();
            
            // If on a protected page and not authenticated, store current page and redirect to login
            if (protectedPages.includes(currentPage)) {
                console.log('[Header] Protected page access attempted, redirecting to login');
                sessionStorage.setItem('returnTo', window.location.pathname);
                window.location.href = '/login';
            }
        }
    } catch (error) {
        console.error('[Header] Error updating header:', error);
        // Default to login button on error
        setLoginButton();
    }
}

// Set the header for logged in users
function setLoggedInHeader(user) {
    const headerNav = document.querySelector('.header-nav');
    if (!headerNav) return;
    
    // Find or create the user info container
    let userInfo = document.querySelector('.user-info');
    if (!userInfo) {
        userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        headerNav.appendChild(userInfo);
    }
    
    // Update user info
    userInfo.innerHTML = `
        <span class="username">Welcome, ${user.username}</span>
        <button id="logout-btn" class="btn btn-outline-light">Logout</button>
    `;
    
    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Set the login button for non-authenticated users
function setLoginButton() {
    const headerNav = document.querySelector('.header-nav');
    if (!headerNav) return;
    
    // Remove user info if exists
    const userInfo = document.querySelector('.user-info');
    if (userInfo) userInfo.remove();
    
    // Add login button if it doesn't exist
    if (!document.querySelector('.login-btn')) {
        const loginBtn = document.createElement('a');
        loginBtn.href = '/login';
        loginBtn.className = 'btn btn-outline-light login-btn';
        loginBtn.textContent = 'Login';
        headerNav.appendChild(loginBtn);
    }
}

// Handle logout
async function handleLogout() {
    try {
        console.log('[Header] Logging out...');
        await window.api.logout();
        // Note: The logout function in api.js already handles redirection
    } catch (error) {
        console.error('[Header] Logout error:', error);
        // Fallback redirect
        window.location.href = '/login';
    }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', updateHeader); 