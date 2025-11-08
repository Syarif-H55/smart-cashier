<?php
require_once __DIR__ . '/../models/User.php';

class Auth {
    public static function verifyToken($token) {
        try {
            $decoded = base64_decode($token);
            $data = json_decode($decoded, true);
            
            if ($data && isset($data['user_id']) && isset($data['expires'])) {
                if ($data['expires'] > time()) {
                    $userModel = new User();
                    $user = $userModel->findById($data['user_id']);
                    
                    if ($user) {
                        return $user;
                    }
                }
            }
            
            return false;
        } catch (Exception $e) {
            return false;
        }
    }
    
    public static function getUserIdFromToken($token) {
        try {
            $decoded = base64_decode($token);
            $data = json_decode($decoded, true);
            
            return $data['user_id'] ?? null;
        } catch (Exception $e) {
            return null;
        }
    }
    
    public static function generateToken($user) {
        // Simple token generation for MVP
        return base64_encode(json_encode([
            'user_id' => $user['id'],
            'username' => $user['username'],
            'expires' => time() + (24 * 60 * 60) // 24 hours
        ]));
    }
}
?>