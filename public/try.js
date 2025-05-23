const API_BASE_URL = 'http://localhost:3000/api';

// Enhanced fetch function with authentication support
async function fetchData(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add auth token if required
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
        
        // Handle unauthorized (401) responses
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

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

        // Validation
        if (data.password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const result = await fetchData('/auth/register', 'POST', data);
            
            // Store the received token and user data
            if (result.token && result.user) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                // Redirect based on user role
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
                // Store authentication data
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                // Redirect to appropriate dashboard
                if (result.user.role === 'admin' || result.user.role === 'superadmin') {
                    window.location.href = 'adminDashboard.html';
                } else {
                    window.location.href = 'adminDashboard.html';
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

// Check authentication state on page load
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Redirect to login if not authenticated
    if (!token && window.location.pathname.includes('adminDashboard.html')) {
        window.location.href = 'login.html';
    }
    
    // Redirect to dashboard if already logged in
    if (token && (window.location.pathname.includes('login.html') || 
                  window.location.pathname.includes('register.html'))) {
        if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
            window.location.href = 'adminDashboard.html';
        } else {
            window.location.href = 'userDashboard.html';
        }
    }
}

// Logout function (can be called from any page)
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Initialize auth check when DOM is loaded
document.addEventListener('DOMContentLoaded', checkAuth);