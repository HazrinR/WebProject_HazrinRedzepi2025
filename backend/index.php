<?php
require 'vendor/autoload.php'; // Includes FlightPHP autoload
require_once __DIR__ . "/./rest/services/AuthService.php";
require_once __DIR__ . "/./rest/services/EventService.php";
require_once __DIR__ . "/./rest/services/GroupService.php";
require_once __DIR__ . "/./rest/services/UserService.php";
require_once __DIR__ . "/./rest/services/WishService.php";
require_once __DIR__ . "/middleware/AuthMiddleware.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Register services
Flight::register('auth_service', 'AuthService');
Flight::register('event_service', 'EventService');
Flight::register('group_service', 'GroupService');
Flight::register('user_service', 'UserService');
Flight::register('wish_service', 'WishService');
Flight::register('auth_middleware', "AuthMiddleware");

// Add debug endpoint directly in index.php
Flight::route('GET /debug-headers', function() {
    $allHeaders = getallheaders();
    $authHeader = isset($allHeaders['Authorization']) ? $allHeaders['Authorization'] : null;
    $serverAuth = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : null;
    
    Flight::json([
        'headers' => $allHeaders,
        'auth_header' => $authHeader,
        'server_auth' => $serverAuth,
        'all_server' => $_SERVER
    ]);
});

// Middleware for route protection- citav ovaj kod komentirati da bi radilo u swaggeru
Flight::route('/*', function () {
   if(
       strpos(Flight::request()->url, '/auth/login') === 0 ||
       strpos(Flight::request()->url, '/auth/register') === 0 ||
       strpos(Flight::request()->url, '/debug-headers') === 0
   ) {
       return TRUE;
   } else {
       try {
           // Try multiple methods to get the Authorization header
           $token = Flight::request()->getHeader("Authorization");
           // If not found, try from $_SERVER
           if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
               $token = $_SERVER['HTTP_AUTHORIZATION'];
           }
           // If still not found, try getallheaders()
           if (!$token && function_exists('getallheaders')) {
               $headers = getallheaders();
               if (isset($headers['Authorization'])) {
                   $token = $headers['Authorization'];
               }
           }
           if(Flight::auth_middleware()->verifyToken($token))
               return TRUE;
       } catch (\Exception $e) {
           Flight::halt(401, $e->getMessage());
       }
   }
});

// Include routes
require_once __DIR__ . "/./rest/routes/AuthRoutes.php";
require_once __DIR__ . "/./rest/routes/EventRoutes.php";
require_once __DIR__ . "/./rest/routes/GroupRoutes.php";
require_once __DIR__ . "/./rest/routes/UserRoutes.php";
require_once __DIR__ . "/./rest/routes/WishRoutes.php";

// Start the application
Flight::start();