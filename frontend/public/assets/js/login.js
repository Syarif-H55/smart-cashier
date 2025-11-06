// Login functionality for Smart Cashier Web App
// Handles user authentication and redirects

// Wait for DOM to be fully loaded before setting up event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupLoginEventListeners();
});

// Set up event listeners for login page
function setupLoginEventListeners() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get form data
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Basic validation
    if (!username || !password) {
        showMessage('Please enter both username and password', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#loginForm .btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        // Use API module to perform login
        // Backend integration point: This will connect to PHP AuthController
        const response = await API.Auth.login({ username, password });
        
        if (response.success) {
            // Store user session information
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            
            // Show success message
            showMessage(response.message, 'success');
            
            // Redirect to menu page after a short delay
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1000);
        } else {
            // Show error message from API response
            showMessage(response.message || 'Login failed', 'error');
        }
    } catch (error) {
        // Handle any errors during login process
        console.error('Login error:', error);
        showMessage('An error occurred during login. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Utility function to show messages on login page
function showMessage(message, type = 'info') {
    let messageDiv = document.getElementById('loginMessage');
    
    if (!messageDiv) {
        // Create message div if it doesn't exist
        messageDiv = document.createElement('div');
        messageDiv.id = 'loginMessage';
        document.querySelector('.login-form').appendChild(messageDiv);
    }
    
    // Update message content and style
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// For development/testing: Auto-login with dummy credentials
// This can be removed or disabled in production
function setupDevLogin() {
    // Uncomment the following lines to enable development auto-login
    /*
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = 'password';
    */
}