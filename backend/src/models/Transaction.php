<?php
require_once __DIR__ . '/Database.php';

class Transaction {
    private $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    public function create($user_id, $total_amount, $payment_method = 'cash', $status = 'completed') {
        $transaction_code = $this->generateTransactionCode();
        
        $stmt = $this->db->prepare("INSERT INTO transactions (transaction_code, user_id, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?)");
        $result = $stmt->execute([$transaction_code, $user_id, $total_amount, $payment_method, $status]);
        
        if ($result) {
            return [
                'id' => $this->db->lastInsertId(),
                'transaction_code' => $transaction_code
            ];
        }
        
        return false;
    }
    
    public function addItem($transaction_id, $menu_id, $quantity, $unit_price) {
        $subtotal = $quantity * $unit_price;
        $stmt = $this->db->prepare("INSERT INTO transaction_items (transaction_id, menu_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$transaction_id, $menu_id, $quantity, $unit_price, $subtotal]);
    }
    
    public function getTransaction($id) {
        $stmt = $this->db->prepare("SELECT * FROM transactions WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getTransactionItems($transaction_id) {
        $stmt = $this->db->prepare("SELECT ti.*, m.name as menu_name FROM transaction_items ti JOIN menus m ON ti.menu_id = m.id WHERE ti.transaction_id = ?");
        $stmt->execute([$transaction_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getAllTransactions() {
        $stmt = $this->db->prepare("SELECT * FROM transactions ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    private function generateTransactionCode() {
        return "TRX-" . date('Ymd') . "-" . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
    }
}
?>