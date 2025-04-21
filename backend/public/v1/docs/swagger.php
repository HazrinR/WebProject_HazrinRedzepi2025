<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require __DIR__ . '/../../../vendor/autoload.php';
header('Content-Type: application/json');

if($_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == '127.0.0.1'){
   define('BASE_URL', 'http://localhost/wishlist-project/backend');
} else {
   define('BASE_URL', 'https://add-production-server-after-deployment/backend/');
}
$openapi = \OpenApi\Generator::scan([
   __DIR__ . '/doc_setup.php',
   __DIR__ . '/../../../rest/routes'
]);

echo $openapi->toJson();
?>
