<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/GroupDao.php';

class GroupService extends BaseService {
    public function __construct() {
        parent::__construct(new GroupDao());
    }

    public function getAll() {
        $groups = $this->dao->getAll();
        if (empty($groups)) {
            throw new Exception('No groups found.');
        }
        return $groups;
    }

    public function getById($id) {
        if (empty($id)) {
            throw new Exception('Group ID is required.');
        }
        $group = $this->dao->getById($id);
        if (!$group) {
            throw new Exception('Group not found.');
        }
        return $group;
    }

    public function insert($data) {
        if (empty($data['name'])) {
            throw new Exception('Group name is required.');
        }
        if (strlen($data['name']) < 3) {
            throw new Exception('Group name must be at least 3 characters long.');
        }
        $existingGroup = $this->dao->searchGroupsByName($data['name']);
        foreach ($existingGroup as $group) {
            if ($group['createdBy'] === $_SESSION['id']) {
                throw new Exception('You already have a group with this name.');
            }
        }
        return $this->dao->insert($data);
    }

    public function update($id, $data) {
        if (empty($id)) {
            throw new Exception('Group ID is required for update.');
        }
        $group = $this->dao->getById($id);
        if (!$group) {
            throw new Exception('Group not found.');
        }
   
        $user = Flight::get('user');
        if (!$user || !isset($user->id) || ($user->role !== Roles::ADMIN && $group['createdBy'] != $user->id)) {
            throw new Exception('Only the creator of the group or admin can update it.');
        }
        if (isset($data['name']) && strlen($data['name']) < 3) {
            throw new Exception('Group name must be at least 3 characters long.');
        }
        return $this->dao->update($id, $data);
    }

    public function delete($id) {
        if (empty($id)) {
            throw new Exception('Group ID is required for deletion.');
        }
        $group = $this->dao->getById($id);
        if (!$group) {
            throw new Exception('Group not found.');
        }
        return $this->dao->delete($id);
    }

    public function getGroupsByCreator($createdBy) {
        return $this->dao->getGroupsByCreator($createdBy);
    }

    public function searchGroupsByName($name) {
        return $this->dao->searchGroupsByName($name);
    }
}
?>
