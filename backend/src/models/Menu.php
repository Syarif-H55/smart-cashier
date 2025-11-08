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
    
    public function create($name, $category, $price, $image_url = null) {
        $stmt = $this->db->prepare("INSERT INTO menus (name, category, price, image_url) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$name, $category, $price, $image_url]);
    }
    
    public function updateAvailability($id, $is_available) {
        $stmt = $this->db->prepare("UPDATE menus SET is_available = ? WHERE id = ?");
        return $stmt->execute([$is_available, $id]);
    }
    
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM menus WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>