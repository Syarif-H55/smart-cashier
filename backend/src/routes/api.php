<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/MenuController.php';
require_once __DIR__ . '/../controllers/TransactionController.php';

class Router {
    private $routes = [];
    
    public function addRoute($method, $path, $handler) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        // Check if the path was passed in PATH_INFO environment variable from rewrite rule
        $path = $_SERVER['PATH_INFO'] ?? '';
        
        if (empty($path)) {
            // If not in PATH_INFO, check query parameter
            $path = $_GET['path'] ?? '';
        }
        
        if (empty($path)) {
            // If not in PATH_INFO or query parameter, extract from URI
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            // Remove api prefix
            $path = str_replace('/api/', '', $path);
        }
        
        // Handle CORS preflight requests
        if ($method === 'OPTIONS') {
            $this->handleCORS();
            return;
        }
        
        // Get request body
        $request_body = file_get_contents('php://input');
        $request_data = json_decode($request_body, true) ?: [];
        
        foreach ($this->routes as $route) {
            if ($this->matchRoute($method, $path, $route['method'], $route['path'])) {
                // Extract route parameters
                $params = $this->extractParams($path, $route['path']);
                
                // Handle the request
                $handler = $route['handler'];
                
                // Call the handler with request data and parameters
                if (is_callable($handler)) {
                    $handler($request_data, $params);
                    return;
                } else {
                    // If it's not a callable, it might be a controller method
                    $this->callControllerMethod($handler, $request_data, $params);
                    return;
                }
            }
        }
        
        // Handle CORS for actual requests
        $this->handleCORS();
        
        // Return 404 if no route matches
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Route not found']);
    }
    
    private function matchRoute($request_method, $request_path, $route_method, $route_path) {
        // Ensure both paths start with a slash for matching
        if (substr($request_path, 0, 1) !== '/') {
            $request_path = '/' . $request_path;
        }
        if (substr($route_path, 0, 1) !== '/') {
            $route_path = '/' . $route_path;
        }
        
        // Convert route path with parameters to regex pattern
        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $route_path);
        $pattern = '#^' . $pattern . '$#';
        
        // Check if methods match and path matches
        return $request_method === $route_method && preg_match($pattern, $request_path, $matches);
    }
    
    private function extractParams($request_path, $route_path) {
        // Extract parameter names from route path
        preg_match_all('/\{([^}]+)\}/', $route_path, $param_names);
        $param_names = $param_names[1];
        
        // Convert route path to pattern to extract values
        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $route_path);
        $pattern = '#^' . $pattern . '$#';
        
        // Extract parameter values
        preg_match($pattern, $request_path, $matches);
        array_shift($matches); // Remove full match
        
        // Create associative array of param names and values
        $params = [];
        for ($i = 0; $i < count($param_names); $i++) {
            if (isset($matches[$i])) {
                $params[$param_names[$i]] = $matches[$i];
            }
        }
        
        return $params;
    }
    
    private function callControllerMethod($handler, $request_data, $params) {
        // Split controller and method
        list($controller_name, $method_name) = explode('@', $handler);
        
        // Create instance of controller
        $controller = new $controller_name();
        
        // Determine how to call the method based on expected parameters
        if (empty($params)) {
            // If no parameters, just pass the request data
            $controller->$method_name($request_data);
        } else {
            // If there are parameters, check if the method expects just the ID
            $first_param_value = reset($params);
            
            // For methods that only need an ID (like getById, delete), pass only the ID
            if ($method_name === 'getById' || $method_name === 'updateAvailability' || $method_name === 'delete' || $method_name === 'getTransaction') {
                $controller->$method_name($first_param_value);
            } else {
                // For methods that need request data AND a parameter, pass both
                $controller->$method_name($request_data, $first_param_value);
            }
        }
    }
    
    private function handleCORS() {
        header('Access-Control-Allow-Origin: http://localhost:8080');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
}

// Initialize router and define routes
$router = new Router();

// Authentication routes
$router->addRoute('POST', '/login', 'AuthController@login');
$router->addRoute('POST', '/register', 'AuthController@register');

// Menu routes
$router->addRoute('GET', '/menu', 'MenuController@getAll');
$router->addRoute('GET', '/menu/{id}', 'MenuController@getById');
$router->addRoute('POST', '/menu', 'MenuController@create');
$router->addRoute('PUT', '/menu/{id}/availability', 'MenuController@updateAvailability');
$router->addRoute('DELETE', '/menu/{id}', 'MenuController@delete');

// Transaction routes
$router->addRoute('POST', '/transaction', 'TransactionController@create');
$router->addRoute('GET', '/transaction/{id}', 'TransactionController@getTransaction');
$router->addRoute('GET', '/transaction', 'TransactionController@getAll');

// Handle the request
$router->handleRequest();
?>