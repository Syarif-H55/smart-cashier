<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Auth.php';

class AuthController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function login($request) {
        $username = $request['username'] ?? '';
        $password = $request['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            return Response::error('Username and password are required', 400);
        }
        
        $user = $this->userModel->findByUsername($username);
        
        if ($user && password_verify($password, $user['password_hash'])) {
            $token = Auth::generateToken($user);
            
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
    
    public function register($request) {
        $username = $request['username'] ?? '';
        $password = $request['password'] ?? '';
        $full_name = $request['full_name'] ?? '';
        $role = $request['role'] ?? 'cashier';
        
        if (empty($username) || empty($password) || empty($full_name)) {
            return Response::error('Username, password, and full name are required', 400);
        }
        
        // Check if username already exists
        $existing_user = $this->userModel->findByUsername($username);
        if ($existing_user) {
            return Response::error('Username already exists', 400);
        }
        
        $result = $this->userModel->create($username, $password, $full_name, $role);
        
        if ($result) {
            return Response::success(['message' => 'User registered successfully']);
        } else {
            return Response::error('Failed to register user', 500);
        }
    }
}
?>