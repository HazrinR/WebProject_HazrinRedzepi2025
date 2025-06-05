<?php
require_once 'BaseDao.php';

class GroupDao extends BaseDao {
    public function __construct() {
        parent::__construct("groups");
    }

    // get all groups created by a specific user
    public function getGroupsByCreator($createdBy) {
        $stmt = $this->connection->prepare("SELECT * FROM `groups` WHERE createdBy = :createdBy");
        $stmt->bindParam(':createdBy', $createdBy);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // search groups by name
    public function searchGroupsByName($name) {
        $stmt = $this->connection->prepare("SELECT * FROM `groups` WHERE name LIKE :name");
        $name = "%" . $name . "%";
        $stmt->bindParam(':name', $name);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>
