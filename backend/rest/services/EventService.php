<?php
require_once __DIR__ . '/../dao/EventDao.php'; 
require_once __DIR__ . '/BaseService.php';


class EventService extends BaseService {
    public function __construct() {
        parent::__construct(new EventDao());
    }

    public function getAll() {
        $events = $this->dao->getAll();
        if (empty($events)) {
            return [];
        }
        return $events;
    }

    public function getById($id) {
        if (empty($id)) {
            throw new Exception('Event ID is required.');
        }
        $event = $this->dao->getById($id);
        if (!$event) {
            throw new Exception('Event not found.');
        }
        return $event;
    }

    public function insert($data) {
        if (empty($data['eventName'])) {
            throw new Exception('Event name is required.');
        }
        if (strlen($data['eventName']) < 3) {
            throw new Exception('Event name must be at least 3 characters long.');
        }
        if (empty($data['eventDate'])) {
            throw new Exception('Event date is required.');
        }
        if (strtotime($data['eventDate']) < strtotime(date('Y-m-d'))) {
            throw new Exception('Event date cannot be in the past.');
        }
        if (isset($data['budget']) && $data['budget'] <= 0) {
            throw new Exception('Budget must be greater than 0.');
        }

        $existingEvents = $this->dao->getEventsByGroup($data['groupId']);
        foreach ($existingEvents as $event) {
            if ($event['eventName'] === $data['eventName']) {
                throw new Exception('An event with this name already exists in the selected group.');
            }
        }

        return $this->dao->insert($data);
    }

    public function update($id, $data) {
        if (empty($id)) {
            throw new Exception('Event ID is required for update.');
        }
        $event = $this->dao->getById($id);
        if (!$event) {
            throw new Exception('Event not found.');
        }
        if ($event['isCanceled']) {
            throw new Exception('Cannot update a canceled event.');
        }
        if (isset($data['eventName']) && strlen($data['eventName']) < 3) {
            throw new Exception('Event name must be at least 3 characters long.');
        }
        if (isset($data['eventDate']) && strtotime($data['eventDate']) < strtotime(date('Y-m-d'))) {
            throw new Exception('Event date cannot be in the past.');
        }
        if (isset($data['budget']) && $data['budget'] <= 0) {
            throw new Exception('Budget must be greater than 0.');
        }
        return $this->dao->update($id, $data);
    }

    public function delete($id) {
        if (empty($id)) {
            throw new Exception('Event ID is required for deletion.');
        }
        $event = $this->dao->getById($id);
        if (!$event) {
            throw new Exception('Event not found.');
        }
        return $this->dao->delete($id);
    }

    public function getEventsByGroup($groupId) {
        if (empty($groupId)) {
            throw new Exception('Group ID is required.');
        }

        $events = $this->dao->getEventsByGroup($groupId);

        if (empty($events)) {
            throw new Exception('No events found for the specified group.');
        }

        return $events;
    }
}
?>

