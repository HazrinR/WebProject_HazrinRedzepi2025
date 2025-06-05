<?php
/**
 *     @OA\Info(
 *         title="Wishlist Project API",
 *         description="API documentation for the Wishlist Project. This API allows users to manage users, groups, events, and wishes.",
 *         version="1.0",
 *         @OA\Contact(
 *             email="hazrin.redzepi@stu.ibu.edu.ba",
 *             name="Hazrin Redzepi"
 *         )
 *     )

 */
/**
 * @OA\Server(
 *     url="https://monkfish-app-oksmf.ondigitalocean.app",
 *     description="Production server for the Wishlist Project API"
 * )
 * @OA\Server(
 *     url="http://localhost/wishlist-project/backend",
 *     description="Local development server for the Wishlist Project API"
 * )
 */
/**
 * @OA\SecurityScheme(
 *     securityScheme="ApiKey",
 *     type="apiKey",
 *     in="header",
 *     name="Authentication"
 * )
 */
