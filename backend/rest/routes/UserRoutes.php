<?php
require_once __DIR__ . '/../services/UserService.php';

/**
 * @OA\Get(
 *     path="/users",
 *     tags={"Users"},
 *     summary="Get all users",
 *     @OA\Response(
 *         response=200,
 *         description="List of users"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * 
 * )
 */
Flight::route('GET /users', function () {
    try {
        $userService = new UserService();
        $users = $userService->getAll();
        Flight::json($users);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Get(
 *     path="/users/{id}",
 *     tags={"Users"},
 *     summary="Get user by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the user",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User details"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /users/@id', function ($id) {
    try {
        $userService = new UserService();
        $user = $userService->getById($id);
        Flight::json($user);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Get(
 *     path="/users/email/{email}",
 *     summary="Get a user by email",
 *     tags={"Users"},
 *     @OA\Parameter(
 *         name="email",
 *         in="path",
 *         required=true,
 *         description="Email of the user",
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User details"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */

Flight::route('GET /users/email/@email', function ($email) {
    try {
        $userService = new UserService();
        $user = $userService->getUserByEmail($email);
        Flight::json($user);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Post(
 *     path="/users",
 *     tags={"Users"},
 *     summary="Create a new user",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"firstName", "lastName", "age", "email", "password"},
 *             @OA\Property(property="firstName", type="string", example="Ilma"),
 *             @OA\Property(property="lastName", type="string", example="Hadzic"),
 *             @OA\Property(property="age", type="integer", example=25),
 *             @OA\Property(property="email", type="string", example="ilma@example.com"),
 *             @OA\Property(property="password", type="string", example="ilma123")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User created successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request"
 *     )
 * )
 */
Flight::route('POST /users', function () {
    try {
        $data = Flight::request()->data->getData();
        $userService = new UserService();
        $userId = $userService->insert($data);
        Flight::json(['message' => 'User created successfully', 'user_id' => $userId]);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/users/{id}",
 *     tags={"Users"},
 *     summary="Update an existing user",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the user",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *              required={"firstName", "lastName", "age", "email", "password"},
 *             @OA\Property(property="firstName", type="string", example="Ajla"),
 *             @OA\Property(property="lastName", type="string", example="Lekic"),
 *             @OA\Property(property="age", type="integer", example=22),
 *             @OA\Property(property="email", type="string", example="ajlica@example.com"),
 *             @OA\Property(property="password", type="string", example="ajla444")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User updated successfully"
 *     ),
 *      @OA\Response(
 *          response=400,
 *         description="Bad request"
 * )
 * )
 */
Flight::route('PUT /users/@id', function ($id) {
    try {
        $data = Flight::request()->data->getData();
        $userService = new UserService();
        $userService->update($id, $data);
        Flight::json(['message' => 'User updated successfully']);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/users/{id}",
 *     tags={"Users"},
 *     summary="Delete a user by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the user",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User deleted",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="User deleted")
 *         )
 *     ),
 *    
 *     @OA\Response(
 *         response=404,
 *         description="User not found",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="User not found")
 *         )
 *     ),
 *  @OA\Response(
 *         response=400,
 *         description="Bad request",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="error", type="string", example="Some error message")
 *         )
 *     )
 * )
 */
Flight::route('DELETE /users/@id', function ($id) {
    try {
        $userService = new UserService();
        $userService->delete($id);
        Flight::json(['message' => 'User deleted']);
    } catch (Exception $e) {
        if ($e->getMessage() === 'User not found.') {
            Flight::json(['error' => $e->getMessage()], 404);
        } else {
            Flight::json(['error' => $e->getMessage()], 400);
        }
    }
});


/**
 * @OA\Post(
 *     path="/users/authenticate",
 *     tags={"Users"},
 *     summary="Authenticate a user",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"email", "password"},
 *             @OA\Property(property="email", type="string", example="ajlica@example.com"),
 *             @OA\Property(property="password", type="string", example="ajla444")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Authentication successful",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Authentication successful"),
 *             @OA\Property(property="user", type="object", example={"id": 1, "firstName": "John", "lastName": "Doe", "email": "test@example.com"})
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Invalid email or password",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="Invalid email or password")
 *         )
 *     )
 * )
 */
Flight::route('POST /users/authenticate', function () {
    try {
        $data = Flight::request()->data->getData();
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            throw new Exception('Email and password are required.');
        }

        $userService = new UserService();
        $user = $userService->authenticateUser($email, $password);

        if ($user) {
            Flight::json(['message' => 'Authentication successful', 'user' => $user]);
        } else {
            Flight::json(['error' => 'Invalid email or password'], 401);
        }
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Get(
 *     path="/users/email-exists/{email}",
 *     tags={"Users"},
 *     summary="Check if an email exists",
 *     @OA\Parameter(
 *         name="email",
 *         in="path",
 *         required=true,
 *         description="Email address to check",
 *         @OA\Schema(type="string", example="test@example.com")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Email existence status",
 *         @OA\JsonContent(
 *             @OA\Property(property="emailExists", type="boolean", example=true)
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /users/email-exists/@email', function ($email) {
    try {
        $userService = new UserService();
        $exists = $userService->emailExists($email);
        Flight::json(['emailExists' => $exists]);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});
?>