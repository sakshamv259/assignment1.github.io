$(document).ready(function () {
    // Check if user is already logged in
    const isAuthenticated = localStorage.getItem("authenticatedUser");

    if (isAuthenticated) {
        $("#stats-link").removeClass("d-none"); // Show Statistics link
    } else {
        $("#stats-link").addClass("d-none"); // Hide if not logged in
    }

    // Redirect logged-in users away from the login page
    if (window.location.pathname.includes("login.html") && isAuthenticated) {
        window.location.href = "index.html";
    }

    // Login form submission
    $("#loginForm").on("submit", function (event) {
        event.preventDefault();
        const username = $("#username").val().trim();
        const password = $("#password").val().trim();

        // Dummy authentication (Replace with actual backend validation)
        const validUsers = {
            admin: "password123",
            user1: "securepass"
        };

        if (validUsers[username] && validUsers[username] === password) {
            localStorage.setItem("authenticatedUser", username);
            $("#stats-link").removeClass("d-none"); // Show Statistics link
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            $("#loginError").fadeIn();
            setTimeout(() => {
                $("#loginError").fadeOut();
            }, 3000);
        }
    });
    function login() {
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        
        // Add your authentication check here (you can customize this)
        if (usernameInput && passwordInput) {
            localStorage.setItem('username', usernameInput);
            alert('Login successful!');
            window.location.href = 'index.html'; // redirect to home
        } else {
            alert('Please enter both username and password.');
        }
    }
    
    // Logout function
    $("#logoutBtn").on("click", function () {
        localStorage.removeItem("authenticatedUser");
        $("#stats-link").addClass("d-none"); // Hide Statistics link
        window.location.href = "login.html";
    });
});
