<?php
/**
 * Modern Wedding CMS - Database Configuration
 * Uses PHP Data Objects (PDO) for safe prepared queries & transaction control.
 */

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'kheruvimovy_wedding');
define('DB_USER', 'root');
define('DB_PASS', ''); // Set your database password here

function getDatabaseConnection(): PDO {
    static $connection = null;
    
    if ($connection === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        
        try {
            $connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // In production, log error instead of displaying raw connection keys
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed. Please verify credentials in config.php',
                'details' => $e->getMessage()
            ]);
            exit;
        }
    }
    
    return $connection;
}
