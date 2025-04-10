// Header management
async function updateHeader() {
    try {
        // First check if authenticated
        const response = await window.api.verifySession();
        const authenticated = response.success;
        console.log('Authentication status:', authenticated, response);

        // Try to find auth section using different possible selectors
        const authSection = document.querySelector('#auth-section') || document.querySelector('.nav-auth');
        if (!authSection) {
            console.error('Auth section not found');
            return;
        }

        if (!authenticated) {
            console.log('User is not authenticated');
            setLoginButton(authSection);
            return;
        }

        // User is authenticated and we have the user data from verifySession
        if (response.user && response.user.username) {
            console.log('Setting logged in user header:', response.user.username);
            setLoggedInHeader(authSection, response.user.username);
        } else {
            console.log('No valid user data, showing login button');
            setLoginButton(authSection);
        }
    } catch (error) {
        console.error('Error updating header:', error);
        const authSection = document.querySelector('#auth-section') || document.querySelector('.nav-auth');
        if (authSection) {
            setLoginButton(authSection);
        }
    }
}

// Helper function to set logged in header
function setLoggedInHeader(authSection, username) {
    if (!authSection) return;

    authSection.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="navbar-text text-light me-3">Welcome, ${username}</span>
            <button class="btn btn-outline-light btn-sm" id="logoutBtn">Logout</button>
        </div>
    `;

    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Helper function to set login button
function setLoginButton(authSection) {
    if (!authSection) return;

    authSection.innerHTML = `
        <a href="login.html" class="btn btn-outline-light btn-sm">Login</a>
    `;
}

// Logout handler
async function handleLogout() {
    try {
        const result = await window.api.logout();
        if (result.success) {
            // Redirect to login page
            window.location.href = 'login.html';
        } else {
            console.error('Logout failed:', result.message);
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Check authentication on protected pages
async function checkAuthAndRedirect() {
    try {
        const response = await window.api.verifySession();
        const authenticated = response.success;
        console.log('Protected page auth check:', authenticated);
        
        if (!authenticated) {
            const currentPath = window.location.pathname;
            // Store the attempted URL to redirect back after login
            sessionStorage.setItem('redirectUrl', currentPath);
            window.location.href = '/login';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        sessionStorage.setItem('redirectUrl', window.location.pathname);
        window.location.href = '/login';
        return false;
    }
}

// Initialize header on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing header...');
    
    // Update header first
    await updateHeader();
    
    // Then check if this is a protected page
    const protectedPages = ['event-planning', 'statistics'];
    const currentPage = window.location.pathname.replace(/^\//, '').replace('.html', '');
    console.log('Current page:', currentPage);
    
    if (protectedPages.includes(currentPage)) {
        await checkAuthAndRedirect();
    }
}); 