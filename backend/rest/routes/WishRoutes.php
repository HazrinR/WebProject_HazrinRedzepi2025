<?php
require_once __DIR__ . '/../services/WishService.php';
require_once __DIR__ . '/../../data/Roles.php';

/**
 * @OA\Get(
 *     path="/wishes",
 *     tags={"Wishes"},
 *     summary="Get all wishes",
 *     security={
 *         {"APIKey": {}}
 *     },
 *     @OA\Response(
 *         response=200,
 *         description="List of wishes"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /wishes', function () {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    try {
        $wishService = new WishService();
        $wishes = $wishService->getAll();
        Flight::json($wishes);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Get(
 *     path="/wishes/{id}",
 *     tags={"Wishes"},
 *     summary="Get wish by ID",
 *     security={
 *         {"APIKey": {}}
 *     },
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the wish",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Wish details"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Wish not found"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /wishes/@id', function ($id) {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    try {
        $wishService = new WishService();
        $wish = $wishService->getById($id);
        if (!$wish) {
            Flight::json(['error' => 'Wish not found'], 404);
            return;
        }
        Flight::json($wish);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Post(
 *     path="/wishes",
 *     tags={"Wishes"},
 *     summary="Create a new wish",
 *     security={
 *         {"APIKey": {}}
 *     },
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"wishName", "userId", "groupId", "eventId"},
 *             @OA\Property(property="wishName", type="string", example="New Laptop"),
 *             @OA\Property(property="description", type="string", example="A high-performance laptop for work."),
 *             @OA\Property(property="userId", type="integer", example=55),
 *             @OA\Property(property="groupId", type="integer", example=41),
 *             @OA\Property(property="eventId", type="integer", example=35)
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Wish created"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request"
 *     )
 * )
 */
Flight::route('POST /wishes', function () {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    try {
        $data = Flight::request()->data->getData();
        $data['userId'] = Flight::get('user')->id; 
        $wishService = new WishService();
        $wishId = $wishService->insert($data);
        Flight::json(['message' => 'Wish created', 'wish_id' => $wishId]);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/wishes/{id}",
 *     tags={"Wishes"},
 *     summary="Update a wish",
 *     security={
 *         {"APIKey": {}}
 *     },
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the wish",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"wishName"},
 *             @OA\Property(property="wishName", type="string", example="Updated Laptop"),
 *             @OA\Property(property="description", type="string", example="An updated high-performance laptop for work.")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Wish updated"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Wish not found"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request"
 *     )
 * )
 */
Flight::route('PUT /wishes/@id', function ($id) {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    try {
        $data = Flight::request()->data->getData();
        $wishService = new WishService();
        $wish = $wishService->getById($id);
        if (!$wish) {
            Flight::json(['error' => 'Wish not found'], 404);
            return;
        }
        $wishService->update($id, $data);
        Flight::json(['message' => 'Wish updated']);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/wishes/{id}",
 *     tags={"Wishes"},
 *     summary="Delete a wish",
 *     security={
 *         {"APIKey": {}}
 *     },
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the wish",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Wish deleted"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Wish not found"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request"
 *     )
 * )
 */
Flight::route('DELETE /wishes/@id', function ($id) {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    try {
        $wishService = new WishService();
        $wishService->delete($id);
        Flight::json(['message' => 'Wish deleted']);
    } catch (Exception $e) {
        if ($e->getMessage() === 'Wish not found.') {
            Flight::json(['error' => $e->getMessage()], 404);
        } else {
            Flight::json(['error' => $e->getMessage()], 400);
        }
    }
});

/**
 * @OA\Get(
 *     path="/wishes/user/{userId}",
 *     tags={"Wishes"},
 *     summary="Get wishes by user ID",
 *     security={
 *         {"APIKey": {}}
 *     },
 *     @OA\Parameter(
 *         name="userId",
 *         in="path",
 *         required=true,
 *         description="ID of the user",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of wishes"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /wishes/user/@userId', function ($userId) {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    try {
        $wishService = new WishService();
        $wishes = $wishService->getWishesByUserId($userId);
        Flight::json($wishes);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Get(
 *     path="/wishes/group/{groupId}",
 *     tags={"Wishes"},
 *     summary="Get wishes by group ID",
 *     security={
 *         {"APIKey": {}}
 *     },
 *     @OA\Parameter(
 *         name="groupId",
 *         in="path",
 *         required=true,
 *         description="ID of the group",
 *         @OA\Schema(type="integer", example=2)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of wishes"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /wishes/group/@groupId', function ($groupId) {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    try {
        $wishService = new WishService();
        $wishes = $wishService->getWishesByGroupId($groupId);
        Flight::json($wishes);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Get(
 *     path="/wishes/event/{eventId}",
 *     tags={"Wishes"},
 *     summary="Get wishes by event ID",
 *     security={
 *         {"APIKey": {}}
 *     },
 *     @OA\Parameter(
 *         name="eventId",
 *         in="path",
 *         required=true,
 *         description="ID of the event",
 *         @OA\Schema(type="integer", example=3)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of wishes"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /wishes/event/@eventId', function ($eventId) {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    try {
        $wishService = new WishService();
        $wishes = $wishService->getWishesByEventId($eventId);
        Flight::json($wishes);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});
?>
