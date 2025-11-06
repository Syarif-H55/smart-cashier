# Smart Cashier Web App - Frontend MVP Summary

## 1. Overview
Tahap Frontend MVP bertujuan untuk membangun antarmuka pengguna yang fungsional dan responsif untuk aplikasi kasir restoran, dengan fokus pada struktur dasar, navigasi, dan simulasi alur bisnis utama. Implementasi menggunakan vanilla HTML, CSS, dan JavaScript untuk memastikan fondasi yang solid sebelum integrasi dengan backend PHP.

## 2. Feature Breakdown

### Halaman Login (`login.html`)
- Form login dengan field username dan password
- Tombol "Login" dengan validasi client-side sederhana
- Redirect dummy ke dashboard (tanpa autentikasi sebenarnya)
- Design responsive dengan branding restoran

### Dashboard Kasir (`dashboard.html`)
**Header Section:**
- Nama restoran dan logo
- Tombol logout (redirect ke login)
- Informasi user/session dummy

**Sidebar Navigation:**
- Menu Kasir (active state)
- Daftar Pesanan
- Laporan Harian
- Pengaturan
- Styling dengan hover effects dan icons

**Main Content Area:**
- Grid layout daftar menu makanan & minuman
- Setiap item menu berisi:
  - Gambar menu (placeholder)
  - Nama menu
  - Harga
  - Tombol "Tambah ke Pesanan"
- Kategori menu (Makanan, Minuman, dll)

### Halaman Checkout (`checkout.html`)
- List pesanan sementara dengan quantity
- Perhitungan subtotal, pajak, dan total
- Form input metode pembayaran (dummy)
- Tombol "Konfirmasi Pembayaran"
- Tombol "Kembali ke Menu"

## 3. User Flow
1. **Login** → User masuk ke halaman login → input credentials → klik login → redirect ke dashboard
2. **Dashboard** → User melihat daftar menu → klik "Tambah ke Pesanan" pada beberapa item → item masuk cart sementara
3. **Checkout** → User navigasi ke halaman checkout dari sidebar → melihat ringkasan pesanan → konfirmasi pembayaran → tampilkan receipt dummy
4. **Logout** → Klik tombol logout → redirect ke halaman login

## 4. Frontend Folder Structure
```
smart-cashier-frontend/
├── index.html (redirect ke login)
├── pages/
│   ├── login.html
│   ├── dashboard.html
│   └── checkout.html
├── css/
│   ├── styles.css (global styles)
│   ├── components/
│   │   ├── header.css
│   │   ├── sidebar.css
│   │   └── menu-grid.css
│   └── pages/
│       ├── login.css
│       └── dashboard.css
├── js/
│   ├── app.js (main application logic)
│   ├── modules/
│   │   ├── auth.js (login/logout simulation)
│   │   ├── cart.js (cart management)
│   │   ├── menu.js (menu data & rendering)
│   │   └── utils.js (helper functions)
│   └── data/
│       └── dummy-data.js (sample menu items)
├── assets/
│   ├── images/
│   │   ├── logo.png
│   │   └── menu-items/
│   └── icons/
└── config/
    └── constants.js
```

## 5. Notes for Backend Integration

### Data Structure Preparation
```javascript
// Sample data structure ready for backend integration
const menuItem = {
    id: "menu_001",
    name: "Nasi Goreng",
    category: "makanan",
    price: 25000,
    image: "path/to/image",
    stock: 10,
    is_available: true
};

const order = {
    order_id: "ORD_001",
    items: [
        {
            menu_id: "menu_001",
            quantity: 2,
            price: 25000,
            notes: "Pedas"
        }
    ],
    total: 50000,
    status: "pending"
};
```

### API Ready Functions
- Fungsi JavaScript sudah dipersiapkan dengan placeholder untuk API calls
- Error handling structure sudah diimplementasikan
- Loading states dan user feedback sudah disiapkan

### Key Integration Points
1. **Authentication**: Ganti redirect dummy dengan actual API login
2. **Menu Data**: Replace dummy data dengan fetch dari backend
3. **Order Management**: Implementasi API untuk create/update orders
4. **Payment Processing**: Integrasi dengan payment gateway
5. **Real-time Updates**: WebSocket untuk order updates

### Development Recommendations
- Gunakan consistent naming conventions untuk memudahkan integration
- Implementasi proper error handling di frontend
- Siapkan loading states untuk semua async operations
- Maintain separation of concerns antara UI logic dan business logic

Dokumen ini memberikan fondasi yang solid untuk pengembangan frontend MVP dan memastikan kemudahan integrasi dengan backend PHP di fase selanjutnya.