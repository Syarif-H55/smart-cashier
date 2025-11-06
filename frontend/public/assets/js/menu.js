// Menu page functionality for Smart Cashier Web App
// Handles menu display, category filtering, and cart management

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    initializeMenuPage();
});

// Initialize menu page functionality
async function initializeMenuPage() {
    try {
        // Load menu items from API (or local storage for MVP)
        await loadMenuItems();
        
        // Setup event listeners
        setupMenuEventListeners();
        
        // Initialize cart display
        updateCartDisplay();
    } catch (error) {
        console.error('Error initializing menu page:', error);
        showMessage('Failed to load menu items. Please try again later.', 'error');
    }
}

// Load menu items from API
async function loadMenuItems() {
    try {
        // Use API module to get menu items
        // Backend integration point: This will connect to PHP MenuController
        const response = await API.Menu.getAllMenuItems();
        
        if (response.success) {
            // Store menu items in a global variable or local storage for reuse
            window.menuItems = response.data;
            
            // Display all menu items initially
            displayMenuItems(window.menuItems);
        } else {
            throw new Error(response.message || 'Failed to load menu items');
        }
    } catch (error) {
        console.error('Error loading menu items:', error);
        showMessage('Failed to load menu items. Using default menu.', 'error');
        
        // Use default menu items if API fails
        window.menuItems = getDefaultMenuItems();
        displayMenuItems(window.menuItems);
    }
}

// Define default menu items for fallback
function getDefaultMenuItems() {
    return [
        {
            id: 'menu_001',
            name: 'Nasi Goreng',
            category: 'food',
            price: 25000,
            image: 'assets/img/placeholder-food.jpg',
            stock: 10,
            is_available: true
        },
        {
            id: 'menu_002',
            name: 'Mie Ayam',
            category: 'food',
            price: 20000,
            image: 'assets/img/placeholder-food.jpg',
            stock: 15,
            is_available: true
        },
        {
            id: 'menu_003',
            name: 'Bakso',
            category: 'food',
            price: 18000,
            image: 'assets/img/placeholder-food.jpg',
            stock: 8,
            is_available: true
        },
        {
            id: 'menu_004',
            name: 'Es Teh',
            category: 'drink',
            price: 5000,
            image: 'assets/img/placeholder-drink.jpg',
            stock: 20,
            is_available: true
        },
        {
            id: 'menu_005',
            name: 'Es Jeruk',
            category: 'drink',
            price: 7000,
            image: 'assets/img/placeholder-drink.jpg',
            stock: 15,
            is_available: true
        },
        {
            id: 'menu_006',
            name: 'Jus Alpukat',
            category: 'drink',
            price: 15000,
            image: 'assets/img/placeholder-drink.jpg',
            stock: 12,
            is_available: true
        }
    ];
}

// Display menu items in the UI
function displayMenuItems(items) {
    const menuContainer = document.getElementById('menuItems');
    if (!menuContainer) {
        console.error('Menu container not found');
        return;
    }
    
    // Clear existing content
    menuContainer.innerHTML = '';
    
    // Create and append menu items
    items.forEach(item => {
        if (item.is_available) {
            const menuItemElement = createMenuItemElement(item);
            menuContainer.appendChild(menuItemElement);
        }
    });
    
    // Setup event listeners for add to cart buttons
    setupAddToCartEventListeners();
}

// Create a menu item element
function createMenuItemElement(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.dataset.id = item.id;
    
    menuItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/img/placeholder-food.jpg'; this.alt='Menu Item';">
        <div class="menu-item-info">
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-category">${item.category}</div>
            <div class="menu-item-price">$${formatCurrency(item.price)}</div>
            <button class="add-to-cart-btn" data-item-id="${item.id}">Add to Order</button>
        </div>
    `;
    
    return menuItem;
}

// Set up event listeners for menu page
function setupMenuEventListeners() {
    // Set up category filter buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get category to filter
            const category = this.getAttribute('data-category');
            
            // Filter and display menu items
            if (category === 'all') {
                displayMenuItems(window.menuItems);
            } else {
                const filteredItems = window.menuItems.filter(item => 
                    item.category.toLowerCase() === category.toLowerCase()
                );
                displayMenuItems(filteredItems);
            }
        });
    });
}

// Set up event listeners for add to cart buttons
function setupAddToCartEventListeners() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            const item = window.menuItems.find(menuItem => menuItem.id === itemId);
            
            if (item) {
                addItemToCart(item);
                
                // Visual feedback for adding to cart
                const originalText = this.textContent;
                this.textContent = 'Added!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 1000);
            }
        });
    });
}

// Add item to cart and update display
function addItemToCart(item) {
    // Use utility function from main.js
    window.addItemToCart(item);
    
    // Also update the cart display on this page
    updateCartDisplay();
}

// Update cart display on menu page
function updateCartDisplay() {
    const cart = getCurrentCart();
    const currentOrderDiv = document.getElementById('currentOrder');
    
    if (!currentOrderDiv) {
        // If cart display element doesn't exist on this page, skip update
        return;
    }
    
    // Clear current order display
    currentOrderDiv.innerHTML = '';
    
    if (cart.length === 0) {
        currentOrderDiv.innerHTML = '<p>No items in order</p>';
        document.getElementById('orderTotal').textContent = '0.00';
        return;
    }
    
    // Calculate total
    let total = 0;
    
    // Add each item to the order display
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <br>
                <small>Qty: ${item.quantity} x $${formatCurrency(item.price)}</small>
            </div>
            <div>$${formatCurrency(itemTotal)}</div>
        `;
        
        currentOrderDiv.appendChild(orderItem);
    });
    
    // Update total
    document.getElementById('orderTotal').textContent = formatCurrency(total);
}

// Utility function to format currency (from main.js)
function formatCurrency(amount) {
    return (amount / 1000).toFixed(2);
}

// Utility function to get current cart (from main.js)
function getCurrentCart() {
    const cart = localStorage.getItem(window.APP_CONSTANTS.CART_KEY);
    return cart ? JSON.parse(cart) : [];
}