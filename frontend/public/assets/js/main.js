// Main JavaScript file for Smart Cashier Web App
// Handles global initialization and routing

// Constants for the application
const APP_CONSTANTS = {
    CURRENT_USER: 'cashier_user', // Placeholder for user session
    CART_KEY: 'current_cart', // Local storage key for current order
    MENU_KEY: 'menu_items' // Local storage key for menu items
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize app functionality
function initializeApp() {
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Check if user is logged in
    if (window.location.pathname.includes('login.html')) {
        // On login page, no need to check authentication
        return;
    }
    
    // For other pages, check if user is authenticated
    checkAuthStatus();
}

// Set up global event listeners
function setupGlobalEventListeners() {
    // Set up logout button if it exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Check if user is authenticated
function checkAuthStatus() {
    // For MVP, we'll simulate authentication with local storage
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

// Handle logout
function handleLogout() {
    // Clear user session
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Utility function to show messages
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('loginMessage') || document.createElement('div');
    messageDiv.id = 'loginMessage';
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // If message div was created, append to body
    if (!document.getElementById('loginMessage')) {
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
    
    console.log(`${type}: ${message}`);
}

// Utility function to format currency
function formatCurrency(amount) {
    return parseFloat(amount).toFixed(2);
}

// Utility function to get current cart from localStorage
function getCurrentCart() {
    const cart = localStorage.getItem(APP_CONSTANTS.CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Utility function to save cart to localStorage
function saveCartToStorage(cart) {
    localStorage.setItem(APP_CONSTANTS.CART_KEY, JSON.stringify(cart));
}

// Utility function to add item to cart
function addItemToCart(item) {
    const cart = getCurrentCart();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex > -1) {
        // If item exists, increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // If new item, add with quantity 1
        const cartItem = {
            ...item,
            quantity: 1
        };
        cart.push(cartItem);
    }
    
    saveCartToStorage(cart);
    updateCartDisplay();
}

// Utility function to update cart display
function updateCartDisplay() {
    // This function can be called from any page that needs to update cart display
    // Implementation will depend on specific page requirements
    console.log('Cart display updated');
}

// Utility function to clear cart
function clearCart() {
    localStorage.removeItem(APP_CONSTANTS.CART_KEY);
    updateCartDisplay();
}

// Function to simulate API calls (will be replaced with real API calls in the future)
function mockAPICall(url, options = {}) {
    console.log(`API call to: ${url}`, options);
    
    // Return a promise to simulate async API call
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            // This is where we'll connect to the real backend API in the future
            // For now, return mock data
            const mockResponse = {
                success: true,
                data: {},
                message: 'Request successful'
            };
            
            resolve(mockResponse);
        }, 300);
    });
}