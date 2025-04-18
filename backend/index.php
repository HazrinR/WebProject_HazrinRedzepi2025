<?php
require 'vendor/autoload.php'; //ukljucuje flightphp autoload.php
require_once __DIR__ . "/./rest/routes/EventRoutes.php";
require_once __DIR__ . "/./rest/routes/GroupRoutes.php";
require_once __DIR__ . "/./rest/routes/UserRoutes.php";
require_once __DIR__ . "/./rest/routes/WishRoutes.php";


Flight::route('/', function(){   
    echo "welcome to Wishlist app";
});


Flight::start();   //pokrece app