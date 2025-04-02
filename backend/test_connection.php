<?php
require_once 'config.php'; 

try {
    $db = Database::connect();
    echo "Konekcija uspješna!";
} catch (Exception $e) {
    echo "Greška: " . $e->getMessage();   //konekcija uspjesna!
}
?>