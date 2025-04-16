// auth.js - Handles authentication related functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in when page loads
    checkLoginStatus();
});

function checkLoginStatus() {
    fetch('php/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.logged_in) {
                window.location.href = 'login.html';
            } else {
                // Update UI with user data
                document.getElementById('studentName').textContent = data.name;
                document.getElementById('enrollmentNo').textContent = data.enrollment_no;
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
}

// Handle registration form submission
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('php/register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('php/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}