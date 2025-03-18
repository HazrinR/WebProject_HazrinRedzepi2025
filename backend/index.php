<?php
require 'vendor/autoload.php'; //ukljucuje flightphp autoload.php

Flight::route('/', function(){     //postavlja rutu / koja vraca poruku
    echo "welcome to Wishlist app";
});


Flight::start();   //pokrece app