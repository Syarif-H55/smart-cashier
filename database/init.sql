-- Tabel users untuk autentikasi
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'cashier') DEFAULT 'cashier',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel menus untuk data menu
CREATE TABLE menus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('food', 'beverage', 'dessert') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel transactions untuk transaksi
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_code VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'qris') DEFAULT 'cash',
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel transaction_items untuk detail item transaksi
CREATE TABLE transaction_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    menu_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (menu_id) REFERENCES menus(id)
);

-- Insert sample user (username: cashier01, password: password123)
INSERT INTO users (username, password_hash, full_name, role) VALUES 
('cashier01', '$2y$10$KIXI8HMMGWE3ZDCL2248L.oGmOSq2Nq7F0FlIHZVxjHBTA0.Wm0kW', 'John Cashier', 'cashier'),
('admin01', '$2y$10$KIXI8HMMGWE3ZDCL2248L.oGmOSq2Nq7F0FlIHZVxjHBTA0.Wm0kW', 'Admin User', 'admin');

-- The password hash above is for 'password123' using password_hash('password123', PASSWORD_DEFAULT)

-- Insert sample menu items
INSERT INTO menus (name, category, price, image_url, is_available) VALUES 
('Nasi Goreng Special', 'food', 25000.00, '/images/nasi-goreng.jpg', TRUE),
('Mie Goreng', 'food', 22000.00, '/images/mie-goreng.jpg', TRUE),
('Es Teh Manis', 'beverage', 8000.00, '/images/es-teh.jpg', TRUE),
('Es Jeruk', 'beverage', 10000.00, '/images/es-jeruk.jpg', TRUE),
('Pisang Goreng', 'dessert', 15000.00, '/images/pisang-goreng.jpg', TRUE),
('Kue Lapis', 'dessert', 12000.00, '/images/kue-lapis.jpg', TRUE);