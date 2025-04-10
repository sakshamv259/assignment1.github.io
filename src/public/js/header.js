// Protected pages that require authentication
const protectedPages = ['eventPlanning', 'statistics'];

// Function to update header based on authentication status
function updateHeader() {
    const currentPath = window.location.pathname;
    // Remove leading slash and .html extension
    const currentPage = currentPath.split('/').pop().replace('.html', '');
    console.log('Checking page access:', { currentPage, currentPath });

    // Check if current page is protected
    if (protectedPages.includes(currentPage)) {
        console.log('Protected page detected:', currentPage);
        verifySession()
            .then(response => {
                console.log('Session verification result:', response);
                if (!response.success) {
                    console.log('User not authenticated, redirecting to login');
                    // Store the current URL before redirecting
                    sessionStorage.setItem('redirectUrl', currentPath);
                    window.location.href = '/login';
                } else {
                    console.log('User authenticated:', response.user);
                    setLoggedInHeader(response.user);
                }
            })
            .catch(error => {
                console.error('Authentication check failed:', error);
                sessionStorage.setItem('redirectUrl', currentPath);
                window.location.href = '/login';
            });
    } else {
        console.log('Public page detected:', currentPage);
        // For non-protected pages, just check and update the header
        verifySession()
            .then(response => {
                if (response.success) {
                    console.log('User is logged in:', response.user);
                    setLoggedInHeader(response.user);
                } else {
                    console.log('User not logged in, showing login button');
                    setLoginButton();
                }
            })
            .catch(error => {
                console.error('Header update failed:', error);
                setLoginButton();
            });
    }
}

// Helper function to set logged in header
function setLoggedInHeader(user) {
    const authSection = document.querySelector('#auth-section') || document.querySelector('.nav-auth');
    if (!authSection) return;

    authSection.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="navbar-text text-light me-3">Welcome, ${user.username}</span>
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
function setLoginButton() {
    const authSection = document.querySelector('#auth-section') || document.querySelector('.nav-auth');
    if (!authSection) return;

    authSection.innerHTML = `
        <a href="/login" class="btn btn-outline-light btn-sm">Login</a>
    `;
}

// Logout handler
async function handleLogout() {
    try {
        const result = await window.api.logout();
        if (result.success) {
            // Redirect to login page after logout
            window.location.href = '/login';
        } else {
            console.error('Logout failed:', result.message);
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Initialize header on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing header...');
    
    // Update header first
    await updateHeader();
    
    // Then check if this is a protected page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    console.log('Current page check:', currentPage);
    
    if (protectedPages.includes(currentPage)) {
        console.log('Protected page detected on load:', currentPage);
    }
}); 