<?php
require_once __DIR__ . '/../dao/WishDao.php';
require_once __DIR__ . '/BaseService.php';

class WishService extends BaseService {
    public function __construct() {
        parent::__construct(new WishDao());
    }

    public function getAll() {
        $wishes = $this->dao->getAll();
        if (empty($wishes)) {
            throw new Exception('No wishes found.');
        }
        return $wishes;
    }

    public function getById($id) {
        if (empty($id)) {
            throw new Exception('Wish ID is required.');
        }
        $wish = $this->dao->getById($id);
        if (!$wish) {
            throw new Exception('Wish not found.');
        }
        return $wish;
    }

    public function insert($data) {
        if (empty($data['wishName'])) {
            throw new Exception('Wish name is required.');
        }
        if (strlen($data['wishName']) < 3) {
            throw new Exception('Wish name must be at least 3 characters long.');
        }
        if (empty($data['eventId'])) {
            throw new Exception('Event ID is required.');
        }

        $eventService = new EventService();
        $event = $eventService->getById($data['eventId']);
        if (!$event) {
            throw new Exception('Event not found.');
        }
        if ($event['isCanceled']) {
            throw new Exception('Cannot add a wish to a canceled event.');
        }

        $existingWishes = $this->dao->getWishesByEventId($data['eventId']);
        foreach ($existingWishes as $wish) {
            if ($wish['wishName'] === $data['wishName'] && $wish['userId'] === $data['userId']) {
                throw new Exception('You already have a wish with this name for the selected event.');
            }
        }

        return $this->dao->insert($data);
    }

    public function update($id, $data) {
        if (empty($id)) {
            throw new Exception('Wish ID is required for update.');
        }
        $wish = $this->dao->getById($id);
        if (!$wish) {
            throw new Exception('Wish not found.');
        }
        $eventService = new EventService();
        $event = $eventService->getById($wish['eventId']);
        if ($event['isCanceled']) {
            throw new Exception('Cannot update a wish associated with a canceled event.');
        }
        if (isset($data['wishName']) && strlen($data['wishName']) < 3) {
            throw new Exception('Wish name must be at least 3 characters long.');
        }
        return $this->dao->update($id, $data);
    }

    public function delete($id) {
        if (empty($id)) {
            throw new Exception('Wish ID is required for deletion.');
        }
        $wish = $this->dao->getById($id);
        if (!$wish) {
            throw new Exception('Wish not found.');
        }
        return $this->dao->delete($id);
    }

    public function getWishesByUserId($userId) {
        return $this->dao->getWishesByUserId($userId);
    }

    public function getWishesByGroupId($groupId) {
        return $this->dao->getWishesByGroupId($groupId);
    }

    public function getWishesByEventId($eventId) {
        return $this->dao->getWishesByEventId($eventId);
    }
}
?>

