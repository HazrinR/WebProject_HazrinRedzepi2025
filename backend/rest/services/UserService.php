<?php
require_once __DIR__ . '/../dao/UserDao.php'; 
require_once __DIR__ . '/BaseService.php';

class UserService extends BaseService {
    public function __construct() {
        parent::__construct(new UserDao());
    }

    public function getAll() {
        $users = $this->dao->getAll();
        if (empty($users)) {
            throw new Exception('No users found.');
        }
        return $users;
    }

    public function getById($id) {
        if (empty($id)) {
            throw new Exception('User ID is required.');
        }
        $user = $this->dao->getById($id);
        if (!$user) {
            throw new Exception('User not found.');
        }
        return $user;
    }

    public function insert($data) {
        if (empty($data['firstName']) || empty($data['lastName']) || empty($data['age']) || empty($data['email']) || empty($data['password'])) {
            throw new Exception('First name, last name, age, email, and password are required.');
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }
        if ($this->emailExists($data['email'])) {
            throw new Exception('Email is already in use.');
        }
        if ($data['age'] < 18 || $data['age'] > 100) {
            throw new Exception('User age must be between 18 and 100.');
        }
        if (strlen($data['password']) < 6 || strlen($data['password']) > 50) {
            throw new Exception('Password must be between 6 and 50 characters.');
        }
        if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/', $data['password'])) {
            throw new Exception('Password must be at least 6 characters long and include at least one letter and one number.');
        }
        // Hash the password before saving
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        return $this->dao->insert($data);
    }

    public function update($id, $data) {
        if (empty($id)) {
            throw new Exception('User ID is required for update.');
        }
        $user = $this->dao->getById($id);
        if (!$user) {
            throw new Exception('User not found.');
        }
        if (isset($data['email']) && $data['email'] !== $user['email']) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email format.');
            }
            if ($this->emailExists($data['email'])) {
                throw new Exception('Email is already in use.');
            }
        }
        if (isset($data['age']) && ($data['age'] < 18 || $data['age'] > 100)) {
            throw new Exception('User age must be between 18 and 100.');
        }
        if (isset($data['password'])) {
            if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/', $data['password'])) {
                throw new Exception('Password must be at least 6 characters long and include at least one letter and one number.');
            }
            // Hash the password before saving
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        return $this->dao->update($id, $data);
    }
    
    public function delete($id) {
        if (empty($id)) {
            throw new Exception('User ID is required for deletion.');
        }
        $user = $this->dao->getById($id);
        if (!$user) {
            throw new Exception('User not found.');
        }
        return $this->dao->delete($id);
    }

    public function getUserByEmail($email) {
        return $this->dao->getByEmail($email);
    }

    public function emailExists($email) {
        return $this->dao->emailExists($email);
    }

    public function authenticateUser($email, $password) {
        if (empty($email) || empty($password)) {
            throw new Exception('Email and password are required.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }
        if (strlen($password) < 6 || strlen($password) > 50) {
            throw new Exception('Password must be between 6 and 50 characters.');
        }
        return $this->dao->authenticateUser($email, $password);
    }
}
?>

