<?php
require_once 'BaseDao.php';

class EventDao extends BaseDao {
    public function __construct() {
        parent::__construct("events");
    }

    // get all events for a specific group
    public function getEventsByGroup($groupId) {
        $stmt = $this->connection->prepare("SELECT * FROM events WHERE groupId = :groupId");
        $stmt->bindParam(':groupId', $groupId);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>
