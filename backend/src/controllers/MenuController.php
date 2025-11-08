<?php
require_once __DIR__ . '/../models/Menu.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Auth.php';
require_once __DIR__ . '/../utils/Helpers.php';

class MenuController {
    private $menuModel;
    
    public function __construct() {
        $this->menuModel = new Menu();
    }
    
    public function getAll() {
        try {
            $menus = $this->menuModel->getAll();
            return Response::success($menus);
        } catch (Exception $e) {
            return Response::serverError('Failed to retrieve menu items');
        }
    }
    
    public function getById($id) {
        try {
            $menu = $this->menuModel->findById($id);
            
            if (!$menu) {
                return Response::notFound('Menu item not found');
            }
            
            return Response::success($menu);
        } catch (Exception $e) {
            return Response::serverError('Failed to retrieve menu item');
        }
    }
    
    public function create($request) {
        // Check authentication (simplified for MVP)
        $bearer_token = Helpers::getBearerToken();
        $user = Auth::verifyToken($bearer_token);
        
        if (!$user) {
            return Response::unauthorized();
        }
        
        $name = $request['name'] ?? '';
        $category = $request['category'] ?? '';
        $price = $request['price'] ?? 0;
        $image_url = $request['image_url'] ?? null;
        
        if (empty($name) || empty($category) || $price <= 0) {
            return Response::error('Name, category, and price are required', 400);
        }
        
        if (!in_array($category, ['food', 'beverage', 'dessert'])) {
            return Response::error('Invalid category. Must be food, beverage, or dessert', 400);
        }
        
        try {
            $result = $this->menuModel->create($name, $category, $price, $image_url);
            
            if ($result) {
                return Response::success(['message' => 'Menu item created successfully'], 201);
            } else {
                return Response::error('Failed to create menu item', 500);
            }
        } catch (Exception $e) {
            return Response::serverError('Failed to create menu item');
        }
    }
    
    public function updateAvailability($id, $request) {
        // Check authentication (simplified for MVP)
        $bearer_token = Helpers::getBearerToken();
        $user = Auth::verifyToken($bearer_token);
        
        if (!$user) {
            return Response::unauthorized();
        }
        
        $is_available = $request['is_available'] ?? null;
        
        if ($is_available === null) {
            return Response::error('is_available field is required', 400);
        }
        
        if (!is_bool($is_available) && !in_array($is_available, [0, 1, '0', '1'])) {
            return Response::error('is_available must be a boolean value', 400);
        }
        
        try {
            $result = $this->menuModel->updateAvailability($id, $is_available);
            
            if ($result) {
                return Response::success(['message' => 'Menu availability updated successfully']);
            } else {
                return Response::error('Failed to update menu availability', 500);
            }
        } catch (Exception $e) {
            return Response::serverError('Failed to update menu availability');
        }
    }
    
    public function delete($id) {
        // Check authentication (simplified for MVP)
        $bearer_token = Helpers::getBearerToken();
        $user = Auth::verifyToken($bearer_token);
        
        if (!$user) {
            return Response::unauthorized();
        }
        
        try {
            $result = $this->menuModel->delete($id);
            
            if ($result) {
                return Response::success(['message' => 'Menu item deleted successfully']);
            } else {
                return Response::error('Failed to delete menu item', 500);
            }
        } catch (Exception $e) {
            return Response::serverError('Failed to delete menu item');
        }
    }
}
?>