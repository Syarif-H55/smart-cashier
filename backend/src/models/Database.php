<?php
require_once __DIR__ . '/../config/db.php';

class Database {
    private static $connection = null;
    
    public static function getConnection() {
        if (self::$connection === null) {
            self::$connection = DatabaseConfig::getConnection();
        }
        return self::$connection;
    }
}
?>