<?php
require_once 'rest/services/UserService.php';
require_once 'rest/services/GroupService.php';
require_once 'rest/services/EventService.php';
require_once 'rest/services/WishService.php';

// Initialize service objects
$userService = new UserService();
$groupService = new GroupService();
$eventService = new EventService();
$wishService = new WishService();

echo "=== TESTING USER SERVICE ===\n";

// Create a new user
$newUser = [
    'firstName' => 'John',
    'lastName' => 'Doe',
    'email' => 'john.doe@example.com',
    'password' => password_hash('password123', PASSWORD_DEFAULT),
    'age' => 30
];
$userService->insert($newUser);
echo "User created successfully!\n";

// Fetch all users
$users = $userService->getAll();
print_r($users);

// Fetch a user by ID
$userId = end($users)['id'];
$user = $userService->getById($userId);
print_r($user);

// Update the user
$updatedUser = [
    'firstName' => 'Johnathan',
    'lastName' => 'Doe',
    'email' => 'johnathan.doe@example.com',
    'age' => 31
];
$userService->update($userId, $updatedUser);
echo "User updated successfully!\n";
print_r($userService->getById($userId));

echo "\n=== TESTING GROUP SERVICE ===\n";

// Create a new group
$newGroup = [
    'name' => 'Hiking Club',
    'description' => 'A group for hiking enthusiasts.',
    'createdBy' => $userId
];
$groupService->insert($newGroup);
echo "Group created successfully!\n";

// Fetch all groups
$groups = $groupService->getAll();
print_r($groups);

// Fetch a group by ID
$groupId = end($groups)['id'];
$group = $groupService->getById($groupId);
print_r($group);

// Update the group
$updatedGroup = [
    'name' => 'Advanced Hiking Club',
    'description' => 'A group for advanced hiking enthusiasts.'
];
$groupService->update($groupId, $updatedGroup);
echo "Group updated successfully!\n";
print_r($groupService->getById($groupId));

echo "\n=== TESTING EVENT SERVICE ===\n";

// Create a new event
$newEvent = [
    'groupId' => $groupId,
    'eventName' => 'Mountain Hike',
    'eventDate' => '2025-08-01',
    'description' => 'A hike to the top of the mountain.',
    'budget' => 1000.00,
    'isCanceled' => 0
];
$eventService->insert($newEvent);
echo "Event created successfully!\n";

// Fetch all events
$events = $eventService->getAll();
print_r($events);

// Fetch an event by ID
$eventId = end($events)['id'];
$event = $eventService->getById($eventId);
print_r($event);

// Update the event
$updatedEvent = [
    'eventName' => 'Mountain Adventure',
    'eventDate' => '2025-09-01',
    'description' => 'An adventurous hike to the mountain.',
    'budget' => 1500.00,
    'isCanceled' => 1
];
$eventService->update($eventId, $updatedEvent);
echo "Event updated successfully!\n";
print_r($eventService->getById($eventId));

echo "\n=== TESTING WISH SERVICE ===\n";

// Create a new wish
$newWish = [
    'userId' => $userId,
    'groupId' => $groupId,
    'eventId' => $eventId,
    'wishName' => 'Hiking Boots',
    'description' => 'A pair of durable hiking boots.'
];
$wishService->insert($newWish);
echo "Wish created successfully!\n";

// Fetch all wishes
$wishes = $wishService->getAll();
print_r($wishes);

// Fetch a wish by ID
$wishId = end($wishes)['id'];
$wish = $wishService->getById($wishId);
print_r($wish);

// Update the wish
$updatedWish = [
    'wishName' => 'Hiking Backpack',
    'description' => 'A durable backpack for hiking.'
];
$wishService->update($wishId, $updatedWish);
echo "Wish updated successfully!\n";
print_r($wishService->getById($wishId));

echo "\n=== CLEANUP ===\n";

// Delete the wish
$wishService->delete($wishId);
echo "Wish deleted successfully!\n";

// Delete the event
$eventService->delete($eventId);
echo "Event deleted successfully!\n";

// Delete the group
$groupService->delete($groupId);
echo "Group deleted successfully!\n";

// Delete the user
$userService->delete($userId);
echo "User deleted successfully!\n";

echo "\n=== TESTS COMPLETED ===\n";
?>
