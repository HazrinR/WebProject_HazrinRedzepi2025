<?php
require_once 'BaseDao.php';

class WishDao extends BaseDao {
    public function __construct() {
        parent::__construct("wish");
    }

    // get all wishes for a specific user
    public function getWishesByUserId($userId) {
        $stmt = $this->connection->prepare("SELECT * FROM wish WHERE userId = :userId");
        $stmt->bindParam(':userId', $userId);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // get all wishes for a specific group
    public function getWishesByGroupId($groupId) {
        $stmt = $this->connection->prepare("SELECT * FROM wish WHERE groupId = :groupId");
        $stmt->bindParam(':groupId', $groupId);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // get all wishes for a specific event
    public function getWishesByEventId($eventId) {
        $stmt = $this->connection->prepare("SELECT * FROM wish WHERE eventId = :eventId");
        $stmt->bindParam(':eventId', $eventId);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>
