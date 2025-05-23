const API_BASE_URL = 'http://localhost:3000/api';

// Enhanced fetch function with safe error handling
async function fetchData(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add auth token if needed
    if (requiresAuth) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            throw new Error('Authentication required');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle unauthorized (401)
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            throw new Error('Session expired. Please login again.');
        }

        // Handle non-OK responses
        if (!response.ok) {
            const contentType = response.headers.get('Content-Type');
            let errorMessage = `HTTP error! status: ${response.status}`;

            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } else {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }

            throw new Error(errorMessage);
        }

        // Parse JSON safely
        return await response.json();

    } catch (error) {
        console.error('API Error:', error);
        alert(error.message || 'Request failed');
        throw error;
    }
}

// Registration Handler
const multiStepForm = document.getElementById('multiStepForm');
if (multiStepForm) {
    multiStepForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(multiStepForm);
        const data = Object.fromEntries(formData.entries());
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (data.password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const result = await fetchData('/auth/register', 'POST', data);

            if (result.token && result.user) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));

                // Redirect based on role
                if (result.user.role === 'admin' || result.user.role === 'superadmin') {
                    window.location.href = 'adminDashboard.html';
                } else {
                    window.location.href = 'userDashboard.html';
                }
            } else {
                alert(result.message || "Registration successful! Please login.");
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert("Registration failed. " + (error.message || "Please try again."));
        }
    });
}

// Login Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const result = await fetchData('/login/auth', 'POST', data);

            if (result.token && result.user) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));

                if (result.user.role === 'admin' || result.user.role === 'superadmin') {
                    window.location.href = 'adminDashboard.html';
                } else {
                    window.location.href = 'userDashboard.html';
                }
            } else {
                throw new Error(result.message || "Invalid server response");
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert("Login failed. " + (error.message || "Invalid credentials"));
        }
    });
}

// Check auth on page load
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!token && window.location.pathname.includes('adminDashboard.html')) {
        window.location.href = 'login.html';
    }

    if (token && (window.location.pathname.includes('login.html') || 
                  window.location.pathname.includes('register.html'))) {
        if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') {
            window.location.href = 'adminDashboard.html';
        } else {
            window.location.href = 'userDashboard.html';
        }
    }
}

// Logout handler
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Run auth check on DOM load
document.addEventListener('DOMContentLoaded', checkAuth);
