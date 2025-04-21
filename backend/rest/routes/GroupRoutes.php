<?php
require_once __DIR__ . '/../services/GroupService.php';

/**
 * @OA\Get(
 *     path="/groups",
 *     tags={"Groups"},
 *     summary="Get all groups",
 *     @OA\Response(
 *         response=200,
 *         description="List of groups"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /groups', function () {
    try {
        $groupService = new GroupService();
        $groups = $groupService->getAll();
        Flight::json($groups);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Get(
 *     path="/groups/{id}",
 *     tags={"Groups"},
 *     summary="Get group by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the group",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Group details"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /groups/@id', function ($id) {
    try {
        $groupService = new GroupService();
        $group = $groupService->getById($id);
        Flight::json($group);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Post(
 *     path="/groups",
 *     tags={"Groups"},
 *     summary="Create a new group",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"name", "createdBy"},
 *             @OA\Property(property="name", type="string", example="Travel Enthusiasts"),
 *             @OA\Property(property="description", type="string", example="Group for travel lovers."),
 *             @OA\Property(property="createdBy", type="integer", description="ID of the user creating the group", example=55)
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Group created"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request"
 *     )
 * )
 */
Flight::route('POST /groups', function () {
    try {
        $data = Flight::request()->data->getData();
        $groupService = new GroupService();
        $groupId = $groupService->insert($data);
        Flight::json(['message' => 'Group created', 'group_id' => $groupId]);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/groups/{id}",
 *     tags={"Groups"},
 *     summary="Update an existing group",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the group",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="name", type="string", example="Updated Group Name"),
 *             @OA\Property(property="description", type="string", example="Updated group description")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Group updated"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Group not found",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="Group not found")
 *         )
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request"
 *     )
 * )
 */
Flight::route('PUT /groups/@id', function ($id) {
    try {
        $data = Flight::request()->data->getData();
        $groupService = new GroupService();
        $existingGroup = $groupService->getById($id);
        if (!$existingGroup) {
            Flight::json(['error' => 'Group not found'], 404);
            return;
        }

        $groupService->update($id, $data);
        Flight::json(['message' => 'Group updated']);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/groups/{id}",
 *     tags={"Groups"},
 *     summary="Delete a group by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the group",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Group deleted",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Group deleted")
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Group not found",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="Group not found")
 *         )
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request"
 *     )
 * )
 */
Flight::route('DELETE /groups/@id', function ($id) {
    try {
        $groupService = new GroupService();
        $groupService->delete($id);
        Flight::json(['message' => 'Group deleted']);
    } catch (Exception $e) {
        if ($e->getMessage() === 'Group not found.') {
            Flight::json(['error' => $e->getMessage()], 404);
        } else {
            Flight::json(['error' => $e->getMessage()], 400);
        }
    }
});

/**
 * @OA\Get(
 *     path="/groups/creator/{createdBy}",
 *     tags={"Groups"},
 *     summary="Get groups by creator",
 *     @OA\Parameter(
 *         name="createdBy",
 *         in="path",
 *         required=true,
 *         description="ID of the user who created the groups",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of groups created by the user"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /groups/creator/@createdBy', function ($createdBy) {
    try {
        $groupService = new GroupService();
        $groups = $groupService->getGroupsByCreator($createdBy);
        Flight::json($groups);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Get(
 *     path="/groups/search/{name}",
 *     tags={"Groups"},
 *     summary="Search groups by name",
 *     @OA\Parameter(
 *         name="name",
 *         in="path",
 *         required=true,
 *         description="Name or partial name of the group to search for",
 *         @OA\Schema(type="string", example="Travel")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of groups matching the search criteria"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error"
 *     )
 * )
 */
Flight::route('GET /groups/search/@name', function ($name) {
    try {
        $groupService = new GroupService();
        $groups = $groupService->searchGroupsByName($name);
        Flight::json($groups);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});
?>
