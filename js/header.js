// Header management
async function updateHeader() {
    try {
        // First check if authenticated
        const authenticated = await isAuthenticated();
        console.log('Authentication status:', authenticated);

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

        // If authenticated, get user details
        const userResponse = await getCurrentUser();
        console.log('Current user response:', userResponse);

        if (userResponse.success && userResponse.user && userResponse.user.username) {
            console.log('Setting logged in user header:', userResponse.user.username);
            setLoggedInHeader(authSection, userResponse.user.username);
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
        const result = await logout();
        if (result.success) {
            // Clear any stored data if needed
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
        const authenticated = await isAuthenticated();
        console.log('Protected page auth check:', authenticated);
        
        if (!authenticated) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// Initialize header on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing header...');
    
    // Update header first
    await updateHeader();
    
    // Then check if this is a protected page
    const protectedPages = ['events.html', 'eventPlanning.html', 'statistics.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('Current page:', currentPage);
    
    if (protectedPages.includes(currentPage)) {
        await checkAuthAndRedirect();
    }
}); 