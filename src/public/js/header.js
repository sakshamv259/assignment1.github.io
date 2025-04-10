// Header management
async function updateHeader() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    console.log('Current page:', currentPage);

    // Check if current page is protected
    if (protectedPages.includes(currentPage)) {
        verifySession()
            .then(response => {
                if (!response.success) {
                    // Store the current URL before redirecting
                    sessionStorage.setItem('redirectUrl', window.location.pathname);
                    window.location.href = '/login';
                } else {
                    setLoggedInHeader(response.user);
                }
            })
            .catch(error => {
                console.error('Auth check failed:', error);
                sessionStorage.setItem('redirectUrl', window.location.pathname);
                window.location.href = '/login';
            });
    } else {
        // For non-protected pages, just check and update the header
        verifySession()
            .then(response => {
                if (response.success) {
                    setLoggedInHeader(response.user);
                } else {
                    setLoginButton();
                }
            })
            .catch(error => {
                console.error('Auth check failed:', error);
                setLoginButton();
            });
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

// Protected pages that require authentication
const protectedPages = ['event-planning', 'statistics'];

// Initialize header on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing header...');
    
    // Update header first
    await updateHeader();
    
    // Then check if this is a protected page
    const currentPage = window.location.pathname.replace(/^\//, '').replace('.html', '');
    console.log('Current page:', currentPage);
    
    if (protectedPages.includes(currentPage)) {
        await checkAuthAndRedirect();
    }
}); 