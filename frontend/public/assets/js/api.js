// API module for Smart Cashier Web App
// Contains placeholder functions for backend integration
// These functions will connect to the PHP backend in the future

// Base URL for API endpoints
const API_BASE_URL = '/api'; // This will be configured based on deployment

// Authentication API functions
const AuthAPI = {
    // Login function - connects to backend authentication
    // Backend integration point: POST /api/auth/login
    login: async (credentials) => {
        console.log('API Call: Login with credentials', credentials);
        
        // In the future, this will make an actual API call to the backend
        // Example: return await fetch(`${API_BASE_URL}/auth/login`, {...});
        
        // For MVP, we'll simulate a successful login
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        token: 'mock_token_' + Date.now(),
                        user: {
                            id: 1,
                            username: credentials.username,
                            role: 'cashier'
                        }
                    },
                    message: 'Login successful'
                });
            }, 500);
        });
    },
    
    // Logout function - connects to backend logout
    // Backend integration point: POST /api/auth/logout
    logout: async () => {
        console.log('API Call: Logout');
        
        // In the future, this will make an actual API call to the backend
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Logout successful'
                });
            }, 300);
        });
    }
};

// Menu API functions
const MenuAPI = {
    // Get all menu items - connects to backend menu controller
    // Backend integration point: GET /api/menu
    getAllMenuItems: async () => {
        console.log('API Call: Get all menu items');
        
        // In the future, this will make an actual API call to the backend
        // Example: return await fetch(`${API_BASE_URL}/menu`, {...});
        
        // For MVP, return dummy data that matches backend expected format
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: [
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
                    ],
                    message: 'Menu items retrieved successfully'
                });
            }, 500);
        });
    },
    
    // Get menu items by category
    // Backend integration point: GET /api/menu?category={category}
    getMenuItemsByCategory: async (category) => {
        console.log('API Call: Get menu items by category', category);
        
        return MenuAPI.getAllMenuItems()
            .then(response => {
                if (response.success) {
                    const filteredItems = response.data.filter(item => 
                        item.category.toLowerCase() === category.toLowerCase()
                    );
                    return {
                        success: true,
                        data: filteredItems,
                        message: `Menu items in ${category} category retrieved successfully`
                    };
                }
                return response;
            });
    }
};

// Order API functions
const OrderAPI = {
    // Create new order - connects to backend transaction controller
    // Backend integration point: POST /api/orders
    createOrder: async (orderData) => {
        console.log('API Call: Create new order', orderData);
        
        // In the future, this will make an actual API call to the backend
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        order_id: 'ORD_' + Date.now(),
                        ...orderData,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    },
                    message: 'Order created successfully'
                });
            }, 700);
        });
    },
    
    // Update existing order
    // Backend integration point: PUT /api/orders/{id}
    updateOrder: async (orderId, orderData) => {
        console.log('API Call: Update order', orderId, orderData);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        order_id: orderId,
                        ...orderData,
                        updated_at: new Date().toISOString()
                    },
                    message: 'Order updated successfully'
                });
            }, 500);
        });
    },
    
    // Get order by ID
    // Backend integration point: GET /api/orders/{id}
    getOrderById: async (orderId) => {
        console.log('API Call: Get order by ID', orderId);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        order_id: orderId,
                        items: [],
                        total: 0,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    },
                    message: 'Order retrieved successfully'
                });
            }, 400);
        });
    }
};

// Payment API functions
const PaymentAPI = {
    // Process payment for an order
    // Backend integration point: POST /api/payments/process
    processPayment: async (paymentData) => {
        console.log('API Call: Process payment', paymentData);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        payment_id: 'PAY_' + Date.now(),
                        order_id: paymentData.order_id,
                        amount: paymentData.amount,
                        method: paymentData.method,
                        status: 'completed',
                        processed_at: new Date().toISOString()
                    },
                    message: 'Payment processed successfully'
                });
            }, 800);
        });
    }
};

// Export API modules for use in other JavaScript files
// When backend is implemented, these will make real HTTP requests
const API = {
    Auth: AuthAPI,
    Menu: MenuAPI,
    Order: OrderAPI,
    Payment: PaymentAPI
};

// Example of a generic API call function that can be used for any endpoint
const makeAPICall = async (endpoint, options = {}) => {
    console.log(`API Call: ${options.method || 'GET'} ${endpoint}`, options);
    
    // This would be replaced with actual fetch call to backend:
    // return await fetch(`${API_BASE_URL}${endpoint}`, {
    //   method: options.method || 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${getAuthToken()}`
    //   },
    //   body: options.body ? JSON.stringify(options.body) : undefined
    // });
    
    // For MVP, return a generic mock response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: {},
                message: 'API call successful'
            });
        }, 500);
    });
};