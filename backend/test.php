<?php
require_once 'rest/dao/UserDao.php';
require_once 'rest/dao/EventDao.php';
require_once 'rest/dao/WishDao.php';
require_once 'rest/dao/GroupDao.php';

// Initialize DAO objects
$userDao = new UserDao();
$eventDao = new EventDao();
$wishDao = new WishDao();
$groupDao = new GroupDao();

echo "=== INSERTING DATA ===\n";

// 1. Insert a user
$userDao->insert([
    'firstName' => 'Selima',
    'lastName' => 'Smith',
    'email' => 'selima@example.com',
    'password' => password_hash('securepassword', PASSWORD_DEFAULT),
    'age' => 28
]);
echo "User inserted!\n";

// Fetch the last inserted user ID
$user = $userDao->getAll();
$userId = end($user)['id']; // Fetch the last user's ID
echo "Fetched User ID: $userId\n";

// 2. Insert a group with a valid `createdBy`
$groupDao->insert([
    'name' => 'Travel Enthusiasts',
    'description' => 'Group for planning travel adventures.',
    'createdBy' => $userId
]);
echo "Group inserted!\n";

// Fetch the last inserted group ID
$group = $groupDao->getAll();
$groupId = end($group)['id']; // Fetch the last group's ID
echo "Fetched Group ID: $groupId\n";

// 3. Insert an event with a valid `groupId`
$eventDao->insert([
    'groupId' => $groupId,
    'eventName' => 'Summer Road Trip',
    'eventDate' => '2025-07-15',
    'description' => 'A road trip across the country.',
    'budget' => 5000.00,
    'isCanceled' => 0
]);
echo "Event inserted!\n";

// Fetch the last inserted event ID
$event = $eventDao->getAll();
$eventId = end($event)['id']; // Fetch the last event's ID
echo "Fetched Event ID: $eventId\n";

// 4. Insert a wish with valid `userId`, `groupId`, and `eventId`
$wishId = $wishDao->insert([
    'userId' => $userId,
    'groupId' => $groupId,
    'eventId' => $eventId,
    'wishName' => 'Camera',
    'description' => 'A high-quality camera for capturing memories.'
]);
echo "Wish inserted with ID: $wishId\n";

// 5. Fetch and display all data
echo "\n=== FETCHING DATA ===\n";
echo "Users:\n";
print_r($userDao->getAll());
echo "Groups:\n";
print_r($groupDao->getAll());
echo "Events:\n";
print_r($eventDao->getAll());
echo "Wishes:\n";
print_r($wishDao->getAll());

echo "\n=== DELETING DATA ===\n";

// 6. Delete the wish
// $wishDao->delete($wishId);
// echo "Wish deleted!\n";

// 7. Delete the event
// $eventDao->delete($eventId);
// echo "Event deleted!\n";

// 8. Delete the group
// $groupDao->delete($groupId);
// echo "Group deleted!\n";

// 9. Delete the user
// $userDao->delete($userId);
// echo "User deleted!\n";

// 10. Final fetch to confirm deletion
echo "\n=== FINAL DATA AFTER DELETE ===\n";
echo "Users:\n";
print_r($userDao->getAll());
echo "Groups:\n";
print_r($groupDao->getAll());
echo "Events:\n";
print_r($eventDao->getAll());
echo "Wishes:\n";
print_r($wishDao->getAll());

echo "\n=== TESTS COMPLETED ===\n";
?>
