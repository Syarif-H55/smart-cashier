# Smart Cashier Web App - Backend MVP Summary

## 1. Overview
Tahap Backend MVP bertujuan untuk mengembangkan REST API server yang menangani autentikasi, manajemen menu, dan proses transaksi untuk aplikasi Smart Cashier. Backend ini akan berkomunikasi dengan frontend yang sudah berjalan di localhost:8080 dan menyediakan data persistent melalui database MySQL.

## 2. Backend MVP Objectives
- **Authentication System**: Memverifikasi kredensial user dan memberikan akses token
- **Menu Management**: Menyediakan endpoint untuk mengambil daftar menu yang tersedia
- **Transaction Processing**: Menangani penyimpanan data transaksi dan perhitungan total
- **API Integration**: Menyediakan REST API endpoints yang siap dikonsumsi frontend
- **Database Connectivity**: Membangun koneksi yang stabil antara PHP dan MySQL

## 3. Technical Architecture

### Stack Technology
- **Backend Language**: PHP 8.1+
- **Web Server**: Apache/Nginx via Docker
- **Database**: MySQL 8.0
- **API Format**: JSON REST API
- **Containerization**: Docker & Docker Compose

### Database Schema MVP
```sql
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
```

## 4. API Endpoints Specification

### Authentication Endpoints
**POST /api/login**
```php
// Request
{
    "username": "cashier01",
    "password": "password123"
}

// Response Success
{
    "status": "success",
    "data": {
        "user_id": 1,
        "username": "cashier01",
        "full_name": "John Cashier",
        "role": "cashier",
        "token": "jwt_token_here"
    }
}

// Response Error
{
    "status": "error",
    "message": "Invalid credentials"
}
```

### Menu Endpoints
**GET /api/menu**
```php
// Response Success
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Nasi Goreng Special",
            "category": "food",
            "price": 25000.00,
            "image_url": "/images/nasi-goreng.jpg",
            "is_available": true
        },
        {
            "id": 2,
            "name": "Es Teh Manis",
            "category": "beverage",
            "price": 8000.00,
            "image_url": "/images/es-teh.jpg",
            "is_available": true
        }
    ]
}
```

### Transaction Endpoints
**POST /api/transaction**
```php
// Request
{
    "user_id": 1,
    "items": [
        {
            "menu_id": 1,
            "quantity": 2,
            "unit_price": 25000
        },
        {
            "menu_id": 2,
            "quantity": 1,
            "unit_price": 8000
        }
    ],
    "payment_method": "cash"
}

// Response Success
{
    "status": "success",
    "data": {
        "transaction_id": 1001,
        "transaction_code": "TRX-20231201-001",
        "total_amount": 58000.00,
        "created_at": "2023-12-01 14:30:00"
    }
}
```

## 5. Backend Folder Structure & Implementation

### Complete File Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── db.php
│   │   └── config.php
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── MenuController.php
│   │   └── TransactionController.php
│   ├── models/
│   │   ├── User.php
│   │   ├── Menu.php
│   │   ├── Transaction.php
│   │   └── Database.php
│   ├── routes/
│   │   └── api.php
│   ├── utils/
│   │   ├── Response.php
│   │   ├── Auth.php
│   │   └── Helpers.php
│   └── index.php
├── composer.json
├── Dockerfile
├── .env.example
└── docker-compose.yml
```

### Core File Implementations

**src/config/db.php**
```php
<?php
class DatabaseConfig {
    public static function getConnection() {
        $host = getenv('DB_HOST') ?: 'mysql';
        $dbname = getenv('DB_NAME') ?: 'smart_cashier';
        $username = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASS') ?: 'password';
        
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $pdo;
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
}
?>
```

**src/controllers/AuthController.php**
```php
<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function login($request) {
        $username = $request['username'] ?? '';
        $password = $request['password'] ?? '';
        
        $user = $this->userModel->findByUsername($username);
        
        if ($user && password_verify($password, $user['password_hash'])) {
            $token = $this->generateToken($user);
            
            return Response::success([
                'user_id' => $user['id'],
                'username' => $user['username'],
                'full_name' => $user['full_name'],
                'role' => $user['role'],
                'token' => $token
            ]);
        }
        
        return Response::error('Invalid credentials', 401);
    }
    
    private function generateToken($user) {
        // Simple token generation for MVP
        return base64_encode(json_encode([
            'user_id' => $user['id'],
            'username' => $user['username'],
            'expires' => time() + (24 * 60 * 60) // 24 hours
        ]));
    }
}
?>
```

**src/models/Menu.php**
```php
<?php
require_once __DIR__ . '/Database.php';

class Menu {
    private $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    public function getAll() {
        $stmt = $this->db->prepare("SELECT * FROM menus WHERE is_available = TRUE ORDER BY category, name");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM menus WHERE id = ? AND is_available = TRUE");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
```

## 6. Docker Configuration

### Dockerfile
```dockerfile
FROM php:8.1-apache

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy application files
COPY . /var/www/html/
COPY src/ /var/www/html/src/

# Set working directory
WORKDIR /var/www/html

# Install Composer (if needed)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Change document root for Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/src
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:80"
    environment:
      - DB_HOST=mysql
      - DB_NAME=smart_cashier
      - DB_USER=root
      - DB_PASS=password
    volumes:
      - ./backend/src:/var/www/html/src
    depends_on:
      - mysql
    networks:
      - cashier-network

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: smart_cashier
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - cashier-network

volumes:
  mysql_data:

networks:
  cashier-network:
    driver: bridge
```

## 7. Composer Configuration

**composer.json**
```json
{
    "name": "smart-cashier/backend",
    "description": "Backend API for Smart Cashier Application",
    "type": "project",
    "require": {
        "php": ">=8.1",
        "ext-pdo": "*",
        "ext-json": "*"
    },
    "autoload": {
        "psr-4": {
            "SmartCashier\\": "src/"
        }
    },
    "authors": [
        {
            "name": "Development Team",
            "email": "dev@smartcashier.com"
        }
    ]
}
```

## 8. Development Workflow

### Initial Setup
1. **Clone & Setup**: Clone repository dan jalankan `docker-compose up -d`
2. **Database Initialization**: Import skema database dari `database/init.sql`
3. **Dummy Data**: Seed database dengan sample users dan menu items
4. **API Testing**: Test endpoints menggunakan Postman/curl

### Testing Endpoints
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cashier01","password":"password123"}'

# Test menu endpoint
curl -X GET http://localhost:8000/api/menu

# Test transaction endpoint
curl -X POST http://localhost:8000/api/transaction \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"items":[{"menu_id":1,"quantity":2}],"payment_method":"cash"}'
```

## 9. Integration Notes

### CORS Configuration
```php
// Add to src/index.php for frontend-backend communication
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Environment Variables
Create `.env` file for configuration:
```
DB_HOST=mysql
DB_NAME=smart_cashier
DB_USER=root
DB_PASS=password
API_BASE_URL=http://localhost:8000/api
```

### Next Steps After MVP
- Implement JWT token validation
- Add input validation and sanitization
- Implement error logging
- Add rate limiting for API endpoints
- Implement database migrations
- Add unit tests for controllers and models

Backend MVP ini memberikan fondasi yang solid untuk integrasi dengan frontend dan siap untuk pengembangan fitur tambahan seperti laporan, manajemen stok, dan multi-user support.