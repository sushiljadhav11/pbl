document.addEventListener("DOMContentLoaded", function () {
    // Signup Form
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (localStorage.getItem(email)) {
                alert("User already exists. Please log in.");
            } else {
                localStorage.setItem(email, JSON.stringify({ name, email, password }));
                alert("Signup successful! Please login.");
                window.location.href = "index.html";
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            const userData = JSON.parse(localStorage.getItem(email));
            if (userData && userData.password === password) {
                sessionStorage.setItem("loggedInUser", email);
                window.location.href = "dashboard.html";
            } else {
                alert("Invalid email or password.");
            }
        });
    }

    // Dashboard - Display User Info
    const userSpan = document.getElementById("user-name");
    if (userSpan) {
        const loggedInUser = sessionStorage.getItem("loggedInUser");
        if (loggedInUser) {
            const userData = JSON.parse(localStorage.getItem(loggedInUser));
            userSpan.textContent = userData.name;
        } else {
            window.location.href = "index.html"; // Redirect if not logged in
        }
    }

    // Logout
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            sessionStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    }
});
