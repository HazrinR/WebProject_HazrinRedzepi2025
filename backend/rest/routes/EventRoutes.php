<?php
require_once __DIR__ . '/../services/EventService.php';

/**
 * @OA\Get(
 *     path="/events",
 *     tags={"Events"},
 *     summary="Get all events",
 *     @OA\Response(
 *         response=200,
 *         description="List of events"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
 *         )
 *     )
 * )
 */
Flight::route('GET /events', function () {
    try {
        $eventService = new EventService();
        $events = $eventService->getAll();
        Flight::json($events);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Get(
 *     path="/events/{id}",
 *     tags={"Events"},
 *     summary="Get event by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Event details"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
 *         )
 *     )
 * )
 */
Flight::route('GET /events/@id', function ($id) {
    try {
        $eventService = new EventService();
        $event = $eventService->getById($id);
        Flight::json($event);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

/**
 * @OA\Post(
 *     path="/events",
 *     tags={"Events"},
 *     summary="Create a new event",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"eventName", "eventDate", "groupId", "isCanceled"},
 *             @OA\Property(property="eventName", type="string", example="Birthday Party"),
 *             @OA\Property(property="eventDate", type="string", format="date", example="2025-07-15"),
 *             @OA\Property(property="description", type="string", example="A fun birthday party."),
 *             @OA\Property(property="budget", type="number", format="float", example=500.00),
 *             @OA\Property(property="groupId", type="integer", description="ID of the group associated with the event", example=1),
 *             @OA\Property(property="isCanceled", type="boolean", description="Indicates if the event is canceled", example=false)
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Event created"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="Invalid request")
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
 *         )
 *     )
 * )
 */
Flight::route('POST /events', function () {
    try {
        $data = Flight::request()->data->getData();

        // Validate groupId
        if (empty($data['groupId'])) {
            throw new Exception('Group ID is required.');
        }

        $eventService = new EventService();
        $eventId = $eventService->insert($data);
        Flight::json(['message' => 'Event created', 'event_id' => $eventId]);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/events/{id}",
 *     tags={"Events"},
 *     summary="Update an event",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"eventName", "eventDate", "isCanceled"},
 *             @OA\Property(property="eventName", type="string", example="Updated Birthday Party"),
 *             @OA\Property(property="eventDate", type="string", format="date", example="2025-07-20"),
 *             @OA\Property(property="description", type="string", example="An updated description for the birthday party."),
 *             @OA\Property(property="budget", type="number", format="float", example=600.00),
 *             @OA\Property(property="isCanceled", type="boolean", description="Indicates if the event is canceled", example=true)
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Event updated"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="Invalid request")
 *         )
 *     )
 * )
 */
Flight::route('PUT /events/@id', function ($id) {
    try {
        $data = Flight::request()->data->getData();
        $eventService = new EventService();
        $eventService->update($id, $data);
        Flight::json(['message' => 'Event updated']);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/events/{id}",
 *     tags={"Events"},
 *     summary="Delete an event",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the event",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Event deleted",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Event deleted")
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Event not found",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="Event not found")
 *         )
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="Invalid request")
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
 *         )
 *     )
 * )
 */
Flight::route('DELETE /events/@id', function ($id) {
    try {
        $eventService = new EventService();
        $eventService->delete($id);
        Flight::json(['message' => 'Event deleted']);
    } catch (Exception $e) {
        if ($e->getMessage() === 'Event not found.') {
            Flight::json(['error' => $e->getMessage()], 404);
        } else {
            Flight::json(['error' => $e->getMessage()], 400);
        }
    }
});

/**
 * @OA\Get(
 *     path="/events/group/{groupId}",
 *     tags={"Events"},
 *     summary="Get events by group ID",
 *     @OA\Parameter(
 *         name="groupId",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of events"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Internal server error",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
 *         )
 *     )
 * )
 */
Flight::route('GET /events/group/@groupId', function ($groupId) {
    try {
        $eventService = new EventService();
        $events = $eventService->getEventsByGroup($groupId);
        Flight::json($events);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

?>
