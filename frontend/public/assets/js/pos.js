// POS (Point of Sale) page functionality for Smart Cashier Web App
// Handles order processing, payment, and transaction management

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    initializePOSPage();
});

// Initialize POS page functionality
async function initializePOSPage() {
    try {
        // Load menu items for POS
        await loadPosMenuItems();
        
        // Setup event listeners
        setupPOSEventListeners();
        
        // Load current order
        loadCurrentOrder();
        
        // Calculate and display totals
        calculateAndDisplayTotals();
    } catch (error) {
        console.error('Error initializing POS page:', error);
        showMessage('Failed to initialize POS system. Please try again later.', 'error');
    }
}

// Load menu items for POS display
async function loadPosMenuItems() {
    try {
        // Use API module to get menu items
        // Backend integration point: This will connect to PHP MenuController
        const response = await API.Menu.getAllMenuItems();
        
        if (response.success) {
            // Store menu items in a global variable for POS
            window.posMenuItems = response.data;
            
            // Display all menu items in POS grid
            displayPosMenuItems(window.posMenuItems);
        } else {
            throw new Error(response.message || 'Failed to load menu items');
        }
    } catch (error) {
        console.error('Error loading POS menu items:', error);
        showMessage('Failed to load menu items. Using default menu.', 'error');
        
        // Use default menu items if API fails
        window.posMenuItems = getDefaultMenuItems();
        displayPosMenuItems(window.posMenuItems);
    }
}

// Display menu items in POS layout
function displayPosMenuItems(items) {
    const menuContainer = document.getElementById('posMenuItems');
    if (!menuContainer) {
        console.error('POS menu container not found');
        return;
    }
    
    // Clear existing content
    menuContainer.innerHTML = '';
    
    // Create and append menu items
    items.forEach(item => {
        if (item.is_available) {
            const menuItemElement = createPosMenuItemElement(item);
            menuContainer.appendChild(menuItemElement);
        }
    });
    
    // Setup event listeners for POS add to cart buttons
    setupPosAddToCartEventListeners();
}

// Create a POS menu item element
function createPosMenuItemElement(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.dataset.id = item.id;
    
    menuItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/img/placeholder-food.jpg'; this.alt='Menu Item';">
        <div class="menu-item-info">
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-price">$${formatCurrency(item.price)}</div>
            <button class="add-to-cart-btn" data-item-id="${item.id}">Add to Order</button>
        </div>
    `;
    
    return menuItem;
}

// Set up event listeners for POS page
function setupPOSEventListeners() {
    // Set up search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Set up checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }
    
    // Set up cancel order button
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', cancelCurrentOrder);
    }
}

// Handle search in POS menu
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        // If search is empty, show all items
        displayPosMenuItems(window.posMenuItems);
        return;
    }
    
    // Filter items based on search term
    const filteredItems = window.posMenuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
    );
    
    displayPosMenuItems(filteredItems);
}

// Set up event listeners for POS add to cart buttons
function setupPosAddToCartEventListeners() {
    const addToCartButtons = document.querySelectorAll('#posMenuItems .add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            const item = window.posMenuItems.find(menuItem => menuItem.id === itemId);
            
            if (item) {
                addItemToOrder(item);
                
                // Visual feedback for adding to cart
                const originalText = this.textContent;
                this.textContent = 'Added!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 1000);
                
                // Update order display and totals
                loadCurrentOrder();
                calculateAndDisplayTotals();
            }
        });
    });
}

// Add item to order
function addItemToOrder(item) {
    // Use the same function from main.js to add item to cart
    window.addItemToCart(item);
}

// Load current order and display it
function loadCurrentOrder() {
    const cart = getCurrentCart();
    const orderItemsContainer = document.getElementById('orderItems');
    
    if (!orderItemsContainer) {
        console.error('Order items container not found');
        return;
    }
    
    // Clear current order display
    orderItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p>No items in current order</p>';
        return;
    }
    
    // Add each item to the order display
    cart.forEach((item, index) => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.dataset.index = index;
        
        const itemTotal = item.price * item.quantity;
        
        orderItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <br>
                <small>Qty: ${item.quantity} x $${formatCurrency(item.price)}</small>
            </div>
            <div>
                $${formatCurrency(itemTotal)}
                <button class="remove-item-btn" data-index="${index}">&times;</button>
            </div>
        `;
        
        orderItemsContainer.appendChild(orderItem);
    });
    
    // Setup event listeners for remove item buttons
    setupRemoveItemEventListeners();
}

// Set up event listeners for remove item buttons
function setupRemoveItemEventListeners() {
    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemIndex = parseInt(this.getAttribute('data-index'));
            removeItemFromOrder(itemIndex);
        });
    });
}

// Remove item from order
function removeItemFromOrder(index) {
    const cart = getCurrentCart();
    
    if (index >= 0 && index < cart.length) {
        // Remove item from cart
        cart.splice(index, 1);
        
        // Save updated cart
        saveCartToStorage(cart);
        
        // Update display
        loadCurrentOrder();
        calculateAndDisplayTotals();
    }
}

// Calculate and display order totals
function calculateAndDisplayTotals() {
    const cart = getCurrentCart();
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate tax (10%)
    const tax = subtotal * 0.10;
    
    // Calculate total
    const total = subtotal + tax;
    
    // Update display
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('total').textContent = formatCurrency(total);
}

// Process checkout
async function processCheckout() {
    const cart = getCurrentCart();
    
    if (cart.length === 0) {
        showMessage('Cannot checkout with an empty order', 'error');
        return;
    }
    
    // Get payment method
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    // Show loading state
    const checkoutBtn = document.getElementById('checkoutBtn');
    const originalText = checkoutBtn.textContent;
    checkoutBtn.textContent = 'Processing...';
    checkoutBtn.disabled = true;
    
    try {
        // Prepare order data
        const orderData = {
            items: cart,
            subtotal: parseFloat(document.getElementById('subtotal').textContent),
            tax: parseFloat(document.getElementById('tax').textContent),
            total: parseFloat(document.getElementById('total').textContent),
            payment_method: paymentMethod,
            status: 'completed'
        };
        
        // Use API module to create order
        // Backend integration point: This will connect to PHP TransactionController
        const orderResponse = await API.Order.createOrder(orderData);
        
        if (orderResponse.success) {
            // Process payment using API
            // Backend integration point: This will connect to payment processing in PHP
            const paymentData = {
                order_id: orderResponse.data.order_id,
                amount: orderData.total,
                method: paymentMethod
            };
            
            const paymentResponse = await API.Payment.processPayment(paymentData);
            
            if (paymentResponse.success) {
                showMessage('Order processed successfully!', 'success');
                
                // Clear the cart
                clearCart();
                
                // Update display
                loadCurrentOrder();
                calculateAndDisplayTotals();
                
                // Redirect to menu after a delay
                setTimeout(() => {
                    window.location.href = 'menu.html';
                }, 2000);
            } else {
                throw new Error(paymentResponse.message || 'Payment processing failed');
            }
        } else {
            throw new Error(orderResponse.message || 'Order creation failed');
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        showMessage('Error processing checkout: ' + error.message, 'error');
    } finally {
        // Restore button state
        checkoutBtn.textContent = originalText;
        checkoutBtn.disabled = false;
    }
}

// Cancel current order
function cancelCurrentOrder() {
    // Confirm cancellation
    if (confirm('Are you sure you want to cancel the current order?')) {
        // Clear the cart
        clearCart();
        
        // Update display
        loadCurrentOrder();
        calculateAndDisplayTotals();
        
        showMessage('Order cancelled', 'success');
    }
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

// Utility function to save cart to localStorage (from main.js)
function saveCartToStorage(cart) {
    localStorage.setItem(window.APP_CONSTANTS.CART_KEY, JSON.stringify(cart));
}

// Utility function to clear cart (from main.js)
function clearCart() {
    localStorage.removeItem(window.APP_CONSTANTS.CART_KEY);
}

// Define default menu items for fallback (same as in menu.js)
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