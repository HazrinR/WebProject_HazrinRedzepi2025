<?php
require_once __DIR__ . '/../dao/AuthDao.php'; 
require_once __DIR__ . '/BaseService.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthService extends BaseService {
    private $auth_dao;
    public function __construct() {
        $this->auth_dao = new AuthDao();
        parent::__construct(new AuthDao());
    }

    public function get_user_by_email($email){
        return $this->auth_dao->get_user_by_email($email);
    }

    public function register($entity) {   
        if (empty($entity['firstName']) || empty($entity['lastName']) || empty($entity['age']) || empty($entity['email']) || empty($entity['password'])) {
            return ['success' => false, 'error' => 'All fields are required.'];
        }

        if (!filter_var($entity['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'error' => 'Invalid email format.'];
        }

        if ($entity['age'] < 18 || $entity['age'] > 100) {
            return ['success' => false, 'error' => 'Age must be between 18 and 100.'];
        }

        if (strlen($entity['password']) < 6) {
            return ['success' => false, 'error' => 'Password must be at least 6 characters long.'];
        }

        if (!preg_match('/[A-Z]/', $entity['password']) || !preg_match('/[0-9]/', $entity['password'])) {
            return ['success' => false, 'error' => 'Password must contain at least one uppercase letter and one number.'];
        }

        $email_exists = $this->auth_dao->get_user_by_email($entity['email']);
        if ($email_exists) {
            return ['success' => false, 'error' => 'Email already registered.'];
        }

        $entity['password'] = password_hash($entity['password'], PASSWORD_BCRYPT);

        $user = [
            'firstName' => $entity['firstName'],
            'lastName' => $entity['lastName'],
            'age' => $entity['age'],
            'email' => $entity['email'],
            'password' => $entity['password']
        ];

        $this->auth_dao->insert($user);

        unset($user['password']);

        return ['success' => true, 'data' => $user];  
                   
    }

    public function login($entity) {   
        if (empty($entity['email']) || empty($entity['password'])) {
            return ['success' => false, 'error' => 'Email and password are required.'];
        }

        $user = $this->auth_dao->get_user_by_email($entity['email']);
        if(!$user){
            return ['success' => false, 'error' => 'Invalid username or password.'];
        }

        if(!$user || !password_verify($entity['password'], $user['password']))
            return ['success' => false, 'error' => 'Invalid username or password.'];

        unset($user['password']);
        // Ensure 'role' is present in JWT payload
        $jwt_payload = [
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'], // role from database
                'firstName' => $user['firstName'],
                'lastName' => $user['lastName'],
                'age' => $user['age'],
                'createdAt' => $user['createdAt'],
                'updatedAt' => $user['updatedAt']
            ],
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24)
        ];

        $token = JWT::encode(
            $jwt_payload,
            Config::JWT_SECRET(),
            'HS256'
        );

        return ['success' => true, 'data' => array_merge($user, ['token' => $token])];              
    }
}