<?php
require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../models/Menu.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Auth.php';
require_once __DIR__ . '/../utils/Helpers.php';

class TransactionController {
    private $transactionModel;
    private $menuModel;
    
    public function __construct() {
        $this->transactionModel = new Transaction();
        $this->menuModel = new Menu();
    }
    
    public function create($request) {
        // Validate request data
        $user_id = $request['user_id'] ?? null;
        $items = $request['items'] ?? [];
        $payment_method = $request['payment_method'] ?? 'cash';
        
        if (!$user_id || empty($items)) {
            return Response::error('user_id and items are required', 400);
        }
        
        if (!in_array($payment_method, ['cash', 'card', 'qris'])) {
            return Response::error('Invalid payment method. Must be cash, card, or qris', 400);
        }
        
        // Verify that all menu items exist and are available
        foreach ($items as $item) {
            if (!isset($item['menu_id']) || !isset($item['quantity']) || !isset($item['unit_price'])) {
                return Response::error('Each item must have menu_id, quantity, and unit_price', 400);
            }
            
            $menu_item = $this->menuModel->findById($item['menu_id']);
            if (!$menu_item) {
                return Response::error('Menu item with ID ' . $item['menu_id'] . ' not found', 400);
            }
            
            if ($item['quantity'] <= 0 || $item['unit_price'] < 0) {
                return Response::error('Quantity must be positive and unit price must be non-negative', 400);
            }
        }
        
        // Calculate total amount
        $total_amount = 0;
        foreach ($items as $item) {
            $total_amount += $item['quantity'] * $item['unit_price'];
        }
        
        try {
            // Start transaction to ensure data consistency
            $db = $this->transactionModel->db;
            $db->beginTransaction();
            
            // Create the main transaction record
            $transaction_result = $this->transactionModel->create($user_id, $total_amount, $payment_method);
            
            if (!$transaction_result) {
                $db->rollback();
                return Response::serverError('Failed to create transaction');
            }
            
            $transaction_id = $transaction_result['id'];
            
            // Add each item to the transaction
            foreach ($items as $item) {
                $result = $this->transactionModel->addItem(
                    $transaction_id,
                    $item['menu_id'],
                    $item['quantity'],
                    $item['unit_price']
                );
                
                if (!$result) {
                    $db->rollback();
                    return Response::serverError('Failed to add item to transaction');
                }
            }
            
            // Commit the transaction
            $db->commit();
            
            // Return success response
            return Response::success([
                'transaction_id' => $transaction_id,
                'transaction_code' => $transaction_result['transaction_code'],
                'total_amount' => $total_amount,
                'created_at' => date('Y-m-d H:i:s')
            ], 201);
            
        } catch (Exception $e) {
            $db->rollback();
            return Response::serverError('Failed to create transaction: ' . $e->getMessage());
        }
    }
    
    public function getTransaction($id) {
        try {
            $transaction = $this->transactionModel->getTransaction($id);
            
            if (!$transaction) {
                return Response::notFound('Transaction not found');
            }
            
            // Get transaction items
            $items = $this->transactionModel->getTransactionItems($id);
            
            // Return transaction with items
            $result = [
                'transaction' => $transaction,
                'items' => $items
            ];
            
            return Response::success($result);
        } catch (Exception $e) {
            return Response::serverError('Failed to retrieve transaction');
        }
    }
    
    public function getAll() {
        try {
            $transactions = $this->transactionModel->getAllTransactions();
            return Response::success($transactions);
        } catch (Exception $e) {
            return Response::serverError('Failed to retrieve transactions');
        }
    }
}
?>