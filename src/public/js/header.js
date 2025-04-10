// Protected pages that require authentication
const protectedPages = ['eventPlanning', 'statistics'];

// Function to update header based on authentication status
async function updateHeader() {
    const currentPath = window.location.pathname;
    // Remove leading slash and .html extension
    const currentPage = currentPath.split('/').pop().replace('.html', '');
    console.log('[Header] Checking page access:', { 
        currentPage, 
        currentPath,
        isProtected: protectedPages.includes(currentPage)
    });

    try {
        const response = await verifySession();
        console.log('[Auth] Session verification result:', response);

        if (response.success && response.user) {
            console.log('[Auth] User is authenticated:', response.user);
            setLoggedInHeader(response.user);
            return;
        }

        console.log('[Auth] User not authenticated');
        setLoginButton();
            
        // For protected pages, let the server handle the redirect
        // The server will store the return URL in the session
        if (protectedPages.includes(currentPage)) {
            console.log('[Auth] Protected page access attempt - server will handle redirect');
        }
    } catch (error) {
        console.error('[Auth] Authentication check failed:', error);
        setLoginButton();
    }
}

// Helper function to set logged in header
function setLoggedInHeader(user) {
    console.log('[Header] Setting logged in header for user:', user.username);
    const authSection = document.querySelector('#auth-section') || document.querySelector('.nav-auth');
    if (!authSection) {
        console.error('[Header] Auth section not found in DOM');
        return;
    }

    authSection.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="navbar-text text-light me-3">Welcome, ${user.username}</span>
            <button class="btn btn-outline-light btn-sm" id="logoutBtn">Logout</button>
        </div>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('[Header] Logout button handler attached');
    }
}

// Helper function to set login button
function setLoginButton() {
    console.log('[Header] Setting login button');
    const authSection = document.querySelector('#auth-section') || document.querySelector('.nav-auth');
    if (!authSection) {
        console.error('[Header] Auth section not found in DOM');
        return;
    }

    const currentPath = window.location.pathname;
    const isProtectedPage = protectedPages.includes(currentPath.split('/').pop().replace('.html', ''));
    
    authSection.innerHTML = `
        <a href="/login${isProtectedPage ? '?returnTo=' + encodeURIComponent(currentPath) : ''}" class="btn btn-outline-light btn-sm">Login</a>
    `;
}

// Logout handler
async function handleLogout() {
    try {
        const result = await window.api.logout();
        if (result.success) {
            console.log('[Auth] Logout successful, redirecting to login page');
            window.location.href = '/login';
        } else {
            console.error('[Auth] Logout failed:', result.message);
        }
    } catch (error) {
        console.error('[Auth] Logout error:', error);
    }
}

// Initialize header on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Header] Page loaded, initializing header...');
    try {
        await updateHeader();
    } catch (error) {
        console.error('[Header] Error during initialization:', error);
    }
}); 